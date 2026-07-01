import { notFound } from "next/navigation";

// PROJ-18: Ziel des Middleware-Rewrites für nicht aktive Formularpfade.
// Rendert die reguläre 404-Ansicht (HTTP 404) unter der ursprünglichen URL.
export default function FormularNichtVerfuegbar() {
  notFound();
}
