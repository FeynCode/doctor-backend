const errorLocale = Object.freeze<Record<string, any>>({
  E0001: "Error.",
  E0002: "Email not found.",
  E0003: "OTP is not valid.",
  E0004: "Parameters are missing.",
  E0005: "User does not exist.",
  E0006: "Something went wrong.",
  E0007: "User already exists. Try logging in.",
  E0008: "Invalid Email. Please try again.",
  E0009: "Too many requests. Please try again later.",
  E0010: "OTP expired. Please try again.",
  E0011: "Invalid token. Please try again.",
  E0012: "Unauthorized. Please try again.",
  E0013: "Access Denied. No token provided.",
  E0014: "Access Denied. Auth token not provided.",
  E0015: "Access Denied. Refresh token not provided.",
});

export default errorLocale;
