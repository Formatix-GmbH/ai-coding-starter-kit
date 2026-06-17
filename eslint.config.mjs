// ESLint Flat Config (ESLint 9 + Next.js 16)
// Ersetzt die alte .eslintrc.json; `next lint` existiert in Next 16 nicht mehr.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  {
    // Vendored shadcn/ui-Komponenten werden nicht umgeschrieben (Projektregel).
    // Die Skeleton-Breite nutzt bewusst Math.random — purity-Regel hier aus.
    files: ["src/components/ui/**"],
    rules: {
      "react-hooks/purity": "off",
    },
  },
  {
    // Bewusst ungenutzte Argumente/Variablen mit _-Präfix erlauben
    // (z.B. Platzhalter-Signaturen, die später implementiert werden).
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default config;
