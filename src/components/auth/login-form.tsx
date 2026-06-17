"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { loginAction } from "@/lib/actions/auth";
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

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("email", values.email);
      fd.set("password", values.password);
      if (returnTo) fd.set("returnTo", returnTo);
      const result = await loginAction(fd);
      if (result.ok && result.redirectTo) {
        // Voll-Navigation, damit die neue Sitzung serverseitig greift.
        window.location.href = result.redirectTo;
        return;
      }
      toast.error(result.message ?? "Anmeldung fehlgeschlagen.");
      form.resetField("password");
    } finally {
      setIsSubmitting(false);
    }
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Passwort</FormLabel>
                <Link
                  href="/passwort-vergessen"
                  className="text-sm text-muted-foreground underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Wird angemeldet…" : "Anmelden"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="underline">
            Konto erstellen
          </Link>
        </p>
      </form>
    </Form>
  );
}
