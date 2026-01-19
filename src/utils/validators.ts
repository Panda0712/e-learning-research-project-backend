export const FIELD_REQUIRED_MESSAGE = "Required to enter this field.";

export const EMAIL_RULE = /^\S+@\S+\.\S+$/;
export const EMAIL_RULE_MESSAGE = "Error email. (example@gmail.com)";

export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/;
export const PASSWORD_RULE_MESSAGE =
  "Password has to be at least 1 character, 1 number and 8 characters min.";
export const PASSWORD_CONFIRMATION_MESSAGE = "Confirm password not match!";

export const PHONE_RULE =
  /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])[0-9]{7}$/;
export const PHONE_RULE_MESSAGE =
  "Invalid phone number! Please enter a valid phone number!";

export const LIMIT_COMMON_FILE_SIZE = 10485760; // byte = 10 MB
export const ALLOW_COMMON_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png"];
