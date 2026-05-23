import type { NextRequest } from "next/server";

export type CreateShareSnapshotPlaceholderResponse = {
  status: "not_implemented";
  message: string;
};

export async function POST(_request: NextRequest) {
  return Response.json(
    {
      status: "not_implemented",
      message: "Share snapshot creation contract is not specified yet.",
    } satisfies CreateShareSnapshotPlaceholderResponse,
    { status: 501 },
  );
}
