import "server-only";

import { isResendConfigured, readServerEnv } from "@/lib/env";

type SendArgs = {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(
  args: SendArgs,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isResendConfigured()) {
    return { ok: false, reason: "RESEND_API_KEY missing" };
  }
  const env = readServerEnv();
  const from = args.from ?? env.fromEmail;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        reply_to: args.replyTo,
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
    });
    if (!res.ok) {
      return { ok: false, reason: `resend ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
