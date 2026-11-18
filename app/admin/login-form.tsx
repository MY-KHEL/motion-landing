"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import type { ActionResult } from "@/lib/types";

const initial: ActionResult = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form
      action={action}
      className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5"
    >
      <p className="text-[11px] font-semibold tracking-[0.22em] text-blue-soft">
        MOTION DESIGNER
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Studio</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Sign in to publish the films that play in Selected work.
      </p>
      <label className="mt-8 text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-2 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-blue"
      />
      {state.error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="press mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-black disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
