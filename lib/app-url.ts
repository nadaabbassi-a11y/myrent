export function getAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "");
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}
