"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  isSecureSessionCookie,
  loginUser,
  logoutUser,
  registerUser,
  sessionCookieName,
  type AuthErrorCode,
  type AuthSuccess,
} from "@/features/auth";

export type AuthActionState = {
  status: "idle" | "error";
  message: string;
  code?: AuthErrorCode;
};

export async function registerAccount(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await registerUser({
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    timezone: String(formData.get("timezone") ?? "UTC"),
  });
  if (result.status === "error") {
    return { status: "error", message: result.message, code: result.code };
  }
  await setSessionCookie(result);
  redirect(result.redirectTo);
}

export async function loginAccount(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = await loginUser({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (result.status === "error") {
    return { status: "error", message: result.message, code: result.code };
  }
  await setSessionCookie(result);
  redirect(result.redirectTo);
}

export async function logoutAccount(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  await logoutUser(token);
  cookieStore.delete(sessionCookieName);
  redirect("/");
}

async function setSessionCookie(result: AuthSuccess): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, result.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureSessionCookie(),
    expires: result.expiresAt,
    path: "/",
  });
}
