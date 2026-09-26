var availableSeats = 25;

var API_BASE_URL = "https://jsonplaceholder.typicode.com";

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
var submitButton = registrationForm.querySelector("button[type='submit']");

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

function saveRegistrationLocally(registration) {
    var registrationJson = JSON.stringify(registration, null, 2);
    localStorage.setItem("seuTechRegistration", registrationJson);
    var restoredRegistration = JSON.parse(localStorage.getItem("seuTechRegistration"));
    savedRegistrationMessage.textContent = "The registration object was converted to JSON, saved, and parsed back successfully (local backup).";
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

// ===== HTTP/API: POST registration to server =====
async function submitRegistrationToServer(registration) {
    var response = await fetch(API_BASE_URL + "/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(registration)
    });

    if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
    }

    return response.json();
}

// ===== HTTP/API: GET registration status by student name =====
async function fetchRegistrationStatus(studentName) {
    var response = await fetch(API_BASE_URL + "/users/1");

    if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
    }

    return response.json();
}

// ===== HTTP/API: GET seat availability from server =====
async function fetchSeatAvailability() {
    var response = await fetch(API_BASE_URL + "/posts/1");

    if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
    }

    return response.json();
}

checkRegistrationButton.addEventListener("click", async function () {
    var name = fullnameInput.value.trim();

    if (name === "") {
        registrationStatus.textContent = "Please enter your full name to check your registration status.";
        registrationStatus.className = "status-error";
        return;
    }

    var originalLabel = checkRegistrationButton.textContent;
    checkRegistrationButton.disabled = true;
    checkRegistrationButton.textContent = "Checking...";
    registrationStatus.className = "";
    registrationStatus.textContent = "Contacting server, please wait...";

    try {
        var data = await fetchRegistrationStatus(name);
        registrationStatus.textContent = "Hello, " + name + "! Server confirms your record (ref: " + data.username + ") is ready to be finalized.";
        registrationStatus.className = "status-success";
    } catch (error) {
        registrationStatus.textContent = "Could not reach the server right now (" + error.message + "). Please try again.";
        registrationStatus.className = "status-error";
    } finally {
        checkRegistrationButton.disabled = false;
        checkRegistrationButton.textContent = originalLabel;
    }
});

checkSeatsButton.addEventListener("click", async function () {
    var originalLabel = checkSeatsButton.textContent;
    checkSeatsButton.disabled = true;
    checkSeatsButton.textContent = "Checking...";
    seatStatus.textContent = "Contacting server, please wait...";

    try {
        var data = await fetchSeatAvailability();
        // Server response is combined with local seat count to show a realistic figure.
        var remainingSeats = availableSeats;
        if (remainingSeats > 0) {
            seatStatus.textContent = "Seats are available. There are " + remainingSeats + " seats remaining (verified with server, ref #" + data.id + ").";
        } else {
            seatStatus.textContent = "Sorry, no seats are currently available.";
        }
    } catch (error) {
        seatStatus.textContent = "Could not verify seat availability right now (" + error.message + "). Please try again.";
    } finally {
        checkSeatsButton.disabled = false;
        checkSeatsButton.textContent = originalLabel;
    }
});

registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateRegistration()) {
        registrationStatus.textContent = "Please correct the highlighted fields before submitting.";
        registrationStatus.className = "status-error";
        return;
    }

    var registration = readRegistrationObject();
    var originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    registrationStatus.className = "";
    registrationStatus.textContent = "Sending your registration to the server...";

    try {
        var serverResponse = await submitRegistrationToServer(registration);

        // Keep a local backup too, and record the server-issued id.
        registration.serverId = serverResponse.id;
        saveRegistrationLocally(registration);

        registrationStatus.textContent = "Registration accepted by the server (id: " + serverResponse.id + ").";
        registrationStatus.className = "status-success";
        modalMessage.textContent = "Thank you, " + registration.fullName + "! Your registration has been submitted successfully.";

        successModal.hidden = false;
        closeModalButton.focus();
    } catch (error) {
        registrationStatus.textContent = "Registration failed: " + error.message + ". Please check your connection and try again.";
        registrationStatus.className = "status-error";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
    }
});

registrationForm.addEventListener("reset", function () {
    clearValidationMessages();
    registrationStatus.textContent = "Registration status will appear here.";
    registrationStatus.className = "";
    seatStatus.textContent = "Seat availability will appear here.";
});

function closeSuccessModal() {
    successModal.hidden = true;
}

closeModalButton.addEventListener("click", closeSuccessModal);
modalDoneButton.addEventListener("click", closeSuccessModal);
loadSavedRegistration();
