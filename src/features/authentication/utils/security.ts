import crypto from "node:crypto";
import { eq, or } from "drizzle-orm";
import { db } from "@database/postgres";
import { users } from "@database/schema";

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
  return `${hash.toString("hex")}.${salt}`;
};

const validatePassword = (storedPassword: string, suppliedPassword: string) => {
  const [hashedPassword, salt] = storedPassword.split(".");
  const hashedPasswordBuffer = Buffer.from(hashedPassword, "hex");
  const encryptHash = crypto.pbkdf2Sync(
    suppliedPassword,
    salt,
    10000,
    512,
    "sha512",
  );
  return crypto.timingSafeEqual(hashedPasswordBuffer, encryptHash);
};

export const authorize = async (identity: string, password: string) => {
  const user = await db.query.users.findFirst({
    where: or(eq(users.email, identity), eq(users.username, identity)),
    with: {
      profile: {
        columns: {
          image: true,
        },
      },
    },
  });
  if (!user) return false;

  const passwordValidated = validatePassword(user.password, password);
  if (!passwordValidated) return false;

  return user;
};
