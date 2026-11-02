import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700">Aponjan</span>
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold border-l pl-2 border-slate-300">
              Microfinance
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6 border border-blue-100">
          Empowering Communities & Micro-Enterprises
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl">
          Transparent, Accessible & Trusted Micro-Credit Solutions
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
          Quick approvals, clear repayment schedules, and dedicated support for local entrepreneurs, self-help groups, and micro-enterprises.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto text-center font-medium bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow transition"
          >
            Create Customer Account
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-center font-medium bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-8 py-3 rounded-lg transition"
          >
            Member / Staff Portal
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Fast Loan Processing</h3>
            <p className="text-sm text-slate-600">
              Apply online with standard documentation and track sanction status in real time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Clear EMI Schedules</h3>
            <p className="text-sm text-slate-600">
              Transparent breakdown of principal, interest, and monthly installments with zero hidden fees.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Dedicated Administration</h3>
            <p className="text-sm text-slate-600">
              Secure role-based dashboard for verification officers and internal management.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Aponjan Microfinance. All rights reserved. For authorized members and staff.
        </div>
      </footer>
    </div>
  );
}