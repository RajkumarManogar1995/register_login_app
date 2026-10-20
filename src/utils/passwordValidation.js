export const validateNewPassword = (password) => {
  if (Array.from(password).length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (new TextEncoder().encode(password).length > 72) {
    return "Password must be no more than 72 UTF-8 bytes.";
  }

  return "";
};
