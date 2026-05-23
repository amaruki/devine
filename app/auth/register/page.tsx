import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <p className="text-sm tracking-[0.3em] text-cyan-300 uppercase">Devine</p>
      <h1 className="text-4xl font-bold">Create account</h1>
      <p className="text-slate-300">
        Start with username and password. Email is optional until account recovery ships.
      </p>
      <RegisterForm />
    </main>
  );
}
