import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, getConn, subscribeConn } from "../lib/api";

const Ctx = createContext(null);
const LS_TOKEN = "trust_connect_token";

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [conn, setConn] = useState(getConn());
  const toastId = useRef(0);

  useEffect(() => subscribeConn(() => setConn(getConn())), []);

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, kind = "success") => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-3), { id, message, kind }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const reloadNotificationsWith = useCallback(async (t) => {
    if (!t) {
      setUnread(0);
      return;
    }

    try {
      const list = await api.notifications(t);
      setUnread(list.filter((n) => !n.read).length);
    } catch {
      setUnread(0);
    }
  }, []);

  const reloadNotifications = useCallback(async () => {
    const t = localStorage.getItem(LS_TOKEN);
    await reloadNotificationsWith(t);
  }, [reloadNotificationsWith]);

  /* Restore an existing JWT when the application starts. */
  useEffect(() => {
    const t = localStorage.getItem(LS_TOKEN);

    if (!t) {
      setBooting(false);
      return;
    }

    (async () => {
      try {
        const u = await api.me(t);
        setUser(u);
        setToken(t);
        await reloadNotificationsWith(t);
      } catch (error) {
        console.error("Session restore failed:", error);
        localStorage.removeItem(LS_TOKEN);
        setUser(null);
        setToken(null);
        setUnread(0);
      } finally {
        setBooting(false);
      }
    })();
  }, [reloadNotificationsWith]);

  const adoptSession = useCallback(
    (t, u) => {
      if (!t) return;

      localStorage.setItem(LS_TOKEN, t);
      setToken(t);
      setUser(u);
      void reloadNotificationsWith(t);
    },
    [reloadNotificationsWith],
  );

  const login = useCallback(
    async (email, password) => {
      const res = await api.login({ email, password });

      localStorage.setItem(LS_TOKEN, res.token);
      setToken(res.token);
      setUser(res.user);

      void reloadNotificationsWith(res.token);

      return res.user;
    },
    [reloadNotificationsWith],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    setToken(null);
    setUser(null);
    setUnread(0);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(LS_TOKEN);
    if (!t) return;

    try {
      setUser(await api.me(t));
    } catch {
      /* Keep the current session if a refresh temporarily fails. */
    }
  }, []);

  const bumpUnread = useCallback((delta) => {
    setUnread((u) => Math.max(0, u + delta));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      login,
      logout,
      adoptSession,
      refreshUser,
      toasts,
      toast,
      dismissToast,
      unread,
      bumpUnread,
      reloadNotifications,
      conn,
    }),
    [
      user,
      token,
      booting,
      login,
      logout,
      adoptSession,
      refreshUser,
      toasts,
      toast,
      dismissToast,
      unread,
      bumpUnread,
      reloadNotifications,
      conn,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export { LS_TOKEN };
