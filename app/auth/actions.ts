"use server";

export type AuthActionResult = {
  status: "not_implemented";
  message: string;
};

export async function registerAccount(): Promise<AuthActionResult> {
  return {
    status: "not_implemented",
    message: "Registration will be implemented in Sprint 1.",
  };
}

export async function loginAccount(): Promise<AuthActionResult> {
  return {
    status: "not_implemented",
    message: "Login will be implemented in Sprint 1.",
  };
}

export async function logoutAccount(): Promise<AuthActionResult> {
  return {
    status: "not_implemented",
    message: "Logout will be implemented in Sprint 1.",
  };
}
