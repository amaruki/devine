import { validateDailyDevToken } from "@/features/dailydev";
import { z } from "zod";

const requestSchema = z.object({
  token: z.string().min(1),
});

export type TestConnectionResponse =
  | {
      status: "ok";
      profile: Awaited<ReturnType<typeof validateDailyDevToken>>;
    }
  | {
      status: "error";
      message: string;
    };

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { status: "error", message: "Invalid request body" } satisfies TestConnectionResponse,
      { status: 400 },
    );
  }

  const profile = await validateDailyDevToken(parsed.data.token);
  return Response.json({ status: "ok", profile } satisfies TestConnectionResponse);
}
