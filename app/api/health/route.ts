import { getHealth } from "@/lib/operations/health";

export async function GET() {
  return Response.json(await getHealth());
}
