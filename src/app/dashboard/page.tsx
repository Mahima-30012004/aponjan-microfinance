"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
};

type LoanApplication = {
  id: string;
  requestedAmount: number;
  requestedTenure: number;
  purpose: string | null;
  status: string;
  loanProduct: {
    name: string;
    interestRate: number;
  } | null;
  loan: {
    id: string;
    principalAmount: number;
    emiAmount: number;
    outstandingAmount: number;
    status: string;
  } | null;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      try {
        // Get logged-in user
        const userResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          setMessage(userData.message || "Authentication failed.");
          return;
        }

        setUser(userData.user);

        // Get customer's loan applications and loans
        const loansResponse = await fetch("/api/loans/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const loansData = await loansResponse.json();

        if (loansResponse.ok) {
          setApplications(loansData.applications || []);
        }
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{message}</p>
      </main>
    );
  }

  const activeLoans = applications.filter(
    (application) => application.loan?.status === "ACTIVE"
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Customer Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}!
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Profile */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">My Profile</h2>

            <p className="mt-3 text-gray-600">
              Name: {user?.name}
            </p>

            <p className="text-gray-600">
              Email: {user?.email}
            </p>

            <p className="text-gray-600">
              Phone: {user?.phone || "Not provided"}
            </p>
          </div>

          {/* Loans */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">My Loans</h2>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {activeLoans.length}
            </p>

            <p className="text-gray-600">
              Active loan{activeLoans.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Applications */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Applications</h2>

            <p className="mt-3 text-2xl font-bold text-gray-900">
              {applications.length}
            </p>

            <p className="text-gray-600">
              Total application{applications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Loan list */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">My Loan Applications</h2>

          {applications.length === 0 ? (
            <p className="mt-4 text-gray-600">
              You have not applied for any loan yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Tenure</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-3 text-sm">
                        {application.id}
                      </td>

                      <td className="px-4 py-3">
                        {application.loanProduct?.name || "Loan"}
                      </td>

                      <td className="px-4 py-3">
                        ₹{Number(application.requestedAmount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3">
                        {application.requestedTenure} weeks
                      </td>

                      <td className="px-4 py-3">
                        {application.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active loan details */}
        {activeLoans.length > 0 && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-semibold">
              Active Loan Details
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {activeLoans.map((application) => (
                <div
                  key={application.loan?.id}
                  className="rounded-lg border p-4"
                >
                  <p className="text-sm text-gray-500">
                    Loan Amount
                  </p>

                  <p className="text-xl font-bold">
                    ₹
                    {Number(
                      application.loan?.principalAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    Weekly EMI
                  </p>

                  <p className="font-semibold">
                    ₹
                    {Number(
                      application.loan?.emiAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    Outstanding
                  </p>

                  <p className="font-semibold">
                    ₹
                    {Number(
                      application.loan?.outstandingAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}