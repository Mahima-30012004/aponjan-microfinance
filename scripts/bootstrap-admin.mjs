import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const required = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be set in the environment`);
  }

  return value;
};

const connectionString = required("DATABASE_URL");
const name = required("INITIAL_ADMIN_NAME").replace(/\s+/g, " ");
const email = required("INITIAL_ADMIN_EMAIL").toLowerCase();
const password = required("INITIAL_ADMIN_PASSWORD");
const phone = process.env.INITIAL_ADMIN_PHONE?.replace(/\D/g, "") || null;

if (name.length < 2) {
  throw new Error("INITIAL_ADMIN_NAME must contain at least 2 characters");
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("INITIAL_ADMIN_EMAIL must be a valid email address");
}

if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  throw new Error(
    "INITIAL_ADMIN_PASSWORD must be at least 12 characters and include a letter and number"
  );
}

if (phone && (phone.length < 8 || phone.length > 15)) {
  throw new Error("INITIAL_ADMIN_PHONE must contain 8 to 15 digits");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const result = await prisma.$transaction(async (transaction) => {
    const adminCount = await transaction.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount > 0) {
      return { created: false };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await transaction.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    return { created: true };
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });

  if (result.created) {
    console.log("Initial administrator created.");
  } else {
    console.log("An administrator already exists; no account was changed.");
  }
} catch (error) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : null;

  if (code === "P2002") {
    console.error(
      "Admin setup failed: the configured email or phone is already registered. Public registration accounts are not automatically promoted."
    );
  } else if (code === "P1000") {
    console.error(
      "Admin setup failed: PostgreSQL rejected the database credentials. Check DATABASE_URL."
    );
  } else if (code === "P1001" || code === "P1002") {
    console.error(
      "Admin setup failed: the PostgreSQL server could not be reached. Check the database host and network settings."
    );
  } else if (code === "P2021" || code === "P2022") {
    console.error(
      "Admin setup failed: database tables or columns are missing. Run npx prisma migrate deploy against this database first."
    );
  } else {
    console.error(
      `Admin setup failed${code ? ` (${code})` : ""}. Check the database configuration and migrations.`
    );
  }

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
