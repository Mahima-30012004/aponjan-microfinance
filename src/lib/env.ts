export function getRequiredServerEnv(name: "DATABASE_URL" | "JWT_SECRET") {
  const value = process.env[name];

  if (value && value.trim() !== "") {
    return value.trim();
  }

  throw new Error(`${name} is not configured`);
}
