let map;
let userMarker;
let busMarkers = {};
let busInfoWindows = {};

let userLatitude = null;

let userLongitude = null;

// View ya kuanzia hutumika pale browser haijatoa ruhusa ya location.
const DEFAULT_MAP_LOCATION = [-6.1659, 39.2026];



// =====================================================
// INITIALIZE MAP
// =====================================================

function initializeMap(latitude, longitude, showUserMarker = false) {
    if (!window.google || !google.maps) {
        document.getElementById("userLocation").textContent =
            "Google Map inaonekana, lakini API key haijawekwa; live bus markers zitasubiri API key.";
        return;
    }

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: latitude, lng: longitude },
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
    });

    const fallback = document.getElementById("googleMapFallback");
    if (fallback) {
        fallback.remove();
    }

    if (showUserMarker) {
        setUserMarker(latitude, longitude);
    }

}

function setUserMarker(latitude, longitude) {
    const position = { lat: latitude, lng: longitude };

    if (!userMarker) {
        userMarker = new google.maps.Marker({
            position,
            map,
            title: "Upo hapa sasa",
            label: "U"
        });
    } else {
        userMarker.setPosition(position);
    }

}

function updateFallbackMap(latitude, longitude) {
    const fallback = document.getElementById("googleMapFallback");
    if (fallback) {
        fallback.src = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
    }
}



// =====================================================
// GET USER LOCATION
// =====================================================

function getUserLocation() {

    // Anzisha map na load mabasi hata kama user amekataa GPS.
    if (!map) {
        initializeMap(
            DEFAULT_MAP_LOCATION[0],
            DEFAULT_MAP_LOCATION[1]
        );
    }

    loadLiveBuses();

    if (!navigator.geolocation) {

        document.getElementById(
            "userLocation"
        ).textContent =
            "Browser yako hai-support location. Mabasi bado yanaonyeshwa kwenye map.";

        return;

    }


    navigator.geolocation.watchPosition(

        function(position) {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;

            updateFallbackMap(userLatitude, userLongitude);


            document.getElementById(
                "userLocation"
            ).textContent =
                `${userLatitude.toFixed(6)},
                 ${userLongitude.toFixed(6)}`;


            // FIRST MAP LOAD

            if (!map) {
                initializeMap(userLatitude, userLongitude, true);
            } else if (!userMarker) {
                setUserMarker(userLatitude, userLongitude);
                map.setCenter({ lat: userLatitude, lng: userLongitude });
                map.setZoom(15);
            } else {
                setUserMarker(userLatitude, userLongitude);

            }


            // GET BUSES

            loadLiveBuses();

        },


        function(error) {

            console.log(
                "Location error:",
                error
            );

            let message = "Location imezuiwa. Ruhusu location kwenye browser ili kuona umbali wako.";

            if (error.code === 1) {
                message = "Access ya location imezuiwa. Bonyeza alama ya lock kwenye address bar, ruhusu Location, kisha refresh ukurasa.";
            } else if (error.code === 2) {
                message = "Location haikupatikana. Mabasi bado yanaonyeshwa kwenye map.";
            } else if (error.code === 3) {
                message = "Location imechukua muda mrefu. Mabasi bado yanaonyeshwa kwenye map.";
            }

            document.getElementById("userLocation").textContent = message;
            loadLiveBuses();

        },


        {

            enableHighAccuracy: true,

            maximumAge: 5000,

            timeout: 10000

        }

    );

}



// =====================================================
// LOAD LIVE BUSES
// =====================================================

async function loadLiveBuses() {

    try {

        const response =
            await fetch(LIVE_BUS_API);


        const data =
            await response.json();


        const buses = data.buses || [];
        const withoutLocation = data.without_location || [];
        const trackingStatus = document.getElementById("trackingStatus");


        document.getElementById(
            "busCount"
        ).textContent =
            data.online_count ?? buses.length;

        if (trackingStatus) {
            if (buses.length > 0) {
                trackingStatus.textContent = `${buses.length} bus inatumia GPS live.`;
            } else if (withoutLocation.length > 0) {
                trackingStatus.textContent = `${withoutLocation.length} bus iko ONLINE lakini haijatuma GPS.`;
            } else {
                trackingStatus.textContent = "Hakuna driver aliye ONLINE kwa sasa.";
            }
        }


        updateBusMarkers(buses);

        updateBusList(buses, withoutLocation);


    } catch(error) {

        console.error(
            "Bus API error:",
            error
        );

    }

}



// =====================================================
// UPDATE BUS MARKERS
// =====================================================

function updateBusMarkers(buses) {

    if (!map || !window.google || !google.maps) {
        return;
    }

    const activeBusIds =
        new Set();


    buses.forEach(bus => {


        activeBusIds.add(
            bus.id
        );


        const position = {
            lat: bus.latitude,
            lng: bus.longitude
        };


        // DISTANCE

        let distance = null;


        if (
            userLatitude !== null &&
            userLongitude !== null
        ) {

            distance =
                calculateDistance(
                    userLatitude,
                    userLongitude,
                    bus.latitude,
                    bus.longitude
                );

        }


        // EXISTING MARKER

        if (busMarkers[bus.id]) {

            busMarkers[bus.id].setPosition(position);


        } else {


            busMarkers[bus.id] = new google.maps.Marker({
                position,
                map,
                title: `Bus ${bus.name}`,
                label: "B"
            });
            busInfoWindows[bus.id] = new google.maps.InfoWindow();

            busMarkers[bus.id].addListener("click", function () {
                busInfoWindows[bus.id].setContent(busMarkers[bus.id].popupContent);
                busInfoWindows[bus.id].open({
                    map,
                    anchor: busMarkers[bus.id]
                });
            });

        }

        busMarkers[bus.id].popupContent = `
            <strong>🚌 ZANBUS</strong><br>
            Driver: ${bus.name}<br>
            Basi: ${bus.plate_no || "Haijawekwa"}<br>
            Status: 🟢 ONLINE<br>
            Distance: ${distance !== null ? distance.toFixed(2) + " km" : "..."}
        `;

    });



    // REMOVE OFFLINE BUSES

    Object.keys(busMarkers).forEach(
        id => {

            if (
                !activeBusIds.has(
                    Number(id)
                )
            ) {

                busMarkers[id].setMap(null);

                delete busMarkers[id];
                delete busInfoWindows[id];

            }

        }
    );

}



// =====================================================
// BUS LIST
// =====================================================

function updateBusList(buses, withoutLocation = []) {

    const container =
        document.getElementById(
            "busList"
        );


    if (buses.length === 0 && withoutLocation.length === 0) {

        container.innerHTML = `
            <p class="loading">
                Hakuna basi lililo ONLINE kwa sasa.
            </p>
        `;

        return;

    }


    container.innerHTML = "";

    withoutLocation.forEach(bus => {
        const unavailableCard = document.createElement("div");
        unavailableCard.className = "bus-card";
        unavailableCard.innerHTML = `
            <div>
                <div class="bus-name">🚌 ${bus.name}</div>
                <div class="bus-online">ONLINE, lakini GPS haijapatikana</div>
            </div>
            <div class="distance">Location inasubiriwa</div>
        `;
        container.appendChild(unavailableCard);
    });


    buses.forEach(bus => {


        let distanceText =
            "...";


        if (
            userLatitude !== null &&
            userLongitude !== null
        ) {

            const distance =
                calculateDistance(
                    userLatitude,
                    userLongitude,
                    bus.latitude,
                    bus.longitude
                );


            distanceText =
                distance.toFixed(2) + " km";

        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "bus-card";


        card.innerHTML = `

            <div>

                <div class="bus-name">

                    🚌 ${bus.name}

                </div>

                <div class="bus-online">

                    ● ONLINE · ${bus.plate_no || "Namba haijawekwa"}

                </div>

            </div>


            <div class="distance">

                ${distanceText}

            </div>

        `;


        container.appendChild(
            card
        );

    });

}



// =====================================================
// DISTANCE CALCULATOR
// =====================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;


    const dLat =
        toRadians(lat2 - lat1);


    const dLon =
        toRadians(lon2 - lon1);


    const a =

        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

        +

        Math.cos(
            toRadians(lat1)
        )

        *

        Math.cos(
            toRadians(lat2)
        )

        *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;

}



function toRadians(degrees) {

    return degrees *
        Math.PI /
        180;

}



// =====================================================
// START
// =====================================================

getUserLocation();



// REFRESH BUS LOCATIONS
// EVERY 7 SECONDS

setInterval(
    loadLiveBuses,
    7000
);