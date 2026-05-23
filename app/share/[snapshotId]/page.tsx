export default async function ShareSnapshotPage({
  params,
}: {
  params: Promise<{ snapshotId: string }>;
}) {
  const { snapshotId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold">Share snapshot stub</h1>
      <p className="text-slate-300">Public snapshot: {snapshotId}</p>
    </main>
  );
}
