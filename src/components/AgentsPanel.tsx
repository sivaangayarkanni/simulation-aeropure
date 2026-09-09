import { useCallback, useMemo, useState } from 'react';
import {
  AGENTS,
  answerFromKnowledge,
  type AgentAnswer,
} from '../lib/knowledgeBase';
import type { SystemMetrics } from '../lib/types';

interface ChatTurn {
  id: string;
  role: 'user' | 'agent';
  agentId?: string;
  text: string;
  cited?: { id: string; title: string }[];
  source?: 'api' | 'client';
}

interface Props {
  metrics: SystemMetrics;
  open: boolean;
  onClose: () => void;
}

function simpleMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/\n/g, '<br/>');
}

export function AgentsPanel({ metrics, open, onClose }: Props) {
  const [agentId, setAgentId] = useState('nano');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: 'welcome',
      role: 'agent',
      agentId: 'nano',
      text: '**NanoFilterAgent** ready. Ask about charcoal strata, synthetic PM10/PM2.5 layers, or switch agents. Answers are grounded in the MSME Idea Hackathon 6.0 product deck.',
      source: 'client',
    },
  ]);

  const agent = useMemo(() => AGENTS.find((a) => a.id === agentId) ?? AGENTS[0], [agentId]);

  const simSnapshot = useMemo(
    () => ({
      inletTempC: metrics.inletTempC,
      outletTempC: metrics.outletTempC,
      deltaT: metrics.deltaT,
      filtrationEfficiencyPct: metrics.filtrationEfficiencyPct,
      pressureDropPa: metrics.pressureDropPa,
      fanRpm: metrics.fanRpm,
      filterLoadingPct: metrics.filterLoadingPct,
    }),
    [metrics],
  );

  const ask = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || busy) return;
      setBusy(true);
      setError(null);
      setInput('');
      const userTurn: ChatTurn = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      setTurns((t) => [...t, userTurn]);

      let answer: AgentAnswer | null = null;
      try {
        const res = await fetch('/api/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, message: trimmed, simSnapshot }),
        });
        if (res.ok) {
          const data = (await res.json()) as AgentAnswer & { ok?: boolean };
          if (data.markdown) {
            answer = { ...data, source: 'api' };
          }
        }
      } catch {
        /* client fallback */
      }

      if (!answer) {
        answer = answerFromKnowledge(agentId, trimmed, simSnapshot, 'client');
      }

      setTurns((t) => [
        ...t,
        {
          id: `a-${Date.now()}`,
          role: 'agent',
          agentId: answer!.agentId,
          text: answer!.markdown,
          cited: answer!.citedSections,
          source: answer!.source,
        },
      ]);
      setBusy(false);
    },
    [agentId, busy, simSnapshot],
  );

  if (!open) return null;

  return (
    <aside className="agents-panel glass" aria-label="Knowledge agents">
      <header className="agents-header">
        <div>
          <h2>Knowledge Agents</h2>
          <p className="agents-sub">Deck-grounded · RAG-ish · API + client fallback</p>
        </div>
        <button type="button" className="btn icon" onClick={onClose} aria-label="Close agents">
          ✕
        </button>
      </header>

      <div className="agent-switcher" role="tablist">
        {AGENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={a.id === agentId}
            className={`agent-chip ${a.id === agentId ? 'active' : ''}`}
            style={{ ['--agent-accent' as string]: a.accent }}
            onClick={() => setAgentId(a.id)}
            title={a.specialty}
          >
            {a.name.replace('Agent', '')}
          </button>
        ))}
      </div>

      <div className="agent-role-card" style={{ borderColor: agent.accent }}>
        <strong style={{ color: agent.accent }}>{agent.name}</strong>
        <span>{agent.role}</span>
        <p>{agent.specialty}</p>
      </div>

      <div className="suggested-prompts">
        {agent.suggestedPrompts.map((p) => (
          <button key={p} type="button" className="prompt-chip" disabled={busy} onClick={() => void ask(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="chat-log" aria-live="polite">
        {turns.map((turn) => (
          <div key={turn.id} className={`chat-bubble ${turn.role}`}>
            {turn.role === 'agent' ? (
              <>
                <div
                  className="md"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(turn.text) }}
                />
                <div className="chat-meta">
                  {turn.source === 'api' ? (
                    <span className="api-badge ok">API</span>
                  ) : (
                    <span className="api-badge">Client</span>
                  )}
                  {turn.cited && turn.cited.length > 0 && (
                    <span className="cites">
                      Cited: {turn.cited.map((c) => c.title).join(' · ')}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p>{turn.text}</p>
            )}
          </div>
        ))}
        {busy && (
          <div className="chat-bubble agent loading">
            <span className="pulse-dot" /> {agent.name} retrieving deck sections…
          </div>
        )}
        {error && <div className="chat-error">{error}</div>}
      </div>

      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${agent.name}…`}
          disabled={busy}
          aria-label="Message to agent"
        />
        <button type="submit" className="btn primary" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
}
