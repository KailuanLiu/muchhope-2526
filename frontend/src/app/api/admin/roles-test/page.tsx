"use client";

import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMemo, useState } from "react";

type UserRole = "user" | "admin" | "mainadmin";

export default function RolesTestPage() {
  const { isLoaded: authLoaded, isSignedIn, sessionClaims } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const [targetUserId, setTargetUserId] = useState("");
  const [loadingAction, setLoadingAction] = useState<"promote" | "demote" | null>(null);
  const [resultMessage, setResultMessage] = useState("");

  const role = useMemo(() => {
    const metadata = (sessionClaims?.metadata ?? {}) as { role?: UserRole };
    return metadata.role ?? "user";
  }, [sessionClaims]);

  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "No email found";

  const isAdmin = role === "admin" || role === "mainadmin";
  const isMainAdmin = role === "mainadmin";

  async function handleRoleChange(action: "promote" | "demote") {
    setResultMessage("");

    if (!targetUserId.trim()) {
      setResultMessage("Please enter a target Clerk user ID.");
      return;
    }

    try {
      setLoadingAction(action);

      const endpoint = action === "promote" ? "/api/admin/promote" : "/api/admin/demote";

      const nextRole = action === "promote" ? "admin" : "user";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUserId.trim(),
          role: nextRole,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setResultMessage(data?.error || `Failed to ${action} user.`);
        return;
      }

      setResultMessage(
        action === "promote" ? "User was promoted to admin successfully." : "User was demoted to user successfully.",
      );
      setTargetUserId("");
    } catch (error) {
      console.error(error);
      setResultMessage("Something went wrong. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  if (!authLoaded || !userLoaded) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Role Testing</h1>
        <p className="mt-4">Loading...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Role Testing</h1>
        <p className="mt-4">You must be signed in to view this page.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Role Testing</h1>
        <p className="text-sm text-gray-600 mt-1">Temporary internal page for testing Clerk RBAC.</p>
      </div>

      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-semibold">Current User</h2>
        <p>
          <strong>Email:</strong> {email}
        </p>
        <p>
          <strong>Role:</strong> {role}
        </p>
        <p>
          <strong>Admin Access:</strong> {isAdmin ? "Yes" : "No"}
        </p>
        <p>
          <strong>Main Admin Access:</strong> {isMainAdmin ? "Yes" : "No"}
        </p>
        <p>
          <strong>Clerk User ID:</strong> {user?.id}
        </p>
      </section>

      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">Test Actions</h2>

        <div>
          <Link href="/admin" className="inline-block border rounded px-3 py-2 hover:bg-gray-50">
            Go to Admin Dashboard
          </Link>
        </div>

        <div className="space-y-2">
          <label htmlFor="targetUserId" className="block font-medium">
            Target Clerk User ID
          </label>
          <input
            id="targetUserId"
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="user_123..."
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-600">Enter the Clerk user ID of the account you want to update.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleRoleChange("promote")}
            disabled={!isMainAdmin || loadingAction !== null}
            className="border rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === "promote" ? "Promoting..." : "Promote to Admin"}
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("demote")}
            disabled={!isMainAdmin || loadingAction !== null}
            className="border rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAction === "demote" ? "Demoting..." : "Demote to User"}
          </button>
        </div>

        {!isMainAdmin && <p className="text-sm text-red-600">Only mainadmin can promote or demote users.</p>}

        {resultMessage && (
          <div className="border rounded p-3 bg-gray-50">
            <p>{resultMessage}</p>
          </div>
        )}
      </section>
    </main>
  );
}
