const selectors = {
  loginForm: {
    emailInput: "#input-email",
    passwordInput: "#input-password",
    submitButton: '.btn[value="Login"]',
    errorElement: ".alert.alert-danger",
    errorMessage: " Warning: No match for E-Mail Address and/or Password.",
  },
  dashboard: {
    title: "My Account",
  },
};

module.exports = selectors;
