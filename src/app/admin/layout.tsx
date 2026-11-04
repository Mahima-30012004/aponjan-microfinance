"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type AdminRole = "ADMIN" | "LOAN_OFFICER";

const navigation: {
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
  roles: readonly AdminRole[];
}[] = [
  {
    href: "/admin/applications",
    label: "Applications",
    shortLabel: "Apps",
    icon: "grid",
    roles: ["ADMIN", "LOAN_OFFICER"],
  },
  {
    href: "/admin/team",
    label: "Staff & groups",
    shortLabel: "Team",
    icon: "users",
    roles: ["ADMIN"],
  },
];

function NavigationIcon({ name }: { name: string }) {
  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-13a4 4 0 0 1 0 8m6 5v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessMessage, setAccessMessage] = useState("");

  const checkAccess = useCallback(async () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      setCheckingAccess(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        router.replace("/login");
        return;
      }

      if (data.user?.role !== "ADMIN" && data.user?.role !== "LOAN_OFFICER") {
        router.replace("/dashboard");
        return;
      }

      setRole(data.user.role);
    } catch (error) {
      console.error("Admin access check error:", error);
      setAccessMessage("Could not verify access. Check your connection and retry.");
    } finally {
      setCheckingAccess(false);
    }
  }, [router]);

  useEffect(() => {
    const verifyAccess = async () => {
      await checkAccess();
    };

    void verifyAccess();
  }, [checkAccess]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    router.replace("/login");
  };

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Verifying your account...
      </main>
    );
  }

  if (!role) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
        <p className="text-sm text-red-700">
          {accessMessage || "You do not have permission to view this page."}
        </p>
        {accessMessage && (
          <button
            type="button"
            onClick={() => {
              setCheckingAccess(true);
              setAccessMessage("");
              void checkAccess();
            }}
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            Try again
          </button>
        )}
      </main>
    );
  }

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#103d32] text-white md:flex">
        <Link
          href="/admin/applications"
          className="flex h-20 items-center gap-3 border-b border-white/10 px-6"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-[#103d32]">
            A
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">Aponjan</span>
            <span className="block text-xs text-emerald-100/70">
              Operations portal
            </span>
          </span>
        </Link>

        <div className="px-4 pt-8">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/50">
            Workspace
          </p>
          <nav aria-label="Admin navigation" className="space-y-1">
            {visibleNavigation.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white/12 text-white shadow-sm"
                      : "text-emerald-50/70 hover:bg-white/7 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="size-5">
                    <NavigationIcon name={item.icon} />
                  </span>
                  {item.label}
                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-emerald-300" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/7 p-3">
            <p className="text-xs text-emerald-100/60">Signed in as</p>
            <p className="mt-1 text-sm font-semibold">
              {role === "ADMIN" ? "Administrator" : "Loan Officer"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-emerald-50/75 transition hover:bg-white/7 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <path
                d="M10 17l5-5-5-5m5 5H3m9-9h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/admin/applications"
              className="flex items-center gap-2 font-bold text-[#103d32] md:hidden"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
                A
              </span>
              Aponjan
            </Link>
            <div className="hidden text-sm text-slate-500 md:block">
              Microfinance operations
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 sm:inline-flex">
                {role === "ADMIN" ? "Administrator" : "Loan Officer"}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-[#103d32] text-sm font-bold text-white">
                {role === "ADMIN" ? "A" : "L"}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium text-slate-600 hover:text-slate-950 md:hidden"
              >
                Sign out
              </button>
            </div>
          </div>
          <nav
            aria-label="Admin navigation"
            className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden"
          >
            {visibleNavigation.map((item) => {
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="mx-auto max-w-[1440px]">{children}</div>
      </div>
    </div>
  );
}
