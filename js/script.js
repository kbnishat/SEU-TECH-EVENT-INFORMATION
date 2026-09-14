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
var savedRegistration = document.getElementById("savedRegistration");
var savedRegistrationMessage = document.getElementById("savedRegistrationMessage");
var jsonPreview = document.getElementById("jsonPreview");

var errorFields = {
    fullname: document.getElementById("fullnameError"),
    studentid: document.getElementById("studentidError"),
    email: document.getElementById("emailError"),
    prefdate: document.getElementById("prefdateError"),
    daypreference: document.getElementById("daypreferenceError")
};

function clearValidationMessages() {
    Object.keys(errorFields).forEach(function (fieldName) {
        errorFields[fieldName].textContent = "";
    });
}

function validateRegistration() {
    clearValidationMessages();
    var isValid = true;
    var formData = new FormData(registrationForm);
    var requiredFields = ["fullname", "studentid", "email", "prefdate"];

    requiredFields.forEach(function (fieldName) {
        if (!String(formData.get(fieldName) || "").trim()) {
            errorFields[fieldName].textContent = "This field is required.";
            isValid = false;
        }
    });

    if (formData.get("email") && !registrationForm.elements.email.validity.valid) {
        errorFields.email.textContent = "Enter a valid email address.";
        isValid = false;
    }

    if (!formData.get("daypreference")) {
        errorFields.daypreference.textContent = "Choose at least one attendance option.";
        isValid = false;
    }

    return isValid;
}

function readRegistrationObject() {
    var formData = new FormData(registrationForm);
    return {
        fullName: String(formData.get("fullname")).trim(),
        studentId: String(formData.get("studentid")).trim(),
        email: String(formData.get("email")).trim(),
        preferredDate: formData.get("prefdate"),
        dayPreference: formData.get("daypreference"),
        sessions: formData.getAll("sessions")
    };
}

function saveRegistration(registration) {
    var registrationJson = JSON.stringify(registration, null, 2);
    localStorage.setItem("seuTechRegistration", registrationJson);
    var restoredRegistration = JSON.parse(localStorage.getItem("seuTechRegistration"));
    savedRegistrationMessage.textContent = "The registration object was converted to JSON, saved, and parsed back successfully.";
    jsonPreview.textContent = JSON.stringify(restoredRegistration, null, 2);
    savedRegistration.hidden = false;
}

function loadSavedRegistration() {
    var savedJson = localStorage.getItem("seuTechRegistration");
    if (!savedJson) {
        return;
    }

    try {
        var savedData = JSON.parse(savedJson);
        savedRegistrationMessage.textContent = "A saved registration was retrieved from localStorage.";
        jsonPreview.textContent = JSON.stringify(savedData, null, 2);
        savedRegistration.hidden = false;
    } catch (error) {
        localStorage.removeItem("seuTechRegistration");
    }
}

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

    if (!validateRegistration()) {
        registrationStatus.textContent = "Please correct the highlighted fields before submitting.";
        registrationStatus.className = "status-error";
        return;
    }

    var registration = readRegistrationObject();
    saveRegistration(registration);
    registrationStatus.textContent = "Registration accepted. Your practice data is saved in this browser.";
    registrationStatus.className = "status-success";
    modalMessage.textContent = "Thank you, " + registration.fullName + "! Your registration has been submitted successfully.";

    successModal.hidden = false;
    closeModalButton.focus();
});

registrationForm.addEventListener("reset", function () {
    clearValidationMessages();
    registrationStatus.textContent = "Registration status will appear here.";
    registrationStatus.className = "";
});

function closeSuccessModal() {
    successModal.hidden = true;
}

closeModalButton.addEventListener("click", closeSuccessModal);
modalDoneButton.addEventListener("click", closeSuccessModal);
loadSavedRegistration();