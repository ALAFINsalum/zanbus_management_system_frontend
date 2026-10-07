/* =========================================
   DJANGO MESSAGE SYSTEM
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const messages = document.querySelectorAll(".message-box");

    messages.forEach(function (message) {

        // Automatically close after 5 seconds
        setTimeout(function () {
            closeMessageElement(message);
        }, 5000);

    });

});


/* =========================================
   CLOSE MESSAGE FROM BUTTON
========================================= */

function closeMessage(button) {

    const message = button.closest(".message-box");

    if (!message) {
        return;
    }

    closeMessageElement(message);
}


/* =========================================
   CLOSE MESSAGE
========================================= */

function closeMessageElement(message) {

    if (message.classList.contains("closing")) {
        return;
    }

    message.classList.add("closing");

    setTimeout(function () {

        message.remove();

        // Remove container if there are no messages left
        const container =
            document.getElementById("messagesContainer");

        if (
            container &&
            container.querySelectorAll(".message-box").length === 0
        ) {
            container.remove();
        }

    }, 400);
}