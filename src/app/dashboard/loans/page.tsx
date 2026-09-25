"use client";

import { useEffect, useState } from "react";

type Loan = {
  id: string;
  principalAmount: string;
  interestRate: string;
  tenure: number;
  emiAmount: string;
  outstandingAmount: string;
  status: string;
};

type Application = {
  id: string;
  requestedAmount: string;
  requestedTenure: number;
  purpose: string | null;
  status: string;
  createdAt: string;
  loanProduct: {
    name: string;
    interestRate: string;
  };
  loan: Loan | null;
};

export default function MyLoansPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch("/api/loans/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Unable to load applications.");
          return;
        }

        setApplications(data.applications || []);
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading your loans...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        My Loans
      </h1>

      <p className="mt-2 text-gray-600">
        View your loan applications and active loans.
      </p>

      {message && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {message}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-8 text-center shadow">
          <h2 className="text-xl font-semibold">
            No loan applications
          </h2>

          <p className="mt-2 text-gray-600">
            You haven't submitted any loan applications yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="rounded-xl bg-white p-6 shadow"
            >
              {/* Application header */}
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h2 className="text-xl font-semibold">
                    {application.loanProduct.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Application ID: {application.id}
                  </p>
                </div>

                <span
                  className={`h-fit rounded-full px-3 py-1 text-sm font-medium ${
                    application.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : application.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {application.status}
                </span>
              </div>

              {/* Application details */}
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Amount
                  </p>

                  <p className="font-semibold">
                    ₹
                    {Number(
                      application.requestedAmount
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Tenure
                  </p>

                  <p className="font-semibold">
                    {application.requestedTenure} weeks
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Interest Rate
                  </p>

                  <p className="font-semibold">
                    {application.loanProduct.interestRate}%
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Purpose
                  </p>

                  <p className="font-semibold">
                    {application.purpose || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Actual loan */}
              {application.loan && (
                <div className="mt-8 rounded-xl border p-5">
                  <h3 className="text-lg font-semibold">
                    Active Loan
                  </h3>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Loan Amount
                      </p>

                      <p className="font-semibold">
                        ₹
                        {Number(
                          application.loan.principalAmount
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Weekly EMI
                      </p>

                      <p className="font-semibold">
                        ₹
                        {Number(
                          application.loan.emiAmount
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Outstanding
                      </p>

                      <p className="font-semibold">
                        ₹
                        {Number(
                          application.loan.outstandingAmount
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Loan Status
                      </p>

                      <p className="font-semibold">
                        {application.loan.status}
                      </p>
                    </div>
                  </div>

                  {/* EMI button */}
                  <button
                    onClick={() =>
                      (window.location.href = `/dashboard/loans/${application.loan?.id}/emi`)
                    }
                    className="mt-6 rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800"
                  >
                    View EMI Schedule
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}