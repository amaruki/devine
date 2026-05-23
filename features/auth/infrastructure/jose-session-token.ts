import { SignJWT, jwtVerify } from "jose";
import { isUserRole, type SessionClaims, type UnsignedSessionClaims } from "../domain";
import type { SessionTokenService } from "../application/ports";

export function createJoseSessionTokenService(secret: Uint8Array): SessionTokenService {
  return {
    async sign(claims: UnsignedSessionClaims, expiresAt: Date): Promise<string> {
      return new SignJWT(claims)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .sign(secret);
    },

    async verify(token: string): Promise<SessionClaims | null> {
      try {
        const verified = await jwtVerify(token, secret);
        const payload = verified.payload;
        if (
          typeof payload.userId !== "string" ||
          typeof payload.username !== "string" ||
          !isUserRole(payload.role) ||
          typeof payload.sessionId !== "string" ||
          typeof payload.tokenVersion !== "number"
        ) {
          return null;
        }
        return {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
          sessionId: payload.sessionId,
          tokenVersion: payload.tokenVersion,
          iat: typeof payload.iat === "number" ? payload.iat : undefined,
          exp: typeof payload.exp === "number" ? payload.exp : undefined,
        };
      } catch {
        return null;
      }
    },
  };
}
