'use client';

import { useState, useEffect } from 'react';
import { Trash2, Check, RotateCcw } from 'lucide-react';
import Card from '@/components/ui/Card';

interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  category: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/contact-messages')
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setResolved = async (id: string, resolved: boolean) => {
    await fetch(`/api/admin/contact-messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, resolved } : m)));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return;
    await fetch(`/api/admin/contact-messages/${id}`, { method: 'DELETE' });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const visible = filter === 'open' ? messages.filter((m) => !m.resolved) : messages;
  const openCount = messages.filter((m) => !m.resolved).length;

  return (
    <div className="p-6">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Messages</h2>
            <p className="text-xs text-neutral-400 mt-0.5">{openCount} unresolved of {messages.length} total</p>
          </div>
          <div className="flex gap-2">
            {(['open', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  filter === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-neutral-600 border-neutral-200'
                }`}
              >
                {f === 'open' ? 'Unresolved' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-400 py-8 text-center">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-neutral-400 py-8 text-center">No messages.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {visible.map((m) => (
              <div key={m.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    className="text-left min-w-0 flex-1"
                    onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {m.subject || '(no subject)'}
                      </p>
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{m.category}</span>
                      {m.resolved && (
                        <span className="text-[10px] bg-green-50 text-success px-2 py-0.5 rounded-full">Resolved</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {m.name} · {m.email} · {new Date(m.createdAt).toLocaleString('en-IN')}
                    </p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                  <button
                      onClick={() => setResolved(m.id, !m.resolved)}
                      title={m.resolved ? 'Reopen' : 'Mark resolved'}
                      className="p-1.5 text-neutral-400 hover:text-success hover:bg-green-50 rounded-md"
                    >
                      {m.resolved ? <RotateCcw size={14} /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={() => remove(m.id)}
                      title="Delete"
                      className="p-1.5 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {expandedId === m.id && (
                  <div className="mt-3 rounded-md bg-neutral-50 p-3">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">{m.message}</p>
                    <a href={`mailto:${m.email}`} className="inline-block mt-2 text-xs text-primary-600 hover:underline">
                      Reply by email
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
