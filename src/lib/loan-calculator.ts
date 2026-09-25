export function calculateFlatInterestLoan(
  principal: number,
  interestRate: number,
  tenureWeeks: number
) {
  // Flat interest is calculated on the full principal
  // for the complete loan period.
  const interest = principal * (interestRate / 100);

  const totalRepayment = principal + interest;

  const weeklyEmi = totalRepayment / tenureWeeks;

  return {
    principal,
    interest,
    totalRepayment,
    weeklyEmi,
    tenureWeeks,
  };
}