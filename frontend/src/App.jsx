import { useEffect } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import { Button, EmptyState } from "./components/ui";
import Home from "./pages/Home";
import Professionals from "./pages/Professionals";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import BookingDetail from "./pages/BookingDetail";

function ScrollManager() {
  const loc = useLocation();
  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [loc.pathname, loc.hash]);
  return null;
}

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-24">
      <EmptyState
        icon="search"
        title="404 — this page took a day off"
        desc="The link you followed doesn't exist. Head back to the marketplace or search for a service."
        action={
          <div className="flex gap-2">
            <Link to="/"><Button variant="outline">Go home</Button></Link>
            <Link to="/services"><Button>Browse services</Button></Link>
          </div>
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollManager />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Professionals />} />
            <Route path="/professional/:id" element={<ProfessionalDetail />} />
            <Route path="/booking/:id" element={<BookingDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
