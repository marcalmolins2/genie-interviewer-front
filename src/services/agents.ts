// Mock Service Layer for Agents API
import { Agent, InterviewGuide, KnowledgeAsset, AudienceUpload, Share, InterviewSummary, PRICE_BY_CHANNEL } from '@/types';

// Mock data
const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'EU Battery Expert Deep-Dive',
    archetype: 'expert_deep_dive',
    createdAt: '2024-12-01T10:00:00Z',
    status: 'ready_to_test',
    language: 'en',
    voiceId: 'voice-1',
    channel: 'inbound_call',
    interviewsCount: 8,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.inbound_call,
    contact: { phoneNumber: '+1 (555) 234-7890' },
    credentialsReady: true,
  },
  {
    id: 'agent-2',
    name: 'Retail NPS Pulse',
    archetype: 'rapid_survey',
    createdAt: '2024-11-28T14:30:00Z',
    status: 'live',
    language: 'es',
    channel: 'chat',
    interviewsCount: 142,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.chat,
    contact: { chatUrl: 'https://chat.genie/abcd', chatPassword: 'NPS-2025' },
    credentialsReady: true,
  },
  {
    id: 'agent-3',
    name: 'Customer Feedback Portal',
    archetype: 'customer_user',
    createdAt: '2024-12-05T09:15:00Z',
    status: 'paused',
    language: 'en',
    channel: 'chat',
    interviewsCount: 23,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.chat,
    contact: { chatUrl: 'https://chat.genie/efgh', chatPassword: 'FEEDBACK-2024' },
    credentialsReady: true,
  }
];

const mockInterviews: InterviewSummary[] = [
  {
    id: 'interview-1',
    agentId: 'agent-1',
    startedAt: '2024-12-08T15:30:00Z',
    durationSec: 1847,
    channel: 'inbound_call',
    completed: true,
    respondentId: 'resp-1'
  },
  {
    id: 'interview-2',
    agentId: 'agent-2',
    startedAt: '2024-12-08T14:15:00Z',
    durationSec: 325,
    channel: 'chat',
    completed: true,
    respondentId: 'resp-2'
  }
];

// API Service Functions
export const agentsService = {
  // Get all agents
  async getAgents(): Promise<Agent[]> {
    await delay(500);
    return [...mockAgents];
  },

  // Get single agent
  async getAgent(id: string): Promise<Agent | null> {
    await delay(300);
    return mockAgents.find(agent => agent.id === id) || null;
  },

  // Create new agent
  async createAgent(data: Partial<Agent>): Promise<Agent> {
    await delay(800);
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: data.name || 'Untitled Agent',
      archetype: data.archetype || 'rapid_survey',
      createdAt: new Date().toISOString(),
      status: 'ready_to_test',
      language: data.language || 'en',
      voiceId: data.voiceId,
      channel: data.channel || 'chat',
      interviewsCount: 0,
      pricePerInterviewUsd: PRICE_BY_CHANNEL[data.channel || 'chat'],
      contact: {},
      credentialsReady: false,
    };
    
    mockAgents.push(newAgent);
    return newAgent;
  },

  // Update agent
  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    await delay(500);
    const index = mockAgents.findIndex(agent => agent.id === id);
    if (index === -1) throw new Error('Agent not found');
    
    mockAgents[index] = { ...mockAgents[index], ...data };
    return mockAgents[index];
  },

  // Provision contact info (phone/chat)
  async provisionContact(agentId: string): Promise<{ contact: Agent['contact'] }> {
    await delay(1000);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');

    let contact: Agent['contact'] = {};
    
    if (agent.channel === 'inbound_call') {
      contact.phoneNumber = `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    } else if (agent.channel === 'chat') {
      const urlId = Math.random().toString(36).substring(2, 8);
      contact.chatUrl = `https://chat.genie/${urlId}`;
      contact.chatPassword = `PWD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // Update the agent
    agent.contact = contact;
    agent.credentialsReady = true;
    
    return { contact };
  },

  // Deploy agent (go live)
  async deployAgent(agentId: string, caseCode: string): Promise<{ status: 'live' }> {
    await delay(800);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');
    
    agent.status = 'live';
    return { status: 'live' };
  },

  // Pause/Resume agent
  async toggleAgentStatus(agentId: string): Promise<Agent> {
    await delay(400);
    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');
    
    if (agent.status === 'live') {
      agent.status = 'paused';
    } else if (agent.status === 'paused') {
      agent.status = 'live';
    }
    
    return agent;
  },

  // Get agent interviews
  async getAgentInterviews(agentId: string): Promise<InterviewSummary[]> {
    await delay(400);
    return mockInterviews.filter(interview => interview.agentId === agentId);
  },

  // Get agent stats
  async getAgentStats(agentId: string): Promise<any> {
    await delay(600);
    const interviews = mockInterviews.filter(i => i.agentId === agentId);
    
    return {
      totalInterviews: interviews.length,
      completedInterviews: interviews.filter(i => i.completed).length,
      averageDuration: interviews.length > 0 
        ? Math.round(interviews.reduce((sum, i) => sum + i.durationSec, 0) / interviews.length)
        : 0,
      completionRate: interviews.length > 0 
        ? interviews.filter(i => i.completed).length / interviews.length 
        : 0,
      last7Days: interviews.filter(i => {
        const interviewDate = new Date(i.startedAt);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return interviewDate > sevenDaysAgo;
      }).length
    };
  }
};

// Utility function for simulating API delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}