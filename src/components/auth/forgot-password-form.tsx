"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { turnstileEnabled } from "@/lib/turnstile/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("email", values.email);
      fd.set("turnstileToken", captchaToken);
      const result = await forgotPasswordAction(fd);
      if (!result.ok) {
        // Nur der Bot-Schutz kann hier fehlschlagen (sonst neutrale Antwort).
        toast.error(result.message ?? "Bitte erneut versuchen.");
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);
        return;
      }
      setDone(true);
      toast.success("Falls ein Konto existiert, wurde eine E-Mail versendet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-sm">
        <p>
          Falls ein Konto mit dieser Adresse existiert, haben wir dir eine
          E-Mail mit einem Link zum Zurücksetzen des Passworts gesendet.
        </p>
        <Link href="/login" className="underline">
          Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="name@firma.de" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || (turnstileEnabled && !captchaToken)}
        >
          {isSubmitting ? "Wird gesendet…" : "Link anfordern"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline">
            Zurück zur Anmeldung
          </Link>
        </p>
      </form>
    </Form>
  );
}
