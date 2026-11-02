export function getRequiredServerEnv(
  name: "DATABASE_URL" | "JWT_SECRET",
  fallback?: string
) {
  const value = process.env[name];

  if (value && value.trim() !== "") {
    return value.trim();
  }

  if (fallback) {
    return fallback;
  }

  throw new Error(`${name} is not configured`);
}
