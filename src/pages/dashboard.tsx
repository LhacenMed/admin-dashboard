import React from "react";
import { auth } from "../../FirebaseConfig";
import { Spinner } from "@heroui/react";
import { Dashboard } from "@/components/Dashboard/Dashboard";

export default function DashboardPage() {
  const userId = auth.currentUser?.uid || null;

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard />
    </div>
  );
}
