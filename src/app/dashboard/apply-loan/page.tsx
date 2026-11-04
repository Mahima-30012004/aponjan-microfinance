"use client";

import { FormEvent, useState } from "react";

export default function ApplyLoanPage() {
  const [form, setForm] = useState({
    loanType: "INDIVIDUAL",
    amount: "",
    tenure: "",
    purpose: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");
  setMessageType("success");

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first.");
      setMessageType("error");
      return;
    }

    const response = await fetch("/api/loans/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        loanType: form.loanType,
        amount: form.amount,
        tenure: form.tenure,
        purpose: form.purpose,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Loan application failed.");
      setMessageType("error");
      return;
    }

    setMessage(
      `Application submitted successfully! Application ID: ${data.application.id}`
    );

    setForm({
      loanType: "INDIVIDUAL",
      amount: "",
      tenure: "",
      purpose: "",
    });
  } catch (error) {
    console.error(error);
    setMessage("Something went wrong. Please try again.");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Apply for Loan
      </h1>

      <p className="mt-2 text-gray-600">
        Submit a new loan application.
      </p>

      <div className="mt-8 max-w-2xl rounded-xl bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Loan Type
            </label>

            <select
              value={form.loanType}
              onChange={(e) =>
                setForm({
                  ...form,
                  loanType: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="INDIVIDUAL">Individual Loan</option>
              <option value="GROUP">Group Loan</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Loan Amount
            </label>

            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: e.target.value,
                })
              }
              placeholder="Enter loan amount"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Tenure (weeks)
            </label>

            <input
              type="number"
              min="1"
              value={form.tenure}
              onChange={(e) =>
                setForm({
                  ...form,
                  tenure: e.target.value,
                })
              }
              placeholder="Enter tenure"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Purpose
            </label>

            <textarea
              value={form.purpose}
              onChange={(e) =>
                setForm({
                  ...form,
                  purpose: e.target.value,
                })
              }
              placeholder="Why do you need this loan?"
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {message && (
          <p
            role={messageType === "error" ? "alert" : "status"}
            className={`mt-5 rounded-lg p-4 text-sm ${
              messageType === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}