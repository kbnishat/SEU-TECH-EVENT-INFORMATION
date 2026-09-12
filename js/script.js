var availableSeats = 25;

var fullnameInput = document.getElementById("fullname");
var registrationStatus = document.getElementById("registrationStatus");
var seatStatus = document.getElementById("seatStatus");
var checkRegistrationButton = document.getElementById("checkRegistrationButton");
var checkSeatsButton = document.getElementById("checkSeatsButton");
var registrationForm = document.getElementById("registrationForm");
var successModal = document.getElementById("successModal");
var modalMessage = document.getElementById("modalMessage");
var closeModalButton = document.getElementById("closeModalButton");
var modalDoneButton = document.getElementById("modalDoneButton");

checkRegistrationButton.addEventListener("click", function () {
    var name = fullnameInput.value.trim();

    if (name === "") {
        registrationStatus.textContent = "Please enter your full name to check your registration status.";
    } else {
        registrationStatus.textContent = "Hello, " + name + "! Your registration is ready to be confirmed.";
    }
});

checkSeatsButton.addEventListener("click", function () {
    if (availableSeats > 0) {
        seatStatus.textContent = "Seats are available. There are " + availableSeats + " seats remaining.";
    } else {
        seatStatus.textContent = "Sorry, no seats are currently available.";
    }
});

registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
    }

    var name = fullnameInput.value.trim();
    if (name === "") {
        modalMessage.textContent = "Please enter your full name before submitting your registration.";
    } else {
        modalMessage.textContent = "Thank you, " + name + "! Your registration has been submitted successfully.";
    }

    successModal.hidden = false;
    closeModalButton.focus();
});

function closeSuccessModal() {
    successModal.hidden = true;
}

closeModalButton.addEventListener("click", closeSuccessModal);
modalDoneButton.addEventListener("click", closeSuccessModal);