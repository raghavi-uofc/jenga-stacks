export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-=/\\|]).{7,}$/;

export const isValidPassword = (password) => {
  return passwordPattern.test(password);
};
