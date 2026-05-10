"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginWithPasswordAction,
  type LoginActionState,
} from "./actions";

const initialState: LoginActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Wird angemeldet…" : "Anmelden"}
    </button>
  );
}

export function LoginForm({
  locale,
  from,
}: {
  locale: string;
  from?: string;
}) {
  const [state, formAction] = useActionState(
    loginWithPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="from" value={from ?? ""} />

      <div className="field">
        <label
          htmlFor="admin-email"
          className="kicker mb-2"
        >
          E-Mail
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={state.field === "email" ? true : undefined}
        />
      </div>

      <div className="field">
        <label
          htmlFor="admin-password"
          className="kicker mb-2"
        >
          Passwort
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.field === "password" ? true : undefined}
        />
      </div>

      {state.message ? (
        <p
          role="alert"
          className="text-xs text-[color:var(--gold-soft)]"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-[11px] leading-relaxed text-[color:var(--muted-cream)]">
        Zugang nur für aktive Admins. Owner richten neue Accounts über die
        Supabase-Konsole + <code>admin_profiles</code> ein. Siehe{" "}
        <code>docs/admin-setup.md</code>.
      </p>
    </form>
  );
}
