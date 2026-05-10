"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  changePasswordAction,
  type ChangePasswordState,
} from "./actions";

const PASSWORD_MIN_LENGTH = 12;
const initialState: ChangePasswordState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary w-full"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Wird gesetzt…" : "Neues Passwort speichern"}
    </button>
  );
}

export function PasswordForm({ locale }: { locale: string }) {
  const [state, formAction] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      <div className="field">
        <label htmlFor="admin-new-password" className="kicker mb-2">
          Neues Passwort
        </label>
        <input
          id="admin-new-password"
          name="password"
          type="password"
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          required
          aria-invalid={state.field === "password" ? true : undefined}
          aria-describedby="admin-password-hint"
        />
        <p
          id="admin-password-hint"
          className="mt-2 text-[11px] leading-relaxed text-[color:var(--muted-cream)]"
        >
          Mindestens {PASSWORD_MIN_LENGTH} Zeichen. Verwende einen
          Passwort-Manager, keine wiederverwendeten Passwörter.
        </p>
      </div>

      <div className="field">
        <label htmlFor="admin-confirm-password" className="kicker mb-2">
          Passwort bestätigen
        </label>
        <input
          id="admin-confirm-password"
          name="confirm"
          type="password"
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          required
          aria-invalid={state.field === "confirm" ? true : undefined}
        />
      </div>

      {state.message ? (
        <p role="alert" className="text-xs text-[color:var(--gold-soft)]">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
