"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  employee: {
    employeeCode: string;
    designation: string | null;
  } | null;
};

type Customer = {
  id: string;
  fullName: string;
  user: {
    email: string;
    role: string;
  };
};

type Group = {
  id: string;
  name: string;
  status: string;
  teamLeader: {
    id: string;
    fullName: string;
  };
  members: Array<{
    customer: {
      id: string;
      fullName: string;
    };
  }>;
};

type ApiResult<T> = {
  success: boolean;
  message?: string;
} & T;

export default function AdminTeamPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStaff, setSavingStaff] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [message, setMessage] = useState("");
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    employeeCode: "",
    password: "",
  });
  const [groupForm, setGroupForm] = useState({
    name: "",
    teamLeaderId: "",
    memberIds: [] as string[],
  });

  const loadData = useCallback(async () => {
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");

    if (!token) {
      setMessage("Please sign in with an administrator account.");
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [staffResponse, groupsResponse] = await Promise.all([
        fetch("/api/admin/staff", { headers }),
        fetch("/api/admin/groups", { headers }),
      ]);
      const staffData: ApiResult<{ staff?: StaffMember[] }> =
        await staffResponse.json();
      const groupsData: ApiResult<{
        groups?: Group[];
        customers?: Customer[];
      }> = await groupsResponse.json();

      if (!staffResponse.ok || !groupsResponse.ok) {
        setMessage(
          staffData.message ||
            groupsData.message ||
            "Unable to load administrator tools."
        );
        return;
      }

      setStaff(staffData.staff || []);
      setGroups(groupsData.groups || []);
      setCustomers(groupsData.customers || []);
    } catch (error) {
      console.error("Admin team page load error:", error);
      setMessage("Unable to load staff and group information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTeamData = async () => {
      await loadData();
    };

    void fetchTeamData();
  }, [loadData]);

  const createStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingStaff(true);
    setMessage("");

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(staffForm),
      });
      const data: ApiResult<{ staff?: StaffMember }> = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create loan officer account.");
        return;
      }

      setMessage(data.message || "Loan officer account created.");
      setStaffForm({
        name: "",
        email: "",
        phone: "",
        employeeCode: "",
        password: "",
      });
      await loadData();
    } catch (error) {
      console.error("Loan officer creation error:", error);
      setMessage("Unable to create loan officer account.");
    } finally {
      setSavingStaff(false);
    }
  };

  const createGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingGroup(true);
    setMessage("");

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch("/api/admin/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(groupForm),
      });
      const data: ApiResult<{ group?: Group }> = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create group.");
        return;
      }

      setMessage(data.message || "Group created.");
      setGroupForm({ name: "", teamLeaderId: "", memberIds: [] });
      await loadData();
    } catch (error) {
      console.error("Group creation error:", error);
      setMessage("Unable to create group.");
    } finally {
      setSavingGroup(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 rounded-2xl bg-white" />
            <div className="h-96 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-800">
            ORGANIZATION MANAGEMENT
          </p>
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Staff &amp; groups
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Create loan officer accounts and assign customer group leaders.
            </p>
          </div>
        </div>

        {message && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
          >
            {message}
          </p>
        )}

        <section className="grid items-start gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Create a Loan Officer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Set an initial password and share it with the officer through a
              secure channel.
            </p>

            <form onSubmit={createStaff} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-800">
                Full name
                <input
                  required
                  minLength={2}
                  value={staffForm.name}
                  onChange={(event) =>
                    setStaffForm({ ...staffForm, name: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Email
                <input
                  required
                  type="email"
                  value={staffForm.email}
                  onChange={(event) =>
                    setStaffForm({ ...staffForm, email: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Phone
                <input
                  required
                  type="tel"
                  value={staffForm.phone}
                  onChange={(event) =>
                    setStaffForm({ ...staffForm, phone: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Employee code
                <input
                  required
                  value={staffForm.employeeCode}
                  onChange={(event) =>
                    setStaffForm({
                      ...staffForm,
                      employeeCode: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Initial password (at least 12 characters)
                <input
                  required
                  type="password"
                  minLength={12}
                  value={staffForm.password}
                  onChange={(event) =>
                    setStaffForm({ ...staffForm, password: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <button
                type="submit"
                disabled={savingStaff}
                className="w-full rounded-xl bg-[#103d32] px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
              >
                {savingStaff ? "Creating account..." : "Create Loan Officer"}
              </button>
            </form>

            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold text-slate-900">Loan Officers</h3>
              {staff.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No loan officer accounts yet.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {staff.map((member) => (
                    <li key={member.id} className="py-3">
                      <p className="font-medium text-slate-900">
                        {member.name} ({member.employee?.employeeCode || "No code"})
                      </p>
                      <p className="text-sm text-slate-500">
                        {member.email} · {member.status}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Create a Group
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Group leaders must first register as customers. Creating this
              group assigns the selected customer the Team Leader role.
            </p>

            <form onSubmit={createGroup} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-800">
                Group name
                <input
                  required
                  maxLength={100}
                  value={groupForm.name}
                  onChange={(event) =>
                    setGroupForm({ ...groupForm, name: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Group leader
                <select
                  required
                  value={groupForm.teamLeaderId}
                  onChange={(event) =>
                    setGroupForm({
                      ...groupForm,
                      teamLeaderId: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                >
                  <option value="">Select a registered customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} · {customer.user.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-800">
                Group members (optional; use Ctrl/Cmd to select multiple)
                <select
                  multiple
                  value={groupForm.memberIds}
                  onChange={(event) =>
                    setGroupForm({
                      ...groupForm,
                      memberIds: Array.from(
                        event.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} · {customer.user.email}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={savingGroup || customers.length === 0}
                className="w-full rounded-xl bg-[#103d32] px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
              >
                {savingGroup ? "Creating group..." : "Create Group"}
              </button>
            </form>

            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold text-slate-900">Groups</h3>
              {groups.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No groups yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {groups.map((group) => (
                    <li key={group.id} className="py-3">
                      <p className="font-medium text-slate-900">{group.name}</p>
                      <p className="text-sm text-slate-500">
                        Leader: {group.teamLeader.fullName} ·{" "}
                        {group.members.length} member
                        {group.members.length === 1 ? "" : "s"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
