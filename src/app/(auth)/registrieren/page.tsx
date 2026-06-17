import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Konto erstellen" };

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konto erstellen</CardTitle>
        <CardDescription>
          Ein Konto brauchst du nur, um deinen Antrag zwischenzuspeichern oder
          dir das PDF per E-Mail zusenden zu lassen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
