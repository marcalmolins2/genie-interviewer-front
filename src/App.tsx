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
import InterviewerAnalyze from "./pages/InterviewerAnalyze";
import SessionDetail from "./pages/SessionDetail";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArchetypes from "./pages/admin/AdminArchetypes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import PublicInterview from "./pages/PublicInterview";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
            <Route path="interviewers" element={<InterviewersLayout />}>
              <Route index element={<InterviewersList />} />
              <Route path="trash" element={<InterviewersTrash />} />
              <Route path="archive" element={<InterviewersArchive />} />
            </Route>
            <Route path="interviewers/new" element={<InterviewerCreationSelector />} />
            <Route path="interviewers/new/manual" element={<CreateInterviewerManual />} />
            <Route path="interviewers/new/assisted" element={<CreateInterviewerAssisted />} />
            <Route path="interviewers/:interviewerId" element={<InterviewerOverview />} />
            <Route path="interviewers/:interviewerId/edit" element={<EditInterviewer />} />
            <Route path="interviewers/:interviewerId/analyze" element={<InterviewerAnalyze />} />
            <Route path="interviewers/:interviewerId/sessions/:sessionId" element={<SessionDetail />} />
            {/* Legacy agent routes - redirect to interviewers */}
            <Route path="agents" element={<Navigate to="/app/interviewers" replace />} />
            <Route path="agents/*" element={<Navigate to="/app/interviewers" replace />} />
            {/* Admin Routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="archetypes" element={<AdminArchetypes />} />
              <Route path="analytics" element={<AdminAnalytics />} />
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
