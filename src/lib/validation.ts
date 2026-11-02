export function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeEmail(value: unknown): string | null {
  const normalized = asString(value);

  if (!normalized) {
    return null;
  }

  const email = normalized.toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function normalizePhone(value: unknown): string | null {
  const normalized = asString(value);

  if (!normalized) {
    return null;
  }

  const digitsOnly = normalized.replace(/\D/g, "");

  return digitsOnly.length >= 8 && digitsOnly.length <= 15 ? digitsOnly : null;
}

export function normalizeName(value: unknown): string | null {
  const normalized = asString(value);

  if (!normalized) {
    return null;
  }

  const trimmed = normalized.replace(/\s+/g, " ");

  return trimmed.length >= 2 ? trimmed : null;
}

export function normalizePurpose(value: unknown): string | null {
  const normalized = asString(value);

  if (!normalized) {
    return null;
  }

  const trimmed = normalized.replace(/\s+/g, " ");

  return trimmed.length <= 500 ? trimmed : null;
}

export function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed === "") {
      return null;
    }

    const parsed = Number(trimmed);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function parseWholeNumber(value: unknown): number | null {
  const parsed = parsePositiveNumber(value);

  if (parsed === null) {
    return null;
  }

  return Number.isInteger(parsed) ? parsed : null;
}

export function isValidPassword(password: unknown): boolean {
  if (typeof password !== "string") {
    return false;
  }

  const trimmed = password.trim();

  return trimmed.length >= 8 && /[A-Za-z]/.test(trimmed) && /\d/.test(trimmed);
}
