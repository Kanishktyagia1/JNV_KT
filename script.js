const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}

const signupBtn = document.getElementById("signupBtn");
const heroSignupBtn = document.getElementById("heroSignupBtn");

function openSignupPage() {
    window.location.href = "signup.html";
}

if (signupBtn) {
    signupBtn.addEventListener("click", openSignupPage);
}

if (heroSignupBtn) {
    heroSignupBtn.addEventListener("click", openSignupPage);
}

const tutorialBtn = document.getElementById("tutorialBtn");

if (tutorialBtn) {
    tutorialBtn.addEventListener("click", function () {
        document.getElementById("tutorials").scrollIntoView({
            behavior: "smooth"
        });
    });
}