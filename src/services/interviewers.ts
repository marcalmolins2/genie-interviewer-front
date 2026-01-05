// Mock Service Layer for Interviewers API
import { Interviewer, InterviewGuide, KnowledgeAsset, InterviewSummary, GuideSchema, PRICE_BY_CHANNEL, InterviewerCollaborator, InterviewerRole, Channel } from '@/types';

// Generate a short 6-character alphanumeric code
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Current user ID (mock - in production this would come from auth)
const CURRENT_USER_ID = 'current-user-1';
const CURRENT_USER = {
  id: 'current-user-1',
  name: 'You (Current User)',
  email: 'your.email@bcg.com',
  department: 'Strategy'
};

// Mock Okta users for sharing
const mockOktaUsers = [
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah.chen@bcg.com', department: 'Strategy' },
  { id: 'user-2', name: 'Michael Rodriguez', email: 'michael.rodriguez@bcg.com', department: 'Operations' },
  { id: 'user-3', name: 'Emma Johnson', email: 'emma.johnson@bcg.com', department: 'Digital' },
  { id: 'user-4', name: 'David Kim', email: 'david.kim@bcg.com', department: 'Technology' },
  { id: 'user-5', name: 'Lisa Wang', email: 'lisa.wang@bcg.com', department: 'Marketing' },
  { id: 'user-6', name: 'James Thompson', email: 'james.thompson@bcg.com', department: 'Finance' },
  { id: 'user-7', name: 'Ana Garcia', email: 'ana.garcia@bcg.com', department: 'Strategy' },
  { id: 'user-8', name: 'Robert Lee', email: 'robert.lee@bcg.com', department: 'Operations' },
];

// Mock collaborators data - current user is owner of all interviewers by default
const mockCollaborators: InterviewerCollaborator[] = [
  {
    id: 'collab-1',
    interviewerId: 'interviewer-1',
    userId: CURRENT_USER_ID,
    user: CURRENT_USER,
    permission: 'owner',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z'
  },
  {
    id: 'collab-2',
    interviewerId: 'interviewer-1',
    userId: 'user-1',
    user: mockOktaUsers[0],
    permission: 'editor',
    invitedBy: CURRENT_USER_ID,
    createdAt: '2024-12-02T14:00:00Z',
    updatedAt: '2024-12-02T14:00:00Z'
  },
  {
    id: 'collab-3',
    interviewerId: 'interviewer-1',
    userId: 'user-2',
    user: mockOktaUsers[1],
    permission: 'viewer',
    invitedBy: CURRENT_USER_ID,
    createdAt: '2024-12-03T09:00:00Z',
    updatedAt: '2024-12-03T09:00:00Z'
  },
  {
    id: 'collab-4',
    interviewerId: 'interviewer-genai-strategy',
    userId: CURRENT_USER_ID,
    user: CURRENT_USER,
    permission: 'owner',
    createdAt: '2024-11-25T08:00:00Z',
    updatedAt: '2024-11-25T08:00:00Z'
  },
  {
    id: 'collab-5',
    interviewerId: 'interviewer-2',
    userId: CURRENT_USER_ID,
    user: CURRENT_USER,
    permission: 'owner',
    createdAt: '2024-11-28T14:30:00Z',
    updatedAt: '2024-11-28T14:30:00Z'
  },
  {
    id: 'collab-6',
    interviewerId: 'interviewer-3',
    userId: CURRENT_USER_ID,
    user: CURRENT_USER,
    permission: 'owner',
    createdAt: '2024-12-05T09:15:00Z',
    updatedAt: '2024-12-05T09:15:00Z'
  },
  {
    id: 'collab-7',
    interviewerId: 'interviewer-4',
    userId: CURRENT_USER_ID,
    user: CURRENT_USER,
    permission: 'owner',
    createdAt: '2024-12-01T11:00:00Z',
    updatedAt: '2024-12-01T11:00:00Z'
  },
  {
    id: 'collab-8',
    interviewerId: 'interviewer-web-link',
    userId: CURRENT_USER_ID,
    user: CURRENT_USER,
    permission: 'owner',
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-10T09:00:00Z'
  }
];

// Mock data
const mockInterviewers: Interviewer[] = [
  {
    id: 'interviewer-genai-strategy',
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
    id: 'interviewer-1',
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
    id: 'interviewer-2',
    name: 'Retail NPS Pulse',
    archetype: 'rapid_survey',
    createdAt: '2024-11-28T14:30:00Z',
    status: 'live',
    language: 'es',
    channel: 'inbound_call',
    interviewsCount: 142,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.inbound_call,
    contact: { phoneNumber: '+1 (555) 234-5678' },
    credentialsReady: true,
  },
  {
    id: 'interviewer-3',
    name: 'Customer Feedback Portal',
    archetype: 'customer_user',
    createdAt: '2024-12-05T09:15:00Z',
    status: 'suspended',
    language: 'en',
    channel: 'inbound_call',
    interviewsCount: 23,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.inbound_call,
    contact: { phoneNumber: '+1 (555) 345-6789' },
    credentialsReady: true,
    hasActiveCall: false,
  },
  {
    id: 'interviewer-4',
    name: 'Active Call Demo Interviewer',
    archetype: 'diagnostic',
    createdAt: '2024-12-01T11:00:00Z',
    status: 'live',
    language: 'en',
    channel: 'inbound_call',
    interviewsCount: 5,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.inbound_call,
    contact: { phoneNumber: '+1 (555) 111-2222' },
    credentialsReady: true,
    hasActiveCall: true,
  },
  {
    id: 'interviewer-web-link',
    name: 'Web Interview Demo',
    archetype: 'customer_user',
    createdAt: '2024-12-10T09:00:00Z',
    status: 'live',
    language: 'en',
    voiceId: 'voice-1',
    channel: 'web_link',
    interviewsCount: 12,
    pricePerInterviewUsd: PRICE_BY_CHANNEL.web_link,
    contact: { linkId: 'DEMO42' },
    credentialsReady: true,
  }
];

const mockInterviewGuides: InterviewGuide[] = [
  {
    id: 'guide-genai-strategy',
    interviewerId: 'interviewer-genai-strategy',
    rawText: `### Respondent Screener
- Confirm the respondent's role and experience in strategy consulting.

### Industry Overview
- What percentage of strategy consulting engagements now incorporate GenAI tools?

### Process Analysis
- Walk through a typical strategy engagement workflow.

### Market Dynamics
- How are strategy consulting firms pricing GenAI-enhanced engagements?

### Future Trends
- Looking ahead 3–5 years, which strategic consulting functions will be most transformed?`,
    structured: {
      intro: "This research explores the integration of Generative AI in strategy consulting.",
      objectives: [
        "Quantify current GenAI adoption rates",
        "Map successful GenAI integration points",
        "Analyze pricing models"
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
            }
          ]
        }
      ],
      closing: "Thank you for sharing your insights."
    }
  },
  {
    id: 'guide-1',
    interviewerId: 'interviewer-1',
    rawText: `Welcome to our expert interview on EU battery technologies.`,
    structured: {
      intro: "Welcome to our expert interview on EU battery technologies.",
      objectives: [
        "Assess current market dynamics",
        "Identify key technological trends"
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
            }
          ]
        }
      ],
      closing: "Thank you for your participation."
    }
  }
];

const mockKnowledgeAssets: KnowledgeAsset[] = [
  {
    id: 'knowledge-genai-1',
    interviewerId: 'interviewer-genai-strategy',
    title: 'GenAI in Consulting Industry Report 2024',
    type: 'file',
    fileName: 'genai_consulting_landscape_2024.pdf',
    fileSize: 3200000
  },
  {
    id: 'knowledge-1',
    interviewerId: 'interviewer-1',
    title: 'EU Battery Market Report 2024',
    type: 'file',
    fileName: 'eu_battery_market_2024.pdf',
    fileSize: 2400000
  }
];

const mockInterviews: InterviewSummary[] = [
  {
    id: 'interview-genai-1',
    interviewerId: 'interviewer-genai-strategy',
    startedAt: '2024-12-08T14:00:00Z',
    durationSec: 2834,
    channel: 'inbound_call',
    completed: true,
    respondentId: 'resp-genai-1'
  },
  {
    id: 'interview-1',
    interviewerId: 'interviewer-1',
    startedAt: '2024-12-08T15:30:00Z',
    durationSec: 1847,
    channel: 'inbound_call',
    completed: true,
    respondentId: 'resp-1'
  }
];

// API Service Functions
export const interviewersService = {
  // Get all interviewers (excludes deleted and archived)
  async getInterviewers(): Promise<Interviewer[]> {
    await delay(500);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const indicesToRemove = mockInterviewers
      .map((interviewer, index) => ({ interviewer, index }))
      .filter(({ interviewer }) => interviewer.deletedAt && new Date(interviewer.deletedAt) < thirtyDaysAgo)
      .map(({ index }) => index);
    
    indicesToRemove.reverse().forEach(index => mockInterviewers.splice(index, 1));
    
    return mockInterviewers.filter(interviewer => !interviewer.deletedAt && !interviewer.archivedAt);
  },

  // Get single interviewer
  async getInterviewer(id: string): Promise<Interviewer | null> {
    await delay(300);
    return mockInterviewers.find(interviewer => interviewer.id === id) || null;
  },

  // Create new interviewer
  async createInterviewer(data: Partial<Interviewer>): Promise<Interviewer> {
    await delay(800);
    const channel = data.channel || 'inbound_call';
    const contact: Interviewer['contact'] = {};
    
    if (channel === 'inbound_call') {
      contact.phoneNumber = `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    } else if (channel === 'web_link') {
      contact.linkId = generateShortCode();
    }
    
    const newInterviewer: Interviewer = {
      id: `interviewer-${Date.now()}`,
      name: data.name || 'Untitled Interviewer',
      archetype: data.archetype || 'rapid_survey',
      createdAt: new Date().toISOString(),
      status: 'ready_to_test',
      language: data.language || 'en',
      voiceId: data.voiceId,
      channel,
      interviewsCount: 0,
      pricePerInterviewUsd: PRICE_BY_CHANNEL[channel],
      contact,
      credentialsReady: true,
    };
    
    mockInterviewers.push(newInterviewer);
    return newInterviewer;
  },

  // Update interviewer
  async updateInterviewer(id: string, data: Partial<Interviewer>): Promise<Interviewer> {
    await delay(500);
    const index = mockInterviewers.findIndex(interviewer => interviewer.id === id);
    if (index === -1) throw new Error('Interviewer not found');
    
    mockInterviewers[index] = { ...mockInterviewers[index], ...data };
    return mockInterviewers[index];
  },

  // Provision contact info
  async provisionContact(interviewerId: string): Promise<{ contact: Interviewer['contact'] }> {
    await delay(1000);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');

    let contact: Interviewer['contact'] = {};
    
    if (interviewer.channel === 'inbound_call') {
      contact.phoneNumber = `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    } else if (interviewer.channel === 'web_link') {
      contact.linkId = generateShortCode();
    }

    interviewer.contact = contact;
    interviewer.credentialsReady = true;
    
    return { contact };
  },

  // Get interviewer by link ID
  async getInterviewerByLinkId(linkId: string): Promise<Interviewer | null> {
    await delay(300);
    return mockInterviewers.find(interviewer => interviewer.contact?.linkId === linkId) || null;
  },

  // Deploy interviewer
  async deployInterviewer(interviewerId: string, caseCode: string): Promise<{ status: 'live' }> {
    await delay(800);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');
    
    interviewer.status = 'live';
    return { status: 'live' };
  },

  // Activate interviewer
  async activateInterviewer(interviewerId: string): Promise<Interviewer> {
    await delay(400);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');
    
    if (interviewer.status === 'suspended' || interviewer.status === 'paused') {
      interviewer.status = 'live';
    }
    
    return interviewer;
  },

  // Get interviewer interviews
  async getInterviewerInterviews(interviewerId: string): Promise<InterviewSummary[]> {
    await delay(400);
    return mockInterviews.filter(interview => interview.interviewerId === interviewerId);
  },

  // Get interviewer stats
  async getInterviewerStats(interviewerId: string): Promise<any> {
    await delay(600);
    const interviews = mockInterviews.filter(i => i.interviewerId === interviewerId);
    
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

  // Get interviewer guide
  async getInterviewerGuide(interviewerId: string): Promise<InterviewGuide | null> {
    await delay(300);
    return mockInterviewGuides.find(guide => guide.interviewerId === interviewerId) || null;
  },

  // Get interviewer knowledge
  async getInterviewerKnowledge(interviewerId: string): Promise<KnowledgeAsset[]> {
    await delay(300);
    return mockKnowledgeAssets.filter(asset => asset.interviewerId === interviewerId);
  },

  // Update interviewer guide
  async updateInterviewerGuide(interviewerId: string, guideText: string, structured?: GuideSchema | null): Promise<InterviewGuide> {
    await delay(400);
    const guideIndex = mockInterviewGuides.findIndex(g => g.interviewerId === interviewerId);
    
    if (guideIndex === -1) {
      const newGuide: InterviewGuide = {
        id: `guide-${Date.now()}`,
        interviewerId,
        rawText: guideText,
        structured: structured || undefined
      };
      mockInterviewGuides.push(newGuide);
      return newGuide;
    } else {
      mockInterviewGuides[guideIndex] = {
        ...mockInterviewGuides[guideIndex],
        rawText: guideText,
        structured: structured || mockInterviewGuides[guideIndex].structured
      };
      return mockInterviewGuides[guideIndex];
    }
  },

  // Add knowledge asset
  async addKnowledgeAsset(interviewerId: string, assetData: { title: string; type: 'text' | 'file'; contentText?: string; fileName?: string; fileSize?: number }): Promise<KnowledgeAsset> {
    await delay(400);
    const newAsset: KnowledgeAsset = {
      id: `knowledge-${Date.now()}`,
      interviewerId,
      ...assetData
    };
    mockKnowledgeAssets.push(newAsset);
    return newAsset;
  },

  // Remove knowledge asset
  async removeKnowledgeAsset(assetId: string): Promise<void> {
    await delay(300);
    const assetIndex = mockKnowledgeAssets.findIndex(a => a.id === assetId);
    if (assetIndex !== -1) {
      mockKnowledgeAssets.splice(assetIndex, 1);
    }
  },

  // Trash operations
  async moveToTrash(interviewerId: string): Promise<Interviewer> {
    await delay(400);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');
    
    if (interviewer.hasActiveCall) {
      throw new Error('ACTIVE_CALL_IN_PROGRESS');
    }
    
    interviewer.deletedAt = new Date().toISOString();
    if (interviewer.status === 'live') {
      interviewer.status = 'suspended';
    }
    return interviewer;
  },

  async restoreInterviewer(interviewerId: string): Promise<Interviewer> {
    await delay(400);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');
    
    delete interviewer.deletedAt;
    return interviewer;
  },

  async permanentlyDeleteInterviewer(interviewerId: string): Promise<void> {
    await delay(500);
    const interviewerIndex = mockInterviewers.findIndex(i => i.id === interviewerId);
    if (interviewerIndex === -1) throw new Error('Interviewer not found');
    
    mockInterviewers.splice(interviewerIndex, 1);
    
    const guideIndex = mockInterviewGuides.findIndex(g => g.interviewerId === interviewerId);
    if (guideIndex !== -1) mockInterviewGuides.splice(guideIndex, 1);
    
    const assetIndices = mockKnowledgeAssets
      .map((asset, index) => asset.interviewerId === interviewerId ? index : -1)
      .filter(index => index !== -1);
    assetIndices.reverse().forEach(index => mockKnowledgeAssets.splice(index, 1));
  },

  async getTrashedInterviewers(): Promise<Interviewer[]> {
    await delay(500);
    return mockInterviewers.filter(interviewer => interviewer.deletedAt);
  },

  // Archive operations
  async archiveInterviewer(interviewerId: string): Promise<Interviewer> {
    await delay(400);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');
    
    interviewer.archivedAt = new Date().toISOString();
    interviewer.status = 'archived';
    return interviewer;
  },

  async unarchiveInterviewer(interviewerId: string): Promise<Interviewer> {
    await delay(400);
    const interviewer = mockInterviewers.find(i => i.id === interviewerId);
    if (!interviewer) throw new Error('Interviewer not found');
    
    delete interviewer.archivedAt;
    interviewer.status = 'paused';
    return interviewer;
  },

  async getLastInterviewDate(interviewerId: string): Promise<string | null> {
    await delay(200);
    const interviews = mockInterviews.filter(i => i.interviewerId === interviewerId);
    if (interviews.length === 0) return null;
    return interviews.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )[0].startedAt;
  },

  async getArchivedInterviewers(): Promise<Interviewer[]> {
    await delay(500);
    return mockInterviewers.filter(interviewer => interviewer.archivedAt && !interviewer.deletedAt);
  },

  // Collaborator Management
  async getInterviewerCollaborators(interviewerId: string): Promise<InterviewerCollaborator[]> {
    await delay(300);
    return mockCollaborators.filter(c => c.interviewerId === interviewerId);
  },

  async getUserPermission(interviewerId: string): Promise<InterviewerRole | null> {
    await delay(200);
    const collab = mockCollaborators.find(
      c => c.interviewerId === interviewerId && c.userId === CURRENT_USER_ID
    );
    return collab?.permission || null;
  },

  async searchUsers(query: string, interviewerId: string): Promise<typeof mockOktaUsers> {
    await delay(200);
    const existingUserIds = mockCollaborators
      .filter(c => c.interviewerId === interviewerId)
      .map(c => c.userId);
    
    return mockOktaUsers.filter(user => 
      !existingUserIds.includes(user.id) &&
      (user.name.toLowerCase().includes(query.toLowerCase()) ||
       user.email.toLowerCase().includes(query.toLowerCase()) ||
       user.department.toLowerCase().includes(query.toLowerCase()))
    );
  },

  async inviteCollaborator(interviewerId: string, userId: string, permission: InterviewerRole): Promise<InterviewerCollaborator> {
    await delay(400);
    
    const currentUserCollab = mockCollaborators.find(
      c => c.interviewerId === interviewerId && c.userId === CURRENT_USER_ID
    );
    if (currentUserCollab?.permission !== 'owner') {
      throw new Error('Only owners can invite collaborators');
    }

    const existing = mockCollaborators.find(
      c => c.interviewerId === interviewerId && c.userId === userId
    );
    if (existing) {
      throw new Error('User already has access to this interviewer');
    }

    const userToInvite = mockOktaUsers.find(u => u.id === userId);
    if (!userToInvite) {
      throw new Error('User not found');
    }

    const newCollab: InterviewerCollaborator = {
      id: `collab-${Date.now()}`,
      interviewerId,
      userId,
      user: userToInvite,
      permission,
      invitedBy: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockCollaborators.push(newCollab);
    return newCollab;
  },

  async updateCollaboratorPermission(collaboratorId: string, permission: InterviewerRole): Promise<InterviewerCollaborator> {
    await delay(300);
    
    const collab = mockCollaborators.find(c => c.id === collaboratorId);
    if (!collab) {
      throw new Error('Collaborator not found');
    }

    const currentUserCollab = mockCollaborators.find(
      c => c.interviewerId === collab.interviewerId && c.userId === CURRENT_USER_ID
    );
    if (currentUserCollab?.permission !== 'owner') {
      throw new Error('Only owners can change permissions');
    }

    if (collab.userId === CURRENT_USER_ID) {
      throw new Error('Cannot change your own permission');
    }

    collab.permission = permission;
    collab.updatedAt = new Date().toISOString();
    return collab;
  },

  async removeCollaborator(collaboratorId: string): Promise<void> {
    await delay(300);
    
    const collabIndex = mockCollaborators.findIndex(c => c.id === collaboratorId);
    if (collabIndex === -1) {
      throw new Error('Collaborator not found');
    }

    const collab = mockCollaborators[collabIndex];

    const currentUserCollab = mockCollaborators.find(
      c => c.interviewerId === collab.interviewerId && c.userId === CURRENT_USER_ID
    );
    if (currentUserCollab?.permission !== 'owner') {
      throw new Error('Only owners can remove collaborators');
    }

    if (collab.userId === CURRENT_USER_ID) {
      throw new Error('Cannot remove yourself. Transfer ownership first.');
    }

    mockCollaborators.splice(collabIndex, 1);
  },

  async transferOwnership(interviewerId: string, newOwnerId: string): Promise<void> {
    await delay(400);
    
    const currentOwnerCollab = mockCollaborators.find(
      c => c.interviewerId === interviewerId && c.userId === CURRENT_USER_ID && c.permission === 'owner'
    );
    if (!currentOwnerCollab) {
      throw new Error('Only owners can transfer ownership');
    }

    const newOwnerCollab = mockCollaborators.find(
      c => c.interviewerId === interviewerId && c.userId === newOwnerId
    );
    if (!newOwnerCollab) {
      throw new Error('New owner must be an existing collaborator');
    }

    currentOwnerCollab.permission = 'editor';
    currentOwnerCollab.updatedAt = new Date().toISOString();
    
    newOwnerCollab.permission = 'owner';
    newOwnerCollab.updatedAt = new Date().toISOString();
  }
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
