import type { DailyDevPost, DailyDevProfile } from "../domain/types";

export async function validateDailyDevToken(token: string): Promise<DailyDevProfile> {
  if (token.trim().length === 0) {
    throw new Error("daily.dev token is required");
  }

  return { id: "stub-profile", handle: "stub" };
}

export async function fetchDailyDevProfile(token: string): Promise<DailyDevProfile> {
  return validateDailyDevToken(token);
}

export async function fetchDailyDevFeed(_token: string): Promise<DailyDevPost[]> {
  return [];
}

export async function fetchDailyDevBookmarks(_token: string): Promise<DailyDevPost[]> {
  return [];
}
