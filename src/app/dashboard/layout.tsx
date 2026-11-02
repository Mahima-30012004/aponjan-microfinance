import LogoutButton from "./LogoutButton";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="border-b p-6">
          <h1 className="text-xl font-bold text-blue-600">
            Aponjan
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Customer Portal
          </p>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/profile"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              My Profile
            </Link>

            <Link
              href="/dashboard/apply-loan"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              Apply for Loan
            </Link>

            <Link
              href="/dashboard/loans"
              className="block rounded-lg px-4 py-3 hover:bg-gray-100"
            >
              My Loans
            </Link>

          </div>

          <div className="mt-8 border-t pt-4">
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}