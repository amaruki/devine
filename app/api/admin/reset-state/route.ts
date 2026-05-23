import { resetState, resetStateRequestSchema } from "@/features/operations/application/reset-state";

function isResetApiEnabled() {
  return process.env.APP_ENV !== "production" && process.env.ENABLE_RESET_API === "true";
}

function isAuthorized(request: Request) {
  const secret = process.env.RESET_STATE_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isResetApiEnabled()) {
    return Response.json({ status: "not_found" }, { status: 404 });
  }

  if (!isAuthorized(request)) {
    return Response.json({ status: "unauthorized" }, { status: 401 });
  }

  const parsed = resetStateRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ status: "error", message: "Invalid request body" }, { status: 400 });
  }

  return Response.json(await resetState(parsed.data));
}
