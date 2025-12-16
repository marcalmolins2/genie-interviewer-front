import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppLayout from "./pages/AppLayout";
import AgentsLayout from "./pages/AgentsLayout";
import AgentsList from "./pages/AgentsList";
import AgentsTrash from "./pages/AgentsTrash";
import AgentsArchive from "./pages/AgentsArchive";
import AgentCreationSelector from "./pages/AgentCreationSelector";
import CreateAgentManual from "./pages/CreateAgentManual";
import CreateAgentAssisted from "./pages/CreateAgentAssisted";
import AgentOverview from "./pages/AgentOverview";
import EditAgent from "./pages/EditAgent";
import AgentAnalyze from "./pages/AgentAnalyze";
import SessionDetail from "./pages/SessionDetail";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArchetypes from "./pages/admin/AdminArchetypes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import PublicInterview from "./pages/PublicInterview";

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
          <Route path="/app" element={<AppLayout />}>
            <Route path="agents" element={<AgentsLayout />}>
              <Route index element={<AgentsList />} />
              <Route path="trash" element={<AgentsTrash />} />
              <Route path="archive" element={<AgentsArchive />} />
            </Route>
            <Route path="agents/new" element={<AgentCreationSelector />} />
            <Route path="agents/new/manual" element={<CreateAgentManual />} />
            <Route path="agents/new/assisted" element={<CreateAgentAssisted />} />
            <Route path="agents/:agentId" element={<AgentOverview />} />
            <Route path="agents/:agentId/edit" element={<EditAgent />} />
            <Route path="agents/:agentId/analyze" element={<AgentAnalyze />} />
            <Route path="agents/:agentId/sessions/:sessionId" element={<SessionDetail />} />
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
