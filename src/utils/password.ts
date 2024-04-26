import crypto from "node:crypto";

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  return `${hash.toString("hex")}.${salt}`;
};

export const isPasswordValid = (
  storedPassword: string,
  suppliedPassword: string,
) => {
  const [hashedPassword, salt] = storedPassword.split(".");
  const hashedPasswordBuffer = Buffer.from(hashedPassword, "hex");

  const encryptHash = crypto.pbkdf2Sync(
    suppliedPassword,
    salt,
    10000,
    512,
    "sha512",
  );

  if (crypto.timingSafeEqual(hashedPasswordBuffer, encryptHash)) {
    return true;
  }

  return false;
};
