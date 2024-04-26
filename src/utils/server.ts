import bcrypt from "bcryptjs";

export function passwordToSalt(password: string) {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  return hash;
}
