let trackingWatchId = null;

function apiUrl() {
    return window.DRIVER_TRACKING_API || "/api/driver-tracking/";
}

function startTracking() {
    if (!navigator.geolocation) {
        alert("Browser yako haisapoti GPS.");
        return;
    }

    trackingWatchId = navigator.geolocation.watchPosition(
        function (position) {
            sendLocation(position.coords.latitude, position.coords.longitude, "ONLINE");
        },
        function (error) {
            console.error("GPS Error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
}

function sendLocation(latitude, longitude, status) {
    fetch(apiUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ latitude, longitude, status })
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || `Server error (${response.status})`);
            }
            return data;
        })
        .then(data => {
            if (status === "ONLINE" && data.online_started_at) {
                localStorage.setItem("zanbus_driver_session_start", data.online_started_at);
            }
            console.log("GPS imehifadhiwa:", data);
        })
        .catch(error => {
            console.error("Location sending error:", error);
            const statusMessage = document.getElementById("statusMessage");
            const locationStatus = document.getElementById("locationStatus");
            if (statusMessage) statusMessage.textContent = "Server haijapokea GPS";
            if (locationStatus) {
                locationStatus.textContent = `Location error: ${error.message}`;
                locationStatus.classList.remove("active");
            }
        });
}

function stopTracking() {
    if (trackingWatchId !== null) {
        navigator.geolocation.clearWatch(trackingWatchId);
        trackingWatchId = null;
    }
    sendOfflineStatus();
}

function sendOfflineStatus() {
    fetch(apiUrl(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: JSON.stringify({ status: "OFFLINE", latitude: null, longitude: null })
    })
        .then(response => response.json())
        .then(data => console.log("Driver OFFLINE:", data))
        .catch(error => console.error("Offline status error:", error));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
    
