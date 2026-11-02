"use client";

import { useEffect, useState } from "react";

type Customer = {
  fullName?: string;
};

type LoanProduct = {
  name?: string;
  loanType?: string;
};

type Application = {
  id: string;
  customer?: Customer | null;
  loanProduct?: LoanProduct | null;
  requestedAmount: number | string;
  requestedTenure: number;
  purpose?: string | null;
  status: string;
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchApplications = async () => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");

      if (!token) {
        setMessage("Admin login token not found");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/loan-applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch applications");
        setLoading(false);
        return;
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      await fetchApplications();
    };

    void loadApplications();
  }, []);

  const updateApplication = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    const remarks = window.prompt(
      `Enter remarks for ${status.toLowerCase()}:`
    );

    if (remarks === null) {
      return;
    }

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");

      const response = await fetch(`/api/admin/loan-applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          remarks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update application");
        return;
      }

      alert(data.message);

      fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return <div className="p-8">Loading applications...</div>;
  }

  if (message) {
    return <div className="p-8 text-red-600">{message}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Loan Applications</h1>

      {applications.length === 0 ? (
        <p>No loan applications found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Loan Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Tenure</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.id} className="border-t">
                  <td className="p-4">
                    {application.customer?.fullName || "N/A"}
                  </td>

                  <td className="p-4">
                    {application.loanProduct?.loanType || "N/A"}
                  </td>

                  <td className="p-4">
                    ₹
                    {Number(application.requestedAmount).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="p-4">
                    {application.requestedTenure} months
                  </td>

                  <td className="p-4">
                    {application.purpose || "N/A"}
                  </td>

                  <td className="p-4">
                    {application.status}
                  </td>

                  <td className="p-4">
                    {application.status === "PENDING" ||
                    application.status === "UNDER_REVIEW" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateApplication(
                              application.id,
                              "APPROVED"
                            )
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateApplication(
                              application.id,
                              "REJECTED"
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}