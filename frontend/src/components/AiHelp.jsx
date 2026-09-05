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

const ANSWER_FIELDS = [
  ["Problem", "Problem"],
  ["Possible Causes", "Possible Causes"],
  ["Recommended Action", "Recommended Action"],
  ["Recommended Solution / Action", "Recommended Action"],
  ["Recommended Service", "Recommended Service"],
  ["Estimated Price", "Estimated Price"],
  ["Estimated Service Price", "Estimated Price"],
];

const NON_SERVICE_ANSWERS = new Set([
  "professional inspection is required",
  "professional inspection required",
  "price unavailable",
  "none",
  "n/a",
]);

function parseAnswer(text) {
  const source = String(text ?? "");
  const firstLabel = ANSWER_FIELDS.find(([label]) => source.includes(`${label}:`));
  if (!firstLabel) return null;

  const sections = {};
  const matches = ANSWER_FIELDS
    .map(([label, key]) => ({ label, key, index: source.indexOf(`${label}:`) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);

  matches.forEach((match, index) => {
    const start = match.index + match.label.length + 1;
    const end = matches[index + 1]?.index ?? source.length;
    const value = source.slice(start, end).trim();
    if (value && !sections[match.key]) sections[match.key] = value;
  });

  return sections;
}

function StructuredAnswer({ text, answer }) {
  const sections = answer && typeof answer === "object"
    ? {
        Problem: answer.problem,
        "Possible Causes": answer.causes?.join("\n"),
        "Recommended Action": answer.actions?.join("\n"),
        "Recommended Service": answer.services?.join(";"),
        "Estimated Price": answer.prices?.map(({ service, price }) => `${service}: ${price}`).join("\n"),
      }
    : parseAnswer(text);
  if (!sections) return <p className="whitespace-pre-wrap">{text}</p>;

  const services = (sections["Recommended Service"] ?? "")
    .split(";")
    .map((service) => service.trim())
    .map((service) => service.replace(/^[-*]\s*/, "").trim())
    .filter((service) => !NON_SERVICE_ANSWERS.has(service.toLowerCase().replace(/[.:]+$/, "")))
    .filter(Boolean);
  const prices = (sections["Estimated Price"] ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      return separator > -1
        ? { name: line.slice(0, separator).trim(), price: line.slice(separator + 1).trim() }
        : { name: "Estimated price", price: line };
      })
      .filter(({ name, price }) => {
        const normalizedName = name.toLowerCase().replace(/[.:]+$/, "");
        const normalizedPrice = price.toLowerCase().replace(/[.:]+$/, "");
        return !NON_SERVICE_ANSWERS.has(normalizedName) && !NON_SERVICE_ANSWERS.has(normalizedPrice);
      });

  return (
    <div className="space-y-3">
      {sections.Problem && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Problem</p>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-ink">{sections.Problem}</p>
        </div>
      )}
      {[
        ["Possible Causes", sections["Possible Causes"]],
        ["Recommended Action", sections["Recommended Action"]],
      ].map(([label, value]) => value && (
        <div key={label}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-1 whitespace-pre-line leading-relaxed text-soft">{value}</p>
        </div>
      ))}
      {services.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Recommended Service</p>
          <ul className="mt-1.5 space-y-1">
            {services.map((service) => <li key={service} className="flex gap-2 leading-relaxed text-soft"><span className="text-muted">•</span><span>{service}</span></li>)}
          </ul>
        </div>
      )}
      {prices.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Estimated Price</p>
          <div className="mt-1.5 divide-y divide-line rounded-lg border border-line bg-paper">
            {prices.map(({ name, price }) => (
              <div key={`${name}-${price}`} className="flex items-start justify-between gap-3 px-3 py-2 text-[13px]">
                <span className="text-soft">{name}</span>
                <span className="shrink-0 font-semibold text-ink">{price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: typeof reply.answer === "string" ? reply.answer : "",
          answer: typeof reply.answer === "object" ? { ...reply.answer, problem: reply.problem } : null,
          steps: reply.steps,
        },
      ]);
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
                <StructuredAnswer text={m.text} answer={m.answer} />
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
