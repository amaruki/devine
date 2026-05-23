import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, sessionCookieName, type AuthContext } from "@/lib/auth";

export async function requireUser(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const context = await getCurrentUser(cookieStore.get(sessionCookieName)?.value);
  if (!context) {
    redirect("/auth/login");
  }
  return context;
}

export async function requireSuperadmin(): Promise<AuthContext> {
  const context = await requireUser();
  if (context.role !== "superadmin") {
    redirect("/dashboard");
  }
  return context;
}
