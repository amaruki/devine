import { requireUser } from "../auth/require-user";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
