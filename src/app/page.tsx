'use client'

import { useState } from "react";
import Chat from "@/components/Chat";
import Configuration from "@/components/Configuration";
import { ThemeToggle } from "@/components/ThemeToggleSwitch";

type Tab = 'chat' | 'config';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-primary">Research Assistant</h1>
          <ThemeToggle />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'chat'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chat
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'config'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Configuration
            {activeTab === 'config' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'chat' && <Chat />}
          {activeTab === 'config' && <Configuration />}
        </div>
      </div>
    </main>
  );
}