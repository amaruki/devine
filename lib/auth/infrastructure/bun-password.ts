import type { PasswordHasher } from "../ports";

export const bunPasswordHasher: PasswordHasher = {
  async hash(password: string): Promise<string> {
    return Bun.password.hash(password, "argon2id");
  },

  async verify(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
  },
};
