export type DependencyStatus = {
  status: "ok" | "degraded";
  latencyMs?: number;
  checked?: boolean;
  reason?: string;
};

export type HealthResponse = {
  status: "ok" | "degraded";
  dependencies: {
    database: DependencyStatus;
    dailydev: DependencyStatus;
  };
  version: string;
};

export async function getHealth(): Promise<HealthResponse> {
  return {
    status: "ok",
    dependencies: {
      database: { status: "ok", latencyMs: 0 },
      dailydev: { status: "degraded", checked: false, reason: "not checked without user token" },
    },
    version: "0.1.0",
  };
}
