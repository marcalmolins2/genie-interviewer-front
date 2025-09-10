import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppLayout from "./pages/AppLayout";
import ProjectsList from "./pages/ProjectsList";
import CreateProject from "./pages/CreateProject";
import ProjectOverview from "./pages/ProjectOverview";
import CreateAgent from "./pages/CreateAgent";
import AgentOverview from "./pages/AgentOverview";
import EditAgent from "./pages/EditAgent";
import AgentAnalyze from "./pages/AgentAnalyze";
import NotFound from "./pages/NotFound";

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
          <Route path="/app" element={<AppLayout />}>
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<CreateProject />} />
            <Route path="projects/:projectId" element={<ProjectOverview />} />
            <Route path="projects/:projectId/agents/new" element={<CreateAgent />} />
            <Route path="projects/:projectId/agents/:agentId" element={<AgentOverview />} />
            <Route path="projects/:projectId/agents/:agentId/edit" element={<EditAgent />} />
            <Route path="projects/:projectId/agents/:agentId/analyze" element={<AgentAnalyze />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
