"use client";

import { evaluatePasswordStrength } from "@/lib/validation/password-strength";
import { cn } from "@/lib/utils";

const BAR_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-600",
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = evaluatePasswordStrength(password);

  return (
    <div className="space-y-1" aria-live="polite">
      <div className="flex gap-1" role="presentation">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? BAR_COLORS[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className="text-xs text-muted-foreground">Passwortstärke: {label}</p>
      )}
    </div>
  );
}
