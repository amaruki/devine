export {
  authError,
  isUserRole,
  normalizeEmail,
  normalizeUsername,
  sessionCookieName,
  sessionDurationSeconds,
  validatePassword,
  validateUsername,
} from "./domain";
export type {
  AuthContext,
  AuthErrorCode,
  AuthResult,
  AuthSuccess,
  LoginInput,
  RegisterUserInput,
  SessionClaims,
  UnsignedSessionClaims,
  UserRole,
} from "./domain";
export {
  getCurrentUser,
  isSecureSessionCookie,
  loginUser,
  logoutUser,
  registerUser,
} from "./infrastructure/service";
