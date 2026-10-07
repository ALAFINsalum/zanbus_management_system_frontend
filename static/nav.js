
document.addEventListener("DOMContentLoaded", function () {


    /* =================================================
       GET ELEMENTS
    ================================================= */

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("overlay");

    const closeBtn =
        document.getElementById("closeBtn");



    /* =================================================
       OPEN SIDEBAR
    ================================================= */

    menuBtn.addEventListener("click", function () {

        sidebar.classList.add("active");

        overlay.classList.add("active");

    });



    /* =================================================
       CLOSE SIDEBAR
    ================================================= */

    closeBtn.addEventListener("click", function () {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

    });



    /* =================================================
       CLOSE BY CLICKING OUTSIDE
    ================================================= */

    overlay.addEventListener("click", function () {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

    });



    /* =================================================
       CLOSE AFTER CLICKING MENU LINK
    ================================================= */

    const navLinks =
        document.querySelectorAll(".nav-links a");


    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            sidebar.classList.remove("active");

            overlay.classList.remove("active");

        });

    });


});
