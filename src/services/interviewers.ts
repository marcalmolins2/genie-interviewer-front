import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type {
  Interviewer,
  Session,
  Project,
  ProjectMembership,
  InterviewerRole,
  InterviewerStatus,
  Channel,
  Archetype,
  ConversationType,
  User,
  InterviewGuide,
  KnowledgeAsset,
  AgentPermission,
  Agent,
} from '@/types';
import { PRICE_BY_CHANNEL } from '@/types';
import type {
  Profile,
  InterviewerInsert,
  InterviewerUpdate,
  InterviewerWithProject,
  InterviewerRow,
  SessionRow,
  ProjectRow,
} from '@/integrations/supabase/database.types';

// Extended membership type with user profile
export interface InterviewerMembership {
  id: string;
  interviewerId: string;
  userId: string;
  role: InterviewerRole;
  createdAt: string;
}

export type InterviewerMembershipWithUser = InterviewerMembership & {
  user?: User;
};

export interface CreateInterviewerInput {
  projectId: string;
  name: string;
  title?: string;
  description?: string;
  archetype?: Archetype;
  channel?: Channel;
  language?: string;
  voiceId?: string;
  targetDurationMin?: number;
}

export interface UpdateInterviewerInput {
  name?: string;
  title?: string;
  description?: string;
  archetype?: Archetype;
  status?: InterviewerStatus;
  channel?: Channel;
  language?: string;
  voiceId?: string;
  targetDurationMin?: number;
  phoneNumber?: string;
  chatUrl?: string;
  linkId?: string;
}

// Generate random short code for sharing
function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to convert InterviewerRow to Interviewer
function rowToInterviewer(row: InterviewerRow, project?: Project): Interviewer {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title || row.name,
    description: row.description || undefined,
    name: row.name,
    archetype: row.archetype as Archetype,
    status: row.status as InterviewerStatus,
    channel: row.channel as Channel,
    language: row.language || 'en',
    voiceId: row.voice_id || undefined,
    contact: {
      phoneNumber: row.phone_number || undefined,
      chatUrl: row.chat_url || undefined,
      chatPassword: row.chat_password || undefined,
      linkId: row.link_id || row.short_code || undefined,
    },
    credentialsReady: row.credentials_ready || false,
    targetDurationMin: row.target_duration_min || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    project,
  };
}

// Helper to convert SessionRow to Session
function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    interviewerId: row.interviewer_id,
    conversationType: (row.conversation_type || 'live') as ConversationType,
    startedAt: row.started_at || row.created_at,
    endedAt: row.ended_at || undefined,
    durationSec: row.duration_sec || undefined,
    completed: row.completed,
    respondentId: row.respondent_id || undefined,
    createdAt: row.created_at,
  };
}

// Helper to convert Interviewer to legacy Agent type
function interviewerToAgent(interviewer: Interviewer & { project?: Project }): Agent {
  return {
    id: interviewer.id,
    name: interviewer.name,
    title: interviewer.title,
    description: interviewer.description,
    archetype: interviewer.archetype,
    createdAt: interviewer.createdAt,
    updatedAt: interviewer.updatedAt,
    status: interviewer.status,
    language: interviewer.language,
    voiceId: interviewer.voiceId,
    channel: interviewer.channel,
    interviewsCount: interviewer.sessionsCount || 0,
    pricePerInterviewUsd: PRICE_BY_CHANNEL[interviewer.channel] || 50,
    contact: interviewer.contact,
    credentialsReady: interviewer.credentialsReady,
    projectId: interviewer.projectId,
    targetDuration: interviewer.targetDurationMin,
  };
}

// Mock data for when Supabase is not configured
const mockInterviewers: Interviewer[] = [
  {
    id: 'int-1',
    projectId: 'proj-1',
    title: 'Consumer Feedback Agent',
    name: 'Sam',
    description: 'Gathers feedback from retail consumers',
    archetype: 'customer_interview',
    status: 'live',
    channel: 'web_link',
    language: 'en',
    voiceId: 'alloy',
    contact: { linkId: 'ABC123' },
    credentialsReady: true,
    sessionsCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'int-2',
    projectId: 'proj-2',
    title: 'Healthcare Executive Interviewer',
    name: 'Alex',
    description: 'B2B interviews with healthcare decision makers',
    archetype: 'expert_interview',
    status: 'draft',
    channel: 'inbound_call',
    language: 'en',
    voiceId: 'echo',
    contact: { phoneNumber: '+1234567890' },
    credentialsReady: true,
    sessionsCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockSessions: Session[] = [
  {
    id: 'sess-1',
    interviewerId: 'int-1',
    conversationType: 'live',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    endedAt: new Date(Date.now() - 84600000).toISOString(),
    durationSec: 1800,
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

// Store for interview guides and knowledge (mock)
const mockGuides: Record<string, InterviewGuide> = {};
const mockKnowledge: Record<string, KnowledgeAsset[]> = {};

export const interviewersService = {
  /**
   * Get all interviewers (optionally filtered by project)
   */
  async getInterviewers(projectId?: string): Promise<InterviewerWithProject[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      let filtered = mockInterviewers.filter(i => i.status !== 'archived');
      if (projectId) {
        filtered = filtered.filter(i => i.projectId === projectId);
      }
      return filtered;
    }

    let query = supabase
      .from('interviewers')
      .select(`*, project:projects(*)`)
      .is('deleted_at', null)
      .is('archived_at', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => {
      const row = d as unknown as InterviewerRow & { project: ProjectRow | null };
      let project: Project | undefined;
      if (row.project) {
        project = {
          id: row.project.id,
          caseCode: row.project.case_code || '',
          name: row.project.name,
          description: row.project.description || undefined,
          projectType: row.project.project_type as any,
          createdAt: row.project.created_at,
          updatedAt: row.project.updated_at,
        };
      }
      return rowToInterviewer(row, project);
    });
  },

  /**
   * Get archived interviewers
   */
  async getArchivedInterviewers(projectId?: string): Promise<InterviewerWithProject[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      let filtered = mockInterviewers.filter(i => i.status === 'archived');
      if (projectId) {
        filtered = filtered.filter(i => i.projectId === projectId);
      }
      return filtered;
    }

    let query = supabase
      .from('interviewers')
      .select(`*, project:projects(*)`)
      .not('archived_at', 'is', null)
      .is('deleted_at', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('archived_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => {
      const row = d as unknown as InterviewerRow & { project: ProjectRow | null };
      let project: Project | undefined;
      if (row.project) {
        project = {
          id: row.project.id,
          caseCode: row.project.case_code || '',
          name: row.project.name,
          description: row.project.description || undefined,
          projectType: row.project.project_type as any,
          createdAt: row.project.created_at,
          updatedAt: row.project.updated_at,
        };
      }
      return rowToInterviewer(row, project);
    });
  },

  /**
   * Get deleted (trashed) interviewers
   */
  async getDeletedInterviewers(projectId?: string): Promise<InterviewerWithProject[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [];
    }

    let query = supabase
      .from('interviewers')
      .select(`*, project:projects(*)`)
      .not('deleted_at', 'is', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => {
      const row = d as unknown as InterviewerRow & { project: ProjectRow | null };
      let project: Project | undefined;
      if (row.project) {
        project = {
          id: row.project.id,
          caseCode: row.project.case_code || '',
          name: row.project.name,
          description: row.project.description || undefined,
          projectType: row.project.project_type as any,
          createdAt: row.project.created_at,
          updatedAt: row.project.updated_at,
        };
      }
      return rowToInterviewer(row, project);
    });
  },

  /**
   * Get a single interviewer by ID
   */
  async getInterviewer(id: string): Promise<InterviewerWithProject | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockInterviewers.find(i => i.id === id) || null;
    }

    const { data, error } = await supabase
      .from('interviewers')
      .select(`*, project:projects(*)`)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as unknown as InterviewerRow & { project: ProjectRow | null };
    let project: Project | undefined;
    if (row.project) {
      project = {
        id: row.project.id,
        caseCode: row.project.case_code || '',
        name: row.project.name,
        description: row.project.description || undefined,
        projectType: row.project.project_type as any,
        createdAt: row.project.created_at,
        updatedAt: row.project.updated_at,
      };
    }
    return rowToInterviewer(row, project);
  },

  /**
   * Get interviewer by short code (for public access)
   */
  async getInterviewerByShortCode(shortCode: string): Promise<Interviewer | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockInterviewers.find(i => i.contact.linkId === shortCode) || null;
    }

    const { data, error } = await supabase
      .from('interviewers')
      .select('*')
      .or(`short_code.eq.${shortCode},link_id.eq.${shortCode}`)
      .eq('status', 'live')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return rowToInterviewer(data as unknown as InterviewerRow);
  },

  /**
   * @deprecated Use getInterviewerByShortCode instead - returns Agent for legacy compatibility
   */
  async getAgentByLinkId(linkId: string): Promise<Agent | null> {
    const interviewer = await this.getInterviewerByShortCode(linkId);
    return interviewer ? interviewerToAgent(interviewer) : null;
  },

  /**
   * Create a new interviewer
   */
  async createInterviewer(input: CreateInterviewerInput): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newInterviewer: Interviewer = {
        id: `int-${Date.now()}`,
        projectId: input.projectId,
        title: input.title || input.name,
        name: input.name,
        description: input.description,
        archetype: input.archetype || 'customer_interview',
        status: 'draft',
        channel: input.channel || 'web_link',
        language: input.language || 'en',
        voiceId: input.voiceId || 'alloy',
        contact: { linkId: generateShortCode() },
        credentialsReady: false,
        targetDurationMin: input.targetDurationMin,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockInterviewers.push(newInterviewer);
      return newInterviewer;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const shortCode = generateShortCode();

    const interviewerData: InterviewerInsert = {
      project_id: input.projectId,
      name: input.name,
      title: input.title || input.name,
      description: input.description || null,
      archetype: input.archetype || 'customer_interview',
      channel: input.channel || 'web_link',
      language: input.language || 'en',
      voice_id: input.voiceId || null,
      target_duration_min: input.targetDurationMin || null,
      short_code: shortCode,
      link_id: shortCode,
      credentials_ready: false,
      created_by: user?.id || null,
    };

    const { data, error } = await supabase
      .from('interviewers')
      .insert(interviewerData)
      .select()
      .single();

    if (error) throw error;
    return rowToInterviewer(data as unknown as InterviewerRow);
  },

  /**
   * Update an interviewer
   */
  async updateInterviewer(id: string, input: UpdateInterviewerInput): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers[index] = {
        ...mockInterviewers[index],
        name: input.name ?? mockInterviewers[index].name,
        title: input.title ?? mockInterviewers[index].title,
        description: input.description ?? mockInterviewers[index].description,
        archetype: input.archetype ?? mockInterviewers[index].archetype,
        status: input.status ?? mockInterviewers[index].status,
        channel: input.channel ?? mockInterviewers[index].channel,
        language: input.language ?? mockInterviewers[index].language,
        voiceId: input.voiceId ?? mockInterviewers[index].voiceId,
        targetDurationMin: input.targetDurationMin ?? mockInterviewers[index].targetDurationMin,
        contact: {
          ...mockInterviewers[index].contact,
          phoneNumber: input.phoneNumber ?? mockInterviewers[index].contact.phoneNumber,
          chatUrl: input.chatUrl ?? mockInterviewers[index].contact.chatUrl,
          linkId: input.linkId ?? mockInterviewers[index].contact.linkId,
        },
        updatedAt: new Date().toISOString(),
      };
      return mockInterviewers[index];
    }

    const updateData: InterviewerUpdate = {};
    if (input.name) updateData.name = input.name;
    if (input.title) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description || null;
    if (input.archetype) updateData.archetype = input.archetype;
    if (input.status) updateData.status = input.status;
    if (input.channel) updateData.channel = input.channel;
    if (input.language) updateData.language = input.language;
    if (input.voiceId !== undefined) updateData.voice_id = input.voiceId || null;
    if (input.targetDurationMin !== undefined) updateData.target_duration_min = input.targetDurationMin || null;
    if (input.phoneNumber !== undefined) updateData.phone_number = input.phoneNumber || null;
    if (input.chatUrl !== undefined) updateData.chat_url = input.chatUrl || null;
    if (input.linkId !== undefined) updateData.link_id = input.linkId || null;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('interviewers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToInterviewer(data as unknown as InterviewerRow);
  },

  /**
   * Archive an interviewer
   */
  async archiveInterviewer(id: string): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers[index].status = 'archived';
      return mockInterviewers[index];
    }

    const { data, error } = await supabase
      .from('interviewers')
      .update({
        archived_at: new Date().toISOString(),
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToInterviewer(data as unknown as InterviewerRow);
  },

  /**
   * Restore an archived interviewer
   */
  async restoreInterviewer(id: string): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers[index].status = 'paused';
      return mockInterviewers[index];
    }

    const { data, error } = await supabase
      .from('interviewers')
      .update({
        archived_at: null,
        deleted_at: null,
        status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToInterviewer(data as unknown as InterviewerRow);
  },

  /**
   * Soft delete an interviewer (move to trash)
   */
  async deleteInterviewer(id: string): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers.splice(index, 1);
      return mockInterviewers[0];
    }

    const { data, error } = await supabase
      .from('interviewers')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToInterviewer(data as unknown as InterviewerRow);
  },

  /**
   * Permanently delete an interviewer
   */
  async permanentlyDeleteInterviewer(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index !== -1) mockInterviewers.splice(index, 1);
      return;
    }

    const { error } = await supabase
      .from('interviewers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Deploy an interviewer (set to live)
   */
  async deployInterviewer(id: string): Promise<Interviewer> {
    return this.updateInterviewer(id, { status: 'live' });
  },

  /**
   * Pause an interviewer
   */
  async pauseInterviewer(id: string): Promise<Interviewer> {
    return this.updateInterviewer(id, { status: 'paused' });
  },

  /**
   * Get sessions for an interviewer
   */
  async getInterviewerSessions(interviewerId: string): Promise<Session[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockSessions.filter(s => s.interviewerId === interviewerId);
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('interviewer_id', interviewerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => rowToSession(d as unknown as SessionRow));
  },

  /**
   * Get a single session
   */
  async getSession(sessionId: string): Promise<Session | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockSessions.find(s => s.id === sessionId) || null;
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return rowToSession(data as unknown as SessionRow);
  },

  /**
   * Create a new session
   */
  async createSession(interviewerId: string, data?: { respondentName?: string; respondentEmail?: string }): Promise<Session> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const newSession: Session = {
        id: `sess-${Date.now()}`,
        interviewerId,
        conversationType: 'live',
        startedAt: new Date().toISOString(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      mockSessions.push(newSession);
      return newSession;
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        interviewer_id: interviewerId,
        respondent_name: data?.respondentName || null,
        respondent_email: data?.respondentEmail || null,
        conversation_type: 'live',
        completed: false,
      })
      .select()
      .single();

    if (error) throw error;
    return rowToSession(session as unknown as SessionRow);
  },

  /**
   * Get interviewer members (via project membership)
   */
  async getInterviewerMembers(interviewerId: string): Promise<InterviewerMembershipWithUser[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data: interviewer, error: intError } = await supabase
      .from('interviewers')
      .select('project_id')
      .eq('id', interviewerId)
      .single();

    if (intError || !interviewer) return [];

    const { data, error } = await supabase
      .from('project_memberships')
      .select(`*, profile:profiles(*)`)
      .eq('project_id', interviewer.project_id);

    if (error) throw error;

    return (data || []).map(m => {
      const profile = m.profile as unknown as { id: string; email: string; name: string | null; avatar_url: string | null; created_at: string; updated_at: string } | null;
      const membership: InterviewerMembershipWithUser = {
        id: m.id,
        interviewerId,
        userId: m.user_id,
        role: m.role as InterviewerRole,
        createdAt: m.created_at,
      };
      if (profile) {
        membership.user = {
          id: profile.id,
          email: profile.email || '',
          name: profile.name || '',
          avatar: profile.avatar_url || undefined,
          isActive: true,
          isSuperuser: false,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
      }
      return membership;
    });
  },

  // ==========================================
  // LEGACY ALIASES (backward compatibility)
  // ==========================================

  /** @deprecated Use getInterviewers instead - returns Agent[] for legacy compatibility */
  async getAgents(projectId?: string): Promise<Agent[]> {
    const interviewers = await this.getInterviewers(projectId);
    return interviewers.map(interviewerToAgent);
  },

  /** @deprecated Use getArchivedInterviewers instead - returns Agent[] for legacy compatibility */
  async getArchivedAgents(projectId?: string): Promise<Agent[]> {
    const interviewers = await this.getArchivedInterviewers(projectId);
    return interviewers.map(interviewerToAgent);
  },

  /** @deprecated Use getDeletedInterviewers instead - returns Agent[] for legacy compatibility */
  async getTrashedAgents(projectId?: string): Promise<Agent[]> {
    const interviewers = await this.getDeletedInterviewers(projectId);
    return interviewers.map(interviewerToAgent);
  },

  /** @deprecated Use getInterviewer instead - returns Agent for legacy compatibility */
  async getAgent(id: string): Promise<Agent | null> {
    const interviewer = await this.getInterviewer(id);
    return interviewer ? interviewerToAgent(interviewer) : null;
  },

  /** @deprecated Use createInterviewer instead - returns Agent for legacy compatibility */
  async createAgent(input: CreateInterviewerInput): Promise<Agent> {
    const interviewer = await this.createInterviewer(input);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use updateInterviewer instead - returns Agent for legacy compatibility */
  async updateAgent(id: string, input: UpdateInterviewerInput): Promise<Agent> {
    const interviewer = await this.updateInterviewer(id, input);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use archiveInterviewer instead - returns Agent for legacy compatibility */
  async archiveAgent(id: string): Promise<Agent> {
    const interviewer = await this.archiveInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use restoreInterviewer instead - returns Agent for legacy compatibility */
  async unarchiveAgent(id: string): Promise<Agent> {
    const interviewer = await this.restoreInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use restoreInterviewer instead - returns Agent for legacy compatibility */
  async restoreAgent(id: string): Promise<Agent> {
    const interviewer = await this.restoreInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use deleteInterviewer instead - returns Agent for legacy compatibility */
  async deleteAgent(id: string): Promise<Agent> {
    const interviewer = await this.deleteInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use deleteInterviewer instead - returns Agent for legacy compatibility */
  async moveToTrash(id: string): Promise<Agent> {
    const interviewer = await this.deleteInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use permanentlyDeleteInterviewer instead */
  async permanentlyDeleteAgent(id: string) {
    return this.permanentlyDeleteInterviewer(id);
  },

  /** @deprecated Use deployInterviewer instead - returns Agent for legacy compatibility */
  async deployAgent(id: string): Promise<Agent> {
    const interviewer = await this.deployInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use deployInterviewer instead - returns Agent for legacy compatibility */
  async activateAgent(id: string): Promise<Agent> {
    const interviewer = await this.deployInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use pauseInterviewer instead - returns Agent for legacy compatibility */
  async pauseAgent(id: string): Promise<Agent> {
    const interviewer = await this.pauseInterviewer(id);
    return interviewerToAgent(interviewer);
  },

  /** @deprecated Use getInterviewerSessions instead */
  async getAgentInterviews(interviewerId: string) {
    return this.getInterviewerSessions(interviewerId);
  },

  /** @deprecated Use getInterviewerMembers instead */
  async getAgentCollaborators(interviewerId: string) {
    return this.getInterviewerMembers(interviewerId);
  },

  /** Get last interview date for an interviewer */
  async getLastInterviewDate(interviewerId: string): Promise<string | null> {
    const sessions = await this.getInterviewerSessions(interviewerId);
    if (sessions.length === 0) return null;
    return sessions[0].startedAt;
  },

  /** Get interview guide */
  async getAgentGuide(id: string): Promise<InterviewGuide | null> {
    if (!isSupabaseConfigured()) {
      return mockGuides[id] || null;
    }
    const interviewer = await this.getInterviewer(id);
    return interviewer ? (mockGuides[id] || null) : null;
  },

  /** Update interview guide */
  async updateAgentGuide(id: string, guide: Partial<InterviewGuide>): Promise<InterviewGuide> {
    const existing = mockGuides[id] || { id: `guide-${id}`, interviewerId: id };
    mockGuides[id] = { ...existing, ...guide } as InterviewGuide;
    return mockGuides[id];
  },

  /** Get knowledge assets */
  async getAgentKnowledge(id: string): Promise<KnowledgeAsset[]> {
    return mockKnowledge[id] || [];
  },

  /** Add knowledge asset */
  async addKnowledgeAsset(id: string, asset: Partial<KnowledgeAsset>): Promise<KnowledgeAsset> {
    const newAsset: KnowledgeAsset = {
      id: `ka-${Date.now()}`,
      interviewerId: id,
      title: asset.title || 'Untitled',
      type: asset.type || 'text',
      contentText: asset.contentText,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
    };
    if (!mockKnowledge[id]) mockKnowledge[id] = [];
    mockKnowledge[id].push(newAsset);
    return newAsset;
  },

  /** Get agent stats */
  async getAgentStats(id: string) {
    const sessions = await this.getInterviewerSessions(id);
    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      avgDuration: sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + (s.durationSec || 0), 0) / sessions.length 
        : 0,
    };
  },

  /** Get user permission for an interviewer */
  async getUserPermission(interviewerId: string): Promise<{ role: AgentPermission; canEdit: boolean; canDelete: boolean } | null> {
    const interviewer = await this.getInterviewer(interviewerId);
    if (!interviewer) return null;
    
    if (!isSupabaseConfigured()) {
      return { role: 'owner', canEdit: true, canDelete: true };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: membership } = await supabase
      .from('project_memberships')
      .select('role')
      .eq('project_id', interviewer.projectId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) return null;
    
    const role = membership.role as AgentPermission;
    return {
      role,
      canEdit: role === 'owner' || role === 'editor',
      canDelete: role === 'owner',
    };
  },

  /** Search users (for sharing) */
  async searchUsers(query: string, _existingIds?: string[]): Promise<User[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return (data || []).map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.name || '',
      avatar: profile.avatar_url || undefined,
      isActive: true,
      isSuperuser: false,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }));
  },

  /** Invite collaborator */
  async inviteCollaborator(interviewerId: string, userId: string, role: InterviewerRole) {
    const interviewer = await this.getInterviewer(interviewerId);
    if (!interviewer?.projectId) throw new Error('Interviewer not found');

    if (!isSupabaseConfigured()) {
      return { id: `mock-${Date.now()}`, interviewerId, userId, role, createdAt: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('project_memberships')
      .insert({ project_id: interviewer.projectId, user_id: userId, role })
      .select()
      .single();

    if (error) throw error;
    return { id: data.id, interviewerId, userId, role: data.role, createdAt: data.created_at };
  },

  /** Update collaborator permission */
  async updateCollaboratorPermission(interviewerId: string, userId: string, role: InterviewerRole) {
    const interviewer = await this.getInterviewer(interviewerId);
    if (!interviewer?.projectId) throw new Error('Interviewer not found');

    if (!isSupabaseConfigured()) {
      return { id: `mock-${Date.now()}`, interviewerId, userId, role, createdAt: new Date().toISOString() };
    }

    const { data, error } = await supabase
      .from('project_memberships')
      .update({ role })
      .eq('project_id', interviewer.projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { id: data.id, interviewerId, userId, role: data.role, createdAt: data.created_at };
  },

  /** Remove collaborator */
  async removeCollaborator(interviewerId: string, userId: string) {
    const interviewer = await this.getInterviewer(interviewerId);
    if (!interviewer?.projectId) throw new Error('Interviewer not found');

    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase
      .from('project_memberships')
      .delete()
      .eq('project_id', interviewer.projectId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /** Transfer ownership */
  async transferOwnership(interviewerId: string, newOwnerId: string) {
    const interviewer = await this.getInterviewer(interviewerId);
    if (!interviewer?.projectId) throw new Error('Interviewer not found');

    if (!isSupabaseConfigured()) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase
      .from('project_memberships')
      .update({ role: 'editor' })
      .eq('project_id', interviewer.projectId)
      .eq('user_id', user.id);

    await supabase
      .from('project_memberships')
      .update({ role: 'owner' })
      .eq('project_id', interviewer.projectId)
      .eq('user_id', newOwnerId);
  },

  /** Provision contact (returns mock phone number) */
  async provisionContact(id: string) {
    const phoneNumber = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    await this.updateInterviewer(id, { phoneNumber });
    return { phoneNumber };
  },
};

// Legacy alias for backward compatibility
export const agentsService = interviewersService;
