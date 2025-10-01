'use client'

import Chat from "@/components/Chat";
import { ThemeToggle } from "@/components/ThemeToggleSwitch";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-primary">LLM Chat</h1>
          <ThemeToggle />
        </div>
        <Chat />
      </div>
    </main>
  );
}