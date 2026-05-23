import { z } from "zod";

export const resetStateRequestSchema = z.object({
  seed: z.enum(["dev", "qa"]),
});

export type ResetStateRequest = z.infer<typeof resetStateRequestSchema>;

export type ResetStateResponse = {
  status: "ok";
  seed: ResetStateRequest["seed"];
  resetAt: string;
};

export async function resetState(input: ResetStateRequest): Promise<ResetStateResponse> {
  return {
    status: "ok",
    seed: input.seed,
    resetAt: new Date().toISOString(),
  };
}
