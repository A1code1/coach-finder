"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Coach } from "@/types/database";

type FilterStatus = "pending" | "approved" | "rejected" | "unpublished";

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCoaches();
    }
  }, [filter, user]);

  const checkAuth = async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        window.location.href = "/admin/login";
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", data.user.id)
        .single();

      if (adminError || !adminData) {
        window.location.href = "/admin/login";
        return;
      }

      setUser(data.user);
      setLoading(false);
    } catch (err) {
      window.location.href = "/admin/login";
    }
  };

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("status", filter)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoaches(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("coaches")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;
      setCoaches(coaches.filter((c) => c.id !== id));
      // TODO: Send approval email to coach
    } catch (err) {
      console.error(err);
      alert("Failed to approve coach");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("coaches")
        .update({ status: "rejected", rejection_reason: rejectionReason })
        .eq("id", id);

      if (error) throw error;
      setCoaches(coaches.filter((c) => c.id !== id));
      setRejectingId(null);
      setRejectionReason("");
      // TODO: Send rejection email to coach
    } catch (err) {
      console.error(err);
      alert("Failed to reject coach");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("coaches")
        .update({ status: "unpublished" })
        .eq("id", id);

      if (error) throw error;
      setCoaches(coaches.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to unpublish coach");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <Link
          href="/admin/coaches"
          className={`px-4 py-2 rounded font-medium ${
            filter === "pending"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pending
        </Link>
        <Link
          href="/admin/coaches?filter=approved"
          onClick={(e) => {
            e.preventDefault();
            setFilter("approved");
          }}
          className={`px-4 py-2 rounded font-medium ${
            filter === "approved"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Approved
        </Link>
        <Link
          href="/admin/coaches?filter=rejected"
          onClick={(e) => {
            e.preventDefault();
            setFilter("rejected");
          }}
          className={`px-4 py-2 rounded font-medium ${
            filter === "rejected"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Rejected
        </Link>
      </div>

      <div className="space-y-4">
        {coaches.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded text-center text-gray-600">
            No coaches to display
          </div>
        ) : (
          coaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{coach.name}</h3>
                  <p className="text-gray-600">{coach.city}</p>
                  <p className="text-gray-600 text-sm">
                    Joined: {new Date(coach.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    €{coach.hourly_rate.toFixed(2)}/hour
                  </p>
                  <button
                    onClick={() => setExpandedId(expandedId === coach.id ? null : coach.id)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2"
                  >
                    {expandedId === coach.id ? "▼ Less" : "▶ More Details"}
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{coach.bio}</p>

              {expandedId === coach.id && (
                <div className="mb-6 pt-6 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Experience</p>
                      <p className="text-gray-900">{coach.years_experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Age Groups</p>
                      <p className="text-gray-900">{coach.age_groups.join(", ")}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((spec) => (
                        <span key={spec} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Training Locations</p>
                    <ul className="text-gray-900 text-sm list-disc list-inside">
                      {coach.training_locations.map((loc) => (
                        <li key={loc}>{loc}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Weekly Availability</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(coach.availability).map(([day, times]) => (
                        <div key={day}>
                          <p className="font-medium capitalize">{day}</p>
                          <p className="text-gray-600">
                            {times.length > 0 ? times.join(", ") : "Not available"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {filter === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(coach.id)}
                    disabled={actionLoading === coach.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                  >
                    {actionLoading === coach.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectingId(coach.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}

              {filter === "approved" && (
                <button
                  onClick={() => handleUnpublish(coach.id)}
                  disabled={actionLoading === coach.id}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                >
                  {actionLoading === coach.id ? "Unpublishing..." : "Unpublish"}
                </button>
              )}

              {rejectingId === coach.id && (
                <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (will be sent to coach)..."
                    className="w-full px-4 py-2 border border-red-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(coach.id)}
                      disabled={actionLoading === coach.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                    >
                      {actionLoading === coach.id ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionReason("");
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
