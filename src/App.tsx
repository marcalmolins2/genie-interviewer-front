import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AppLayout from "./pages/AppLayout";
import AgentsList from "./pages/AgentsList";
import AgentsTrash from "./pages/AgentsTrash";
import AgentCreationSelector from "./pages/AgentCreationSelector";
import CreateAgentManual from "./pages/CreateAgentManual";
import CreateAgentAssisted from "./pages/CreateAgentAssisted";
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
            <Route path="agents" element={<AgentsList />} />
            <Route path="agents/trash" element={<AgentsTrash />} />
            <Route path="agents/new" element={<AgentCreationSelector />} />
            <Route path="agents/new/manual" element={<CreateAgentManual />} />
            <Route path="agents/new/assisted" element={<CreateAgentAssisted />} />
            <Route path="agents/:agentId" element={<AgentOverview />} />
            <Route path="agents/:agentId/edit" element={<EditAgent />} />
            <Route path="agents/:agentId/analyze" element={<AgentAnalyze />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
