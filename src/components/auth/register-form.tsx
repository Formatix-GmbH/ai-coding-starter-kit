"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { registerAction } from "@/lib/actions/auth";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { turnstileEnabled } from "@/lib/turnstile/config";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      consent: false as unknown as true,
    },
  });

  const password = form.watch("password");

  async function onSubmit(values: RegisterInput) {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("fullName", values.fullName);
      fd.set("email", values.email);
      fd.set("password", values.password);
      fd.set("consent", String(values.consent));
      fd.set("turnstileToken", captchaToken);
      const result = await registerAction(fd);
      if (result.ok) {
        toast.success(
          "Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den zugesandten Link.",
        );
      } else {
        toast.error(result.message ?? "Registrierung fehlgeschlagen.");
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Vor- und Nachname" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <PasswordStrengthMeter password={password} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Datenschutzerklärung akzeptieren"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Ich habe die{" "}
                  <Link href="/datenschutz" className="underline" target="_blank">
                    Datenschutzerklärung
                  </Link>{" "}
                  gelesen und akzeptiere sie.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || (turnstileEnabled && !captchaToken)}
        >
          {isSubmitting ? "Wird erstellt…" : "Konto erstellen"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Bereits ein Konto?{" "}
          <Link href="/login" className="underline">
            Anmelden
          </Link>
        </p>
      </form>
    </Form>
  );
}
