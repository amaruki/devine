import { randomBytes } from "node:crypto";

const publicIdPrefix = "devine_";

export function createPublicShareId(): string {
  return `${publicIdPrefix}${randomBytes(9).toString("base64url")}`;
}

export function isPublicShareId(value: string): boolean {
  return /^devine_[A-Za-z0-9_-]+$/.test(value);
}
