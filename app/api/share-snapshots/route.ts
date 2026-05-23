import { requireUser } from "@/app/auth/require-user";
import { createShareSnapshot, softDeleteShareSnapshot } from "@/lib/share";
import { z } from "zod";

const createShareSnapshotRequestSchema = z.object({}).strict();
const deleteShareSnapshotRequestSchema = z.object({
  publicId: z.string().min(1),
});

export type CreateShareSnapshotResponse =
  | {
      publicId: string;
      url: string;
    }
  | {
      status: "error";
      message: string;
    };

export type DeleteShareSnapshotResponse =
  | {
      status: "deleted";
    }
  | {
      status: "not_found";
    }
  | {
      status: "error";
      message: string;
    };

export async function POST(request: Request) {
  const parsed = createShareSnapshotRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { status: "error", message: "Invalid request body" } satisfies CreateShareSnapshotResponse,
      { status: 400 },
    );
  }

  const context = await requireUser();
  const result = await createShareSnapshot(context.userId);

  return Response.json({
    publicId: result.publicId,
    url: result.url,
  } satisfies CreateShareSnapshotResponse);
}

export async function DELETE(request: Request) {
  const parsed = deleteShareSnapshotRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { status: "error", message: "Invalid request body" } satisfies DeleteShareSnapshotResponse,
      { status: 400 },
    );
  }

  const context = await requireUser();
  const result = await softDeleteShareSnapshot(context.userId, parsed.data.publicId);

  if (result.status === "not_found") {
    return Response.json({ status: "not_found" } satisfies DeleteShareSnapshotResponse, {
      status: 404,
    });
  }

  return Response.json({ status: "deleted" } satisfies DeleteShareSnapshotResponse);
}
