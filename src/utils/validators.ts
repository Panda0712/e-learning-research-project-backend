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

export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_SIZE_GB = 4;
export const MIN_VIDEO_HEIGHT = 720;
export const MIN_VIDEO_CHECK_SIZE = 70 * 1024 * 1024; // 70MB;

export const ALLOW_IMAGE_TYPES = ["image/jpg", "image/jpeg", "image/png"];
export const ALLOW_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ALLOW_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
