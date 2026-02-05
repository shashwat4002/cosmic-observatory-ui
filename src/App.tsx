import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AuthCallback from "./pages/auth/AuthCallback";
import ResetPassword from "./pages/auth/ResetPassword";

// Protected pages
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";

// Lazy load heavier pages
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Community = lazy(() => import("./pages/Community"));
const Resources = lazy(() => import("./pages/Resources"));
const Matching = lazy(() => import("./pages/Matching"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Onboarding (requires auth but not onboarding completion) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Projects />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProjectDetail />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Community />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Resources />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/matching"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Matching />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Settings />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile/:id?"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Profile />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminPanel />
                  </Suspense>
                </AdminRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
