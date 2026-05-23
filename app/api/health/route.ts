import { getHealth } from "@/features/operations/application/health";

export async function GET() {
  return Response.json(await getHealth());
}
