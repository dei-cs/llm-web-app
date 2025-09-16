import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="min-h-dvh bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">LLM Chat</h1>
        <Chat />
      </div>
    </main>
  );
}
