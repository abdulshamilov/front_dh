"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { ChatShell } from "./components/ChatShell";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatShell />
    </ProtectedRoute>
  );
}
