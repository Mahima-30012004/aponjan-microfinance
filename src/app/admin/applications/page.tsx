"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

type Application = {
  id: string;
  customer: {
    fullName: string;
  } | null;
  loanProduct: {
    name: string;
    loanType: string;
  } | null;
  group: {
    name: string;
  } | null;
  requestedAmount: number | string;
  requestedTenure: number;
  status: ApplicationStatus;
  createdAt: string;
};

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type ReviewAction = "APPROVED" | "REJECTED";

type ApiResult<T> = {
  success: boolean;
  message?: string;
} & T;

const currency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function getToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token");
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const classes: Record<ApplicationStatus, string> = {
    PENDING: "bg-amber-50 text-amber-800 ring-amber-600/20",
    UNDER_REVIEW: "bg-blue-50 text-blue-800 ring-blue-600/20",
    APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
    REJECTED: "bg-rose-50 text-rose-800 ring-rose-600/20",
  };

  const label = status.replace("_", " ").toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${classes[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [viewerRole, setViewerRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState<Application | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("APPROVED");
  const [remarks, setRemarks] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const fetchApplications = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        setMessage("Please sign in with your staff account.");
        return;
      }

      const response = await fetch("/api/admin/loan-applications", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data: ApiResult<{
        applications?: Application[];
        viewerRole?: string;
      }> = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load loan applications.");
        return;
      }

      setApplications(data.applications || []);
      setViewerRole(data.viewerRole || "");
    } catch (error) {
      console.error("Loan applications load error:", error);
      setMessage("Unable to load applications. Check your connection and retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadApplications = async () => {
      await fetchApplications();
    };

    void loadApplications();
  }, [fetchApplications]);

  const counts = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter(
        (application) =>
          application.status === "PENDING" ||
          application.status === "UNDER_REVIEW"
      ).length,
      approved: applications.filter(
        (application) => application.status === "APPROVED"
      ).length,
      rejected: applications.filter(
        (application) => application.status === "REJECTED"
      ).length,
    }),
    [applications]
  );

  const visibleApplications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "PENDING" &&
          (application.status === "PENDING" ||
            application.status === "UNDER_REVIEW")) ||
        application.status === filter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          application.customer?.fullName,
          application.loanProduct?.name,
          application.loanProduct?.loanType,
          application.id,
          application.group?.name,
        ].some((value) => value?.toLowerCase().includes(normalizedSearch));

      return matchesFilter && matchesSearch;
    });
  }, [applications, filter, search]);

  const openReview = (
    application: Application,
    action: ReviewAction
  ) => {
    setReviewing(application);
    setReviewAction(action);
    setRemarks("");
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reviewing) {
      return;
    }

    setSavingReview(true);
    setMessage("");

    try {
      const token = getToken();
      const response = await fetch(
        `/api/admin/loan-applications/${reviewing.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: reviewAction, remarks }),
        }
      );
      const data: ApiResult<Record<string, never>> = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to update this application.");
        return;
      }

      setReviewing(null);
      await fetchApplications(true);
      setMessage(data.message || "Application updated successfully.");
    } catch (error) {
      console.error("Application review error:", error);
      setMessage("Unable to update this application. Please try again.");
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-28 rounded-2xl bg-white" />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              OPERATIONS OVERVIEW
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Loan applications
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review borrower requests and monitor application progress.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchApplications(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 7v5h-5M4 17v-5h5m-3.1-3A7 7 0 0 1 18.3 7L20 12M4 12l1.7 5A7 7 0 0 0 18.1 15"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        {message && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <p>{message}</p>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
              className="font-semibold text-emerald-900 hover:text-emerald-700"
            >
              ×
            </button>
          </div>
        )}

        <section
          aria-label="Application statistics"
          className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              label: "Total applications",
              value: counts.total,
              accent: "bg-slate-100 text-slate-700",
              symbol: "Σ",
            },
            {
              label: "Awaiting review",
              value: counts.pending,
              accent: "bg-amber-50 text-amber-700",
              symbol: "…",
            },
            {
              label: "Approved",
              value: counts.approved,
              accent: "bg-emerald-50 text-emerald-700",
              symbol: "✓",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              accent: "bg-rose-50 text-rose-700",
              symbol: "—",
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {stat.value.toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`flex size-10 items-center justify-center rounded-xl text-lg font-bold ${stat.accent}`}
                >
                  {stat.symbol}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Applications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {visibleApplications.length} of {applications.length} records
                </p>
              </div>
              <label className="relative block w-full sm:max-w-xs">
                <span className="sr-only">Search applications</span>
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m16 16 4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer or ID"
                  className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto">
              {(
                [
                  ["ALL", "All applications", counts.total],
                  ["PENDING", "Needs review", counts.pending],
                  ["APPROVED", "Approved", counts.approved],
                  ["REJECTED", "Rejected", counts.rejected],
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    filter === key
                      ? "bg-[#103d32] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-xs ${
                      filter === key
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {visibleApplications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
                  <path
                    d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v5h5M9 13h6m-6 4h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {applications.length === 0
                  ? "No applications yet"
                  : "No matching applications"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {applications.length === 0
                  ? "New customer applications will appear here."
                  : "Try another status filter or search term."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Customer</th>
                    <th scope="col" className="px-6 py-3.5">Loan product</th>
                    <th scope="col" className="px-6 py-3.5">Requested</th>
                    <th scope="col" className="px-6 py-3.5">Submitted</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleApplications.map((application) => {
                    const awaitingReview =
                      application.status === "PENDING" ||
                      application.status === "UNDER_REVIEW";

                    return (
                      <tr
                        key={application.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">
                            {application.customer?.fullName || "Unknown customer"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Ref. {application.id.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-800">
                            {application.loanProduct?.name || "Loan"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {application.group?.name ||
                              application.loanProduct?.loanType ||
                              "Individual"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            ₹{currency.format(Number(application.requestedAmount))}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {application.requestedTenure} weeks
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {viewerRole === "ADMIN" && awaitingReview ? (
                            <div className="inline-flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openReview(application, "APPROVED")
                                }
                                className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openReview(application, "REJECTED")
                                }
                                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800"
                              >
                                Reject
                              </button>
                            </div>
                          ) : viewerRole === "LOAN_OFFICER" && awaitingReview ? (
                            <span className="text-xs font-medium text-slate-500">
                              Awaiting admin
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Complete</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {reviewing && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingReview) {
              setReviewing(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Application review
                </p>
                <h2
                  id="review-title"
                  className="mt-2 text-xl font-bold text-slate-950"
                >
                  {reviewAction === "APPROVED"
                    ? "Approve application?"
                    : "Reject application?"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setReviewing(null)}
                disabled={savingReview}
                aria-label="Close review dialog"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">
                {reviewing.customer?.fullName || "Unknown customer"}
              </p>
              <p className="mt-1 text-slate-600">
                ₹{currency.format(Number(reviewing.requestedAmount))} ·{" "}
                {reviewing.requestedTenure} weeks ·{" "}
                {reviewing.loanProduct?.name || "Loan"}
              </p>
            </div>
            {reviewAction === "APPROVED" && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Approval will create an active loan and its repayment schedule.
              </p>
            )}
            {message && (
              <p role="alert" className="mt-4 text-sm text-rose-700">
                {message}
              </p>
            )}
            <form onSubmit={submitReview} className="mt-5">
              <label
                htmlFor="review-remarks"
                className="block text-sm font-semibold text-slate-800"
              >
                Review remarks
                <span className="ml-1 font-normal text-slate-500">
                  (optional)
                </span>
              </label>
              <textarea
                id="review-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                maxLength={1000}
                rows={3}
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                placeholder="Add context for the decision"
              />
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={savingReview}
                  onClick={() => setReviewing(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${
                    reviewAction === "APPROVED"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-rose-700 hover:bg-rose-800"
                  }`}
                >
                  {savingReview
                    ? "Saving..."
                    : reviewAction === "APPROVED"
                      ? "Confirm approval"
                      : "Confirm rejection"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
