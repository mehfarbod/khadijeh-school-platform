import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Public pages
const Students = lazy(() => import("./pages/Students.tsx"));
const Teachers = lazy(() => import("./pages/Teachers.tsx"));

// Admin pages
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.tsx"));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents.tsx"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff.tsx"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses.tsx"));
const AdminRegistrations = lazy(() => import("./pages/admin/AdminRegistrations.tsx"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents.tsx"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements.tsx"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews.tsx"));
const AdminTopStudents = lazy(() => import("./pages/admin/AdminTopStudents.tsx"));
const AdminBirthdays = lazy(() => import("./pages/admin/AdminBirthdays.tsx"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages.tsx"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground text-sm">بارگذاری...</div>
    </div>
  );
}

class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.warn("[VlyToolbar] Caught error:", err.message); }
  render() { return this.state.hasError ? null : this.props.children; }
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "خطای ناشناخته", stack: error.stack || "" };
  }
  componentDidCatch(err: Error) { console.error("[Root error]:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">خطای برنامه</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage({ type: "iframe-route-change", path: location.pathname }, "*");
  }, [location.pathname]);
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/students" element={<Students />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/admin" />} />

              {/* Placeholder public routes */}
              <Route path="/about" element={<Landing />} />
              <Route path="/courses" element={<Landing />} />
              <Route path="/news" element={<Landing />} />
              <Route path="/events" element={<Landing />} />
              <Route path="/announcements" element={<Landing />} />
              <Route path="/contact" element={<Landing />} />
              <Route path="/faq" element={<Landing />} />
              <Route path="/schedule" element={<Landing />} />
              <Route path="/exams" element={<Landing />} />
              <Route path="/gallery" element={<Landing />} />
              <Route path="/achievements" element={<Landing />} />
              <Route path="/reports" element={<Landing />} />

              {/* Admin routes */}
              <Route path="/admin" element={<RequireAuth><AdminOverview /></RequireAuth>} />
              <Route path="/admin/students" element={<RequireAuth><AdminStudents /></RequireAuth>} />
              <Route path="/admin/staff" element={<RequireAuth><AdminStaff /></RequireAuth>} />
              <Route path="/admin/courses" element={<RequireAuth><AdminCourses /></RequireAuth>} />
              <Route path="/admin/registrations" element={<RequireAuth><AdminRegistrations /></RequireAuth>} />
              <Route path="/admin/events" element={<RequireAuth><AdminEvents /></RequireAuth>} />
              <Route path="/admin/announcements" element={<RequireAuth><AdminAnnouncements /></RequireAuth>} />
              <Route path="/admin/news" element={<RequireAuth><AdminNews /></RequireAuth>} />
              <Route path="/admin/top-students" element={<RequireAuth><AdminTopStudents /></RequireAuth>} />
              <Route path="/admin/birthdays" element={<RequireAuth><AdminBirthdays /></RequireAuth>} />
              <Route path="/admin/messages" element={<RequireAuth><AdminMessages /></RequireAuth>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
