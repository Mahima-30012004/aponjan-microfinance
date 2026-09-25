"use client";

import { useEffect, useState } from "react";

type Emi = {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: string;
  amountPaid: string;
  status: string;
  paidDate: string | null;
};

type Loan = {
  id: string;
  principalAmount: string;
  interestRate: string;
  tenure: number;
  emiAmount: string;
  outstandingAmount: string;
  status: string;
};

export default function EmiSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [emis, setEmis] = useState<Emi[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEmiSchedule = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const { id } = await params;

        const response = await fetch(`/api/loans/${id}/emi`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Unable to load EMI schedule.");
          return;
        }

        setLoan(data.loan);
        setEmis(data.emiSchedule || []);
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmiSchedule();
  }, [params]);

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading EMI schedule...</p>
      </div>
    );
  }

  if (message) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            EMI Schedule
          </h1>

          <p className="mt-2 text-gray-600">
            View your weekly loan repayment schedule.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/dashboard/loans")}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back to My Loans
        </button>
      </div>

      {loan && (
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Loan Amount</p>
            <p className="mt-1 text-xl font-bold">
              ₹{Number(loan.principalAmount).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Weekly EMI</p>
            <p className="mt-1 text-xl font-bold">
              ₹{Number(loan.emiAmount).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Tenure</p>
            <p className="mt-1 text-xl font-bold">
              {loan.tenure} weeks
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="mt-1 text-xl font-bold">
              ₹{Number(loan.outstandingAmount).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Weekly Repayment Schedule
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {emis.length} installments
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">
                  EMI
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Due Date
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Amount Due
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Amount Paid
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Remaining
                </th>

                <th className="px-6 py-4 text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {emis.map((emi) => {
                const amountDue = Number(emi.amountDue);
                const amountPaid = Number(emi.amountPaid);
                const remaining = Math.max(amountDue - amountPaid, 0);

                return (
                  <tr key={emi.id} className="border-t">
                    <td className="px-6 py-4 font-medium">
                      #{emi.installmentNumber}
                    </td>

                    <td className="px-6 py-4">
                      {new Date(emi.dueDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td className="px-6 py-4">
                      ₹{amountDue.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      ₹{amountPaid.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      ₹{remaining.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          emi.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : emi.status === "OVERDUE"
                            ? "bg-red-100 text-red-700"
                            : emi.status === "PARTIALLY_PAID"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {emi.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}