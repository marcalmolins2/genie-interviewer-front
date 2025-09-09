// Mock Service Layer for Agents API
import { Agent, InterviewGuide, KnowledgeAsset, AudienceUpload, Share, InterviewSummary, PRICE_BY_CHANNEL } from '@/types';

// Mock data
const mockAgents: Agent[] = [
  {
    id: 'agent-genai-strategy',
    name: 'GenAI Strategy Consulting Research',
    archetype: 'expert_deep_dive',
    createdAt: '2024-11-25T08:00:00Z',
    status: 'live',
    language: 'en',
    voiceId: 'voice-2',
    channel: 'inbound_call',
    interviewsCount: 34,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.inbound_call,
    contact: { phoneNumber: '+1 (555) 987-6543' },
    credentialsReady: true,
  },
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

const mockInterviewGuides: InterviewGuide[] = [
  {
    id: 'guide-genai-strategy',
    agentId: 'agent-genai-strategy',
    rawText: `### Respondent Screener
- Confirm the respondent's role and experience in strategy consulting, with specific exposure to GenAI initiatives either as an internal practitioner or client-facing consultant.
- Verify their involvement in GenAI use case development, implementation, or strategic planning within a consulting environment.
- Assess their experience level with both traditional strategy methodologies and emerging AI-enhanced approaches.

### Industry Overview
- What percentage of strategy consulting engagements now incorporate GenAI tools or methodologies? **[QUANTIFY]**
- How are leading strategy consulting firms (McKinsey, BCG, Bain, Deloitte, etc.) differentiating their GenAI capabilities in the market?
- What is the current maturity level of GenAI adoption across the strategy consulting industry — are most firms still in pilot phases or have some moved to scaled implementation?
- How do clients perceive the value proposition of GenAI-enhanced strategy consulting versus traditional approaches?

### Process Analysis
- Walk through a typical strategy engagement workflow and identify where GenAI tools are currently being integrated (e.g., market research, scenario planning, competitive analysis, synthesis).
- What are the most successful GenAI use cases you've seen in strategy work? (e.g., market sizing, trend analysis, strategic option generation, stakeholder analysis)
- How do you balance human strategic thinking with AI-generated insights? Where do you see the most value in human oversight versus automation?
- What is the typical timeline and resource allocation for implementing GenAI tools in a strategy engagement? **[QUANTIFY]**
- What are the primary challenges in scaling GenAI use cases from proof-of-concept to standard practice?

### Market Dynamics
- How are strategy consulting firms pricing GenAI-enhanced engagements? Are clients willing to pay premiums for AI-augmented strategy work, or do they expect cost reductions due to efficiency gains?
- What is driving client demand for GenAI in strategy consulting — cost reduction, speed to insight, analytical depth, or competitive advantage?
- How do boutique strategy firms compete with larger firms that have more resources to invest in GenAI capabilities?
- What role do partnerships with technology providers (OpenAI, Google, Microsoft, specialized AI vendors) play in strategy consulting firms' GenAI offerings?
- How do you handle client concerns about data security, confidentiality, and competitive intelligence when using GenAI tools?

### Future Trends
- Looking ahead 3–5 years, which strategic consulting functions do you believe will be most transformed by GenAI? (e.g., market research, scenario modeling, recommendation synthesis)
- How will the role of strategy consultants evolve as GenAI becomes more sophisticated? What skills will become more or less valuable?
- Do you anticipate GenAI will commoditize certain aspects of strategy consulting, and if so, how should firms adapt their value proposition?
- What new types of strategic questions or analyses become possible with advanced GenAI that weren't feasible with traditional methods?
- How might client expectations and engagement models change as GenAI becomes standard in the industry?`,
    structured: {
      intro: "This research explores the integration of Generative AI in strategy consulting, examining current adoption patterns, successful use cases, market dynamics, and future implications for the industry.",
      objectives: [
        "Quantify current GenAI adoption rates in strategy consulting engagements",
        "Map successful GenAI integration points in typical strategy workflows",
        "Analyze pricing models and client value perception of AI-enhanced consulting",
        "Identify competitive dynamics and differentiation strategies among consulting firms",
        "Project future evolution of consultant roles and client expectations"
      ],
      sections: [
        {
          title: "Respondent Screener",
          questions: [
            {
              id: "screener-role",
              type: "single",
              prompt: "What is your current role in strategy consulting?",
              options: ["Partner/Principal", "Engagement Manager", "Senior Associate", "Associate", "Other"],
              required: true
            },
            {
              id: "screener-genai-exposure",
              type: "single",
              prompt: "How would you describe your exposure to GenAI initiatives?",
              options: ["Internal practitioner", "Client-facing consultant", "Both", "Limited exposure"],
              required: true
            },
            {
              id: "screener-experience",
              type: "scale",
              prompt: "Rate your experience level with AI-enhanced strategy approaches",
              scale: { min: 1, max: 5, labels: { 1: "Beginner", 5: "Expert" } },
              required: true
            }
          ]
        },
        {
          title: "Industry Overview",
          questions: [
            {
              id: "adoption-percentage",
              type: "open",
              prompt: "What percentage of strategy consulting engagements now incorporate GenAI tools or methodologies?",
              required: true,
              followUps: ["How has this changed over the past 12 months?", "What factors are driving this adoption rate?"]
            },
            {
              id: "firm-differentiation",
              type: "open",
              prompt: "How are leading strategy consulting firms differentiating their GenAI capabilities?",
              followUps: ["Which firms do you see as leaders in this space?", "What specific capabilities set them apart?"]
            },
            {
              id: "maturity-level",
              type: "single",
              prompt: "What is the current maturity level of GenAI adoption in strategy consulting?",
              options: ["Pilot/experimentation phase", "Early implementation", "Scaled deployment", "Mature integration"],
              required: true
            },
            {
              id: "client-perception",
              type: "scale",
              prompt: "How do clients perceive the value of GenAI-enhanced vs traditional consulting?",
              scale: { min: 1, max: 5, labels: { 1: "Traditional preferred", 5: "GenAI strongly preferred" } }
            }
          ]
        },
        {
          title: "Process Analysis",
          questions: [
            {
              id: "workflow-integration",
              type: "open",
              prompt: "Walk through where GenAI tools are integrated in typical strategy engagements",
              required: true,
              followUps: ["Which integration points show the highest ROI?", "Where do you see the most resistance?"]
            },
            {
              id: "successful-use-cases",
              type: "multi",
              prompt: "What are the most successful GenAI use cases in strategy work?",
              options: ["Market sizing", "Trend analysis", "Strategic option generation", "Stakeholder analysis", "Competitive intelligence", "Scenario planning"],
              required: true
            },
            {
              id: "human-ai-balance",
              type: "open",
              prompt: "How do you balance human strategic thinking with AI-generated insights?",
              followUps: ["Where is human oversight most critical?", "What should never be automated?"]
            },
            {
              id: "implementation-timeline",
              type: "open",
              prompt: "What is the typical timeline and resource allocation for implementing GenAI tools?",
              required: true
            }
          ]
        },
        {
          title: "Market Dynamics",
          questions: [
            {
              id: "pricing-models",
              type: "open",
              prompt: "How are firms pricing GenAI-enhanced engagements?",
              required: true,
              followUps: ["Are clients willing to pay premiums?", "Do they expect cost reductions due to efficiency?"]
            },
            {
              id: "demand-drivers",
              type: "multi",
              prompt: "What is driving client demand for GenAI in strategy consulting?",
              options: ["Cost reduction", "Speed to insight", "Analytical depth", "Competitive advantage", "Innovation capability"],
              required: true
            },
            {
              id: "boutique-competition",
              type: "open",
              prompt: "How do boutique firms compete with larger firms on GenAI capabilities?"
            },
            {
              id: "tech-partnerships",
              type: "multi",
              prompt: "Which technology partnerships are most valuable?",
              options: ["OpenAI", "Google", "Microsoft", "Specialized AI vendors", "Internal development"],
              followUps: ["How do these partnerships influence client choices?"]
            }
          ]
        },
        {
          title: "Future Trends",
          questions: [
            {
              id: "transformed-functions",
              type: "multi",
              prompt: "Which consulting functions will be most transformed by GenAI in 3-5 years?",
              options: ["Market research", "Scenario modeling", "Recommendation synthesis", "Data analysis", "Client presentations", "Project management"],
              required: true
            },
            {
              id: "consultant-evolution",
              type: "open",
              prompt: "How will consultant roles evolve as GenAI becomes more sophisticated?",
              followUps: ["What skills will become more valuable?", "What skills will become less valuable?"]
            },
            {
              id: "commoditization-risk",
              type: "scale",
              prompt: "Will GenAI commoditize aspects of strategy consulting?",
              scale: { min: 1, max: 5, labels: { 1: "No risk", 5: "High risk" } },
              followUps: ["How should firms adapt their value proposition?"]
            },
            {
              id: "new-capabilities",
              type: "open",
              prompt: "What new strategic analyses become possible with advanced GenAI?"
            }
          ]
        }
      ],
      closing: "Thank you for sharing your insights on GenAI in strategy consulting. Your perspective helps us understand this rapidly evolving landscape."
    },
    validation: { complete: true, issues: [] }
  },
  {
    id: 'guide-1',
    agentId: 'agent-1',
    rawText: `Welcome to our expert interview on EU battery technologies. We're conducting research to understand the current landscape and future opportunities in this rapidly evolving sector.

Objectives:
- Assess current market dynamics in EU battery manufacturing
- Identify key technological trends and innovations
- Understand regulatory landscape and its impact
- Evaluate competitive positioning of major players

Questions:
1. What are the main drivers of growth in the EU battery market?
2. How do you see the regulatory environment evolving?
3. Which technologies show the most promise for the next 5 years?
4. What are the key challenges facing battery manufacturers today?

Thank you for your participation in this research.`,
    structured: {
      intro: "Welcome to our expert interview on EU battery technologies. We're conducting research to understand the current landscape and future opportunities in this rapidly evolving sector.",
      objectives: [
        "Assess current market dynamics in EU battery manufacturing",
        "Identify key technological trends and innovations",
        "Understand regulatory landscape and its impact",
        "Evaluate competitive positioning of major players"
      ],
      sections: [
        {
          title: "Market Dynamics",
          questions: [
            {
              id: "q1",
              type: "open",
              prompt: "What are the main drivers of growth in the EU battery market?",
              required: true
            },
            {
              id: "q2",
              type: "scale",
              prompt: "How would you rate the current competitive intensity?",
              scale: { min: 1, max: 5, labels: { 1: "Very Low", 5: "Very High" } },
              required: true
            }
          ]
        },
        {
          title: "Technology & Innovation",
          questions: [
            {
              id: "q3",
              type: "open",
              prompt: "Which technologies show the most promise for the next 5 years?",
              followUps: ["Can you elaborate on the technical advantages?", "What are the main barriers to adoption?"]
            },
            {
              id: "q4",
              type: "multi",
              prompt: "Which of these areas need the most innovation investment?",
              options: ["Energy density", "Charging speed", "Longevity", "Sustainability", "Cost reduction"],
              required: true
            }
          ]
        }
      ],
      closing: "Thank you for your participation in this research."
    },
    validation: { complete: true, issues: [] }
  },
  {
    id: 'guide-2',
    agentId: 'agent-2',
    rawText: `Quick NPS survey for retail experience.

1. How likely are you to recommend us to a friend? (0-10 scale)
2. What's the main reason for your score?
3. Any suggestions for improvement?

Thank you!`,
    structured: {
      intro: "Quick NPS survey for retail experience.",
      objectives: ["Measure customer satisfaction", "Identify improvement areas"],
      sections: [
        {
          title: "NPS Assessment",
          questions: [
            {
              id: "nps",
              type: "scale",
              prompt: "How likely are you to recommend us to a friend?",
              scale: { min: 0, max: 10 },
              required: true
            },
            {
              id: "reason",
              type: "open",
              prompt: "What's the main reason for your score?",
              required: true
            },
            {
              id: "suggestions",
              type: "open",
              prompt: "Any suggestions for improvement?"
            }
          ]
        }
      ],
      closing: "Thank you!"
    },
    validation: { complete: true, issues: [] }
  }
];

const mockKnowledgeAssets: KnowledgeAsset[] = [
  {
    id: 'knowledge-genai-1',
    agentId: 'agent-genai-strategy',
    title: 'GenAI in Consulting Industry Report 2024',
    type: 'file',
    fileName: 'genai_consulting_landscape_2024.pdf',
    fileSize: 3200000
  },
  {
    id: 'knowledge-genai-2',
    agentId: 'agent-genai-strategy',
    title: 'Strategy Consultant Interview Protocol',
    type: 'text',
    contentText: `Interview Guidelines:
    
Target Respondents:
- Strategy consultants with 3+ years experience
- Direct exposure to GenAI projects (either internal or client-facing)
- Mix of firm sizes: MBB, Big 4, boutique firms
- Geographic diversity: North America, Europe, Asia-Pacific

Key Probing Areas:
1. Quantify adoption rates and timelines
2. Understand workflow integration points
3. Explore pricing and value perception
4. Assess competitive positioning
5. Project future industry evolution

Interview Duration: 45-60 minutes
Compensation: $200 consulting credit or equivalent`
  },
  {
    id: 'knowledge-genai-3',
    agentId: 'agent-genai-strategy',
    title: 'Consulting Firm GenAI Capabilities Matrix',
    type: 'file',
    fileName: 'firm_genai_capabilities_comparison.xlsx',
    fileSize: 750000
  },
  {
    id: 'knowledge-genai-4',
    agentId: 'agent-genai-strategy',
    title: 'GenAI Technology Stack Reference',
    type: 'text',
    contentText: `Common GenAI Technologies in Strategy Consulting:

Large Language Models:
- GPT-4, Claude, Gemini for analysis and synthesis
- Custom fine-tuned models for specific domains

Specialized Tools:
- Market research: Crayon, Klenty, SimilarWeb
- Data analysis: DataRobot, H2O.ai, Dataiku
- Presentation: Gamma, Beautiful.ai, Tome

Integration Platforms:
- Microsoft Copilot for M365
- Google Workspace AI features
- Custom enterprise solutions

Key Considerations:
- Data security and client confidentiality
- Model accuracy and bias mitigation
- Integration with existing workflows
- Training and change management`
  },
  {
    id: 'knowledge-1',
    agentId: 'agent-1',
    title: 'EU Battery Market Report 2024',
    type: 'file',
    fileName: 'eu_battery_market_2024.pdf',
    fileSize: 2400000
  },
  {
    id: 'knowledge-2',
    agentId: 'agent-1',
    title: 'Industry Expert Contacts',
    type: 'text',
    contentText: 'List of key industry experts in EU battery sector:\n\n1. Dr. Maria Schmidt - Head of Battery Research, TU Berlin\n2. Prof. Jean Dubois - Energy Storage Institute, Sorbonne\n3. Henrik Andersson - CTO, NorthVolt\n\nContact protocols and key topics for each expert...'
  },
  {
    id: 'knowledge-3',
    agentId: 'agent-1',
    title: 'Technical Specifications Guide',
    type: 'file',
    fileName: 'battery_tech_specs_v3.docx',
    fileSize: 890000
  },
  {
    id: 'knowledge-4',
    agentId: 'agent-2',
    title: 'Retail Location Details',
    type: 'text',
    contentText: 'Store information:\n- Location: Downtown Shopping Center\n- Opening hours: 9 AM - 9 PM\n- Store size: 2,500 sq ft\n- Staff: 8 team members\n- Peak hours: 12-2 PM, 6-8 PM'
  },
  {
    id: 'knowledge-5',
    agentId: 'agent-2',
    title: 'Previous NPS Results',
    type: 'file',
    fileName: 'nps_history_q1_q3.xlsx',
    fileSize: 156000
  }
];

const mockInterviews: InterviewSummary[] = [
  {
    id: 'interview-genai-1',
    agentId: 'agent-genai-strategy',
    startedAt: '2024-12-08T14:00:00Z',
    durationSec: 2834,
    channel: 'inbound_call',
    completed: true,
    respondentId: 'resp-genai-1'
  },
  {
    id: 'interview-genai-2',
    agentId: 'agent-genai-strategy',
    startedAt: '2024-12-08T16:30:00Z',
    durationSec: 3156,
    channel: 'inbound_call',
    completed: true,
    respondentId: 'resp-genai-2'
  },
  {
    id: 'interview-genai-3',
    agentId: 'agent-genai-strategy',
    startedAt: '2024-12-09T10:15:00Z',
    durationSec: 2945,
    channel: 'inbound_call',
    completed: false,
    respondentId: 'resp-genai-3'
  },
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
  },

  // Get agent interview guide
  async getAgentGuide(agentId: string): Promise<InterviewGuide | null> {
    await delay(300);
    return mockInterviewGuides.find(guide => guide.agentId === agentId) || null;
  },

  // Get agent knowledge assets
  async getAgentKnowledge(agentId: string): Promise<KnowledgeAsset[]> {
    await delay(300);
    return mockKnowledgeAssets.filter(asset => asset.agentId === agentId);
  }
};

// Utility function for simulating API delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}