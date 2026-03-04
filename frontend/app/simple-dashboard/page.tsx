"use client";

import { useSession } from "@/lib/auth/session";

export default function SimpleDashboard() {
  const { status } = useSession();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Simple Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg mb-2"><strong>Status:</strong> {status}</p>
          <p className="text-gray-600">This is a simple dashboard without app-shell</p>
          <p className="text-gray-600 mt-4">If you see this, the basic routing works!</p>
        </div>
      </div>
    </div>
  );
}
