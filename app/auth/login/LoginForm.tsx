"use client";

import Link from "next/link";
import { useActionState } from "react";
import { getIdleAuthState, loginAccount } from "../actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAccount, getIdleAuthState());

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-6"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="login-username">
          Username
        </label>
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50"
          id="login-username"
          name="username"
          aria-label="Username"
          autoComplete="username"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-200" htmlFor="login-password">
          Password
        </label>
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-50"
          id="login-password"
          name="password"
          aria-label="Password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
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
        {pending ? "Logging in..." : "Log in"}
      </button>
      <Link className="text-sm font-semibold text-cyan-300" href="/auth/register">
        Need an account?
      </Link>
    </form>
  );
}
