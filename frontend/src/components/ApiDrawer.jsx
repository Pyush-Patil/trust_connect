import { useEffect, useState } from "react";
import { ENDPOINTS, getConn, setBase, setForceDemo } from "../lib/api";
import { useApp } from "../context/AppContext";
import { cn } from "../utils/cn";
import { Button, Drawer, Icon, Input, MethodChip } from "./ui";

export function ApiDrawer({ open, onClose }) {
  const { conn, toast } = useApp();
  const [base, setBaseUrl] = useState(conn.base);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (open) setBaseUrl(getConn().base);
  }, [open]);

  const groups = ENDPOINTS.reduce((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  async function test() {
    const url = base.trim().replace(/\/+$/, "");
    if (!url) {
      setTestResult("Set a base URL first — until then the UI serves bundled demo data.");
      return;
    }
    setTesting(true);
    setTestResult(null);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url + "/db-test", { signal: ctrl.signal });
      const data = await res.json().catch(() => null);
      setTestResult(res.ok ? `200 OK — ${JSON.stringify(data).slice(0, 120)}` : `${res.status} ${res.statusText}`);
    } catch {
      setTestResult("Unreachable — the UI will keep serving demo data as fallback.");
    } finally {
      clearTimeout(t);
      setTesting(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="API connection" subtitle="FastAPI backend · Swagger-compatible surface">
      <div className="space-y-6 p-5">
        <section className="rounded-xl border border-line bg-shell/70 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted">Connection</h4>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span className={cn("live-dot h-1.5 w-1.5 rounded-full", conn.status === "live" ? "bg-success" : conn.status === "fallback" ? "bg-warning" : "bg-muted")} />
              {conn.status === "live" ? "live" : conn.status === "fallback" ? "fallback → demo" : "demo"}
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Point the UI at your backend (for example <span className="font-mono text-[12px] text-ink">http://localhost:8000</span>).
            Every screen calls the real endpoints; if the server is unreachable we fall back to bundled demo data so nothing breaks.
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              value={base}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-api.example.com"
              className="font-mono text-[12px]"
            />
            <Button
              variant="outline"
              onClick={() => {
                setBase(base);
                toast(base.trim() ? "Base URL saved — requests will try the live API." : "Cleared base URL — demo mode.", "info");
              }}
            >
              Save
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={test} loading={testing}>
              {!testing && <Icon name="refresh" className="h-3.5 w-3.5" />} Test /db-test
            </Button>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-soft">
              <input
                type="checkbox"
                checked={conn.forceDemo}
                onChange={(e) => setForceDemo(e.target.checked)}
                className="h-4 w-4 accent-[#141414]"
              />
              Force demo data
            </label>
          </div>
          {testResult && (
            <p className="anim-fade-in mt-3 rounded-lg border border-line bg-paper p-2.5 font-mono text-[11px] leading-relaxed text-soft">
              {testResult}
            </p>
          )}
        </section>

        <section>
          <h4 className="text-[13px] font-bold uppercase tracking-wider text-muted">Endpoints wired into this UI</h4>
          <div className="mt-3 space-y-5">
            {Object.entries(groups).map(([group, list]) => (
              <div key={group}>
                <p className="font-display text-sm font-bold">{group}</p>
                <ul className="mt-2 space-y-1.5">
                  {list.map((e) => (
                    <li key={e.method + e.path}>
                      <button
                        onClick={() => {
                          void navigator.clipboard?.writeText(e.path);
                          toast("Copied " + e.path, "info");
                        }}
                        className="group flex w-full items-center gap-2.5 rounded-lg border border-line bg-paper px-2.5 py-2 text-left transition-colors hover:border-ink/30"
                        title="Copy path"
                      >
                        <MethodChip method={e.method} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-[11.5px] font-medium text-ink">{e.path}</span>
                          <span className="block truncate text-[11px] text-muted">
                            {e.name}
                            {e.assumed && <span className="ml-1.5 rounded border border-line bg-shell px-1 font-mono text-[9.5px] uppercase text-muted">assumed</span>}
                          </span>
                        </span>
                        {e.auth && <Icon name="lock" className="h-3.5 w-3.5 text-muted" />}
                        <Icon name="copy" className="h-3.5 w-3.5 text-line transition-colors group-hover:text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
            Endpoints tagged <span className="font-mono text-[10px]">assumed</span> follow the <span className="font-mono text-[10px]">BookingCreateRequest</span> schema
            in your Swagger docs but were not visible in the screenshot — adjust the paths in <span className="font-mono text-[10px]">src/lib/api.js</span> if yours differ.
          </p>
        </section>
      </div>
    </Drawer>
  );
}
