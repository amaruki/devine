"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAccount, type AuthActionState } from "../actions";

const idleAuthState: AuthActionState = { status: "idle", message: "" };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAccount, idleAuthState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-6"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="register-username">
          Username
        </label>
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50"
          id="register-username"
          name="username"
          aria-label="Username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          pattern="[A-Za-z0-9][A-Za-z0-9_]{2,23}"
        />
      </div>
      <p className="text-sm text-slate-400">
        3-24 letters, numbers, or underscores. Reserved route names are blocked.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="register-email">
          Email optional
        </label>
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50"
          id="register-email"
          name="email"
          aria-label="Email"
          type="email"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="register-password">
          Password
        </label>
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50"
          id="register-password"
          name="password"
          aria-label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <p className="text-sm text-slate-400">
        At least 8 characters with uppercase, lowercase, number, and symbol characters.
      </p>
      <input name="timezone" type="hidden" value="UTC" />
      {state.status === "error" ? (
        <p
          className="rounded-xl border border-rose-900 bg-rose-950 px-4 py-3 text-sm text-rose-100"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
      <Link className="text-sm font-semibold text-cyan-300" href="/auth/login">
        Already have an account?
      </Link>
    </form>
  );
}
