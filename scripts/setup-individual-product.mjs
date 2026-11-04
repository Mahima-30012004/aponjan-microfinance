import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL must be set in the environment");
}

const productTerms = {
  name: "Aponjan Individual Loan",
  loanType: "INDIVIDUAL",
  interestRate: 30,
  minAmount: 5000,
  maxAmount: 100000,
  minTenure: 26,
  maxTenure: 26,
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const existingProduct = await prisma.loanProduct.findFirst({
    where: {
      name: productTerms.name,
      loanType: productTerms.loanType,
    },
  });

  if (existingProduct) {
    const hasConfirmedTerms =
      Number(existingProduct.interestRate) === productTerms.interestRate &&
      Number(existingProduct.minAmount) === productTerms.minAmount &&
      Number(existingProduct.maxAmount) === productTerms.maxAmount &&
      existingProduct.minTenure === productTerms.minTenure &&
      existingProduct.maxTenure === productTerms.maxTenure;

    if (!hasConfirmedTerms) {
      throw new Error(
        "A product with this name already exists with different terms. No changes were made."
      );
    }

    if (existingProduct.status !== "ACTIVE") {
      await prisma.loanProduct.update({
        where: { id: existingProduct.id },
        data: { status: "ACTIVE" },
      });

      console.log("The existing Individual Loan product has been activated.");
    } else {
      console.log("The confirmed Individual Loan product is already active.");
    }
  } else {
    await prisma.loanProduct.create({
      data: {
        ...productTerms,
        status: "ACTIVE",
      },
    });

    console.log("The confirmed Individual Loan product has been created.");
  }
} catch (error) {
  if (
    error instanceof Error &&
    error.message ===
      "A product with this name already exists with different terms. No changes were made."
  ) {
    console.error(error.message);
  } else {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : null;

    console.error(
      `Individual Loan setup failed${code ? ` (${code})` : ""}. Check DATABASE_URL and run npx prisma migrate deploy against this database.`
    );
  }

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
