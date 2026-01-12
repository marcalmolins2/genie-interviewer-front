import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppLayout from "./pages/AppLayout";
import InterviewersLayout from "./pages/InterviewersLayout";
import InterviewersList from "./pages/InterviewersList";
import InterviewersTrash from "./pages/InterviewersTrash";
import InterviewersArchive from "./pages/InterviewersArchive";
import InterviewerCreationSelector from "./pages/InterviewerCreationSelector";
import CreateInterviewerManual from "./pages/CreateInterviewerManual";
import CreateInterviewerAssisted from "./pages/CreateInterviewerAssisted";
import InterviewerOverview from "./pages/InterviewerOverview";
import EditInterviewer from "./pages/EditInterviewer";
import InterviewerInsights from "./pages/InterviewerInsights";
import SessionDetail from "./pages/SessionDetail";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArchetypes from "./pages/admin/AdminArchetypes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminFeatureFlags from "./pages/admin/AdminFeatureFlags";
import PublicInterview from "./pages/PublicInterview";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import {
  LegacyAgentRedirect,
  LegacyAgentEditRedirect,
  LegacyAgentAnalyzeRedirect,
  LegacyAgentSessionRedirect,
  LegacyAnalyzeRedirect
} from "./components/LegacyAgentRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/interview/:linkId" element={<PublicInterview />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/app" element={<AppLayout />}>
            {/* Primary routes - /app/interviewers */}
            <Route path="interviewers" element={<InterviewersLayout />}>
              <Route index element={<InterviewersList />} />
              <Route path="trash" element={<InterviewersTrash />} />
              <Route path="archive" element={<InterviewersArchive />} />
              <Route path="new" element={<InterviewerCreationSelector />} />
              <Route path="new/manual" element={<CreateInterviewerManual />} />
              <Route path="new/assisted" element={<CreateInterviewerAssisted />} />
            </Route>
            <Route path="interviewers/:interviewerId" element={<InterviewerOverview />} />
            <Route path="interviewers/:interviewerId/edit" element={<EditInterviewer />} />
            <Route path="interviewers/:interviewerId/insights" element={<InterviewerInsights />} />
            {/* Legacy redirect from /analyze to /insights */}
            <Route path="interviewers/:interviewerId/analyze" element={<LegacyAnalyzeRedirect />} />
            <Route path="interviewers/:interviewerId/sessions/:sessionId" element={<SessionDetail />} />
            
            {/* Legacy redirects - /app/agents -> /app/interviewers */}
            <Route path="agents" element={<Navigate to="/app/interviewers" replace />} />
            <Route path="agents/trash" element={<Navigate to="/app/interviewers/trash" replace />} />
            <Route path="agents/archive" element={<Navigate to="/app/interviewers/archive" replace />} />
            <Route path="agents/new" element={<Navigate to="/app/interviewers/new" replace />} />
            <Route path="agents/new/manual" element={<Navigate to="/app/interviewers/new/manual" replace />} />
            <Route path="agents/new/assisted" element={<Navigate to="/app/interviewers/new/assisted" replace />} />
            <Route path="agents/:agentId" element={<LegacyAgentRedirect />} />
            <Route path="agents/:agentId/edit" element={<LegacyAgentEditRedirect />} />
            <Route path="agents/:agentId/analyze" element={<LegacyAgentAnalyzeRedirect />} />
            <Route path="agents/:agentId/sessions/:sessionId" element={<LegacyAgentSessionRedirect />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="archetypes" element={<AdminArchetypes />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="flags" element={<AdminFeatureFlags />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
