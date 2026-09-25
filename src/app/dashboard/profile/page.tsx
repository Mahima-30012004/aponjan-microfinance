"use client";

import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">
        My Profile
      </h1>

      <p className="mt-2 text-gray-600">
        View your Aponjan account information.
      </p>

      <div className="mt-8 max-w-2xl rounded-xl bg-white p-6 shadow">
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="mt-1 font-medium">{user?.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-medium">{user?.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="mt-1 font-medium">
              {user?.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account Role</p>
            <p className="mt-1 font-medium">{user?.role}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="mt-1 font-medium">{user?.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}