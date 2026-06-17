import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>
          Melde dich an, um auf deine gespeicherten Anträge zuzugreifen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm returnTo={returnTo} />
      </CardContent>
    </Card>
  );
}
