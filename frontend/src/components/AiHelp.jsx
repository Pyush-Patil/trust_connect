import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";
import { cn } from "../utils/cn";
import { Button, Drawer, Icon, Textarea } from "./ui";

const SUGGESTIONS = [
  "AC is not cooling properly",
  "Where is my refund?",
  "Professional is running late",
  "Sparking from switchboard",
];

export function AiHelp({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi, I'm trust_connect assist — your troubleshooting helper. Describe what's going on at home and I'll guide you before you book a professional.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text) {
    const issue = text.trim();
    if (!issue || busy) return;
    setDraft("");
    setMessages((m) => [...m, { role: "user", text: issue }]);
    setBusy(true);
    try {
      const reply = await api.troubleshoot(issue);
      setMessages((m) => [...m, { role: "ai", text: reply.answer, steps: reply.steps }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: e instanceof ApiError ? e.message : "Something went wrong reaching the AI service. Try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="trust_connect assist" subtitle="POST /ai/troubleshoot">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-4 p-5">
          {messages.map((m, i) => (
            <div key={i} className={cn("anim-fade-up flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-ink text-paper"
                    : "rounded-bl-md border border-line bg-shell text-soft",
                )}
              >
                <p>{m.text}</p>
                {m.steps && (
                  <ol className="mt-3 space-y-2 border-t border-line/80 pt-3">
                    {m.steps.map((s, j) => (
                      <li key={j} className="flex gap-2.5">
                        <span className="font-mono text-[11px] font-semibold text-muted">{String(j + 1).padStart(2, "0")}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-shell px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="live-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${i * 0.18}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line p-4">
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold text-soft transition-colors hover:border-ink/40 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe the issue… e.g. geyser trips the MCB"
              className="min-h-[48px] flex-1 resize-none"
              rows={1}
            />
            <Button type="submit" loading={busy} className="h-12 w-12 !px-0" aria-label="Send">
              {!busy && <Icon name="arrowRight" />}
            </Button>
          </form>
        </div>
      </div>
    </Drawer>
  );
}
