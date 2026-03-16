"use client";

import { useActionState, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMagicLink } from "./actions";
import { messages } from "./messages";
import type { ActionResponse } from "@/types";

const RESEND_COOLDOWN_SECONDS = 60;

type FormState = ActionResponse<{ email: string }> | null;

function useCountdown(seconds: number): [number, () => void] {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return [remaining, start];
}

export function AuthForm({ initialError }: { initialError?: string }) {
  const [countdown, startCountdown] = useCountdown(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState, formData) => {
      const result = await sendMagicLink(formData);
      if (result.data) {
        startCountdown();
        setResendError(null);
      }
      return result;
    },
    null,
  );

  const emailSent = state?.data?.email;

  const handleResend = useCallback(async () => {
    if (!emailSent || countdown > 0 || isResending) return;

    const formData = new FormData();
    formData.set("email", emailSent);

    setIsResending(true);
    setResendError(null);

    try {
      const result = await sendMagicLink(formData);

      if (result.data) {
        startCountdown();
        return;
      }

      setResendError(result.error?.message ?? messages.errors.sendFailed);
    } catch {
      setResendError(messages.errors.sendFailed);
    } finally {
      setIsResending(false);
    }
  }, [countdown, emailSent, isResending, startCountdown]);

  const errorMessage =
    initialError === "auth_callback_error"
      ? messages.errors.callbackFailed
      : state?.error?.message;

  // Confirmation state — email has been sent
  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ocean/10">
          <svg
            className="h-8 w-8 text-ocean"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="font-heading text-h1 text-navy">
          {messages.confirmation.title}
        </h1>
        <p className="mt-2 text-body text-slate">
          {messages.confirmation.description}
        </p>
        <p className="mt-1 text-body font-semibold text-navy">{emailSent}</p>
        <p className="mt-4 text-small text-slate">
          {messages.confirmation.instruction}
        </p>

        <div className="mt-6 space-y-3">
          {countdown > 0 ? (
            <p className="text-small text-mist">
              {messages.confirmation.resendCountdown} {countdown}
              {messages.confirmation.seconds}
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-small font-semibold text-ocean transition-colors hover:text-ocean/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending
                ? messages.confirmation.resending
                : messages.confirmation.resend}
            </button>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="block w-full text-small text-slate hover:text-navy transition-colors"
          >
            {messages.confirmation.backToForm}
          </button>

          {resendError ? (
            <p className="text-small text-error">{resendError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  // Sign-in form
  return (
    <div>
      <p className="text-center text-small font-semibold uppercase tracking-[0.2em] text-ocean">
        {messages.form.eyebrow}
      </p>
      <h1 className="mt-4 text-center font-heading text-h1 text-navy">
        {messages.form.title}
      </h1>
      <p className="mt-2 text-center text-body text-slate">
        {messages.form.description}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-semibold text-slate"
          >
            {messages.form.emailLabel}
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={messages.form.emailPlaceholder}
            required
            autoComplete="email"
            autoFocus
            className="mt-1 min-h-[44px]"
          />
          {errorMessage && (
            <p className="mt-1 text-small text-error">{errorMessage}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[44px] bg-coral text-white hover:bg-coral/90 rounded-[var(--radius-button)]"
        >
          {isPending ? messages.form.submitting : messages.form.submit}
        </Button>
      </form>
    </div>
  );
}
