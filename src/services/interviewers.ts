import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type {
  Interviewer,
  InterviewerInsert,
  InterviewerUpdate,
  Session,
  SessionInsert,
  Profile,
  InterviewerRole,
  InterviewerWithProject,
  ArchetypeType,
  ChannelType,
  ConversationType,
  ExpertSourceType,
  InterviewerStatus,
  Project,
  ProjectMembership,
} from '@/integrations/supabase/database.types';

// Extended membership type with user profile
export interface InterviewerMembership {
  id: string;
  interviewer_id: string;
  user_id: string;
  role: InterviewerRole;
  created_at: string;
}

export type InterviewerMembershipWithUser = InterviewerMembership & {
  profile?: Profile;
};

export interface CreateInterviewerInput {
  projectId: string;
  name: string;
  description?: string;
  archetype?: ArchetypeType;
  channel?: ChannelType;
  conversationType?: ConversationType;
  expertSource?: ExpertSourceType;
  voice?: string;
  interviewGuide?: object;
  knowledgeAssets?: object[];
}

export interface UpdateInterviewerInput {
  name?: string;
  description?: string;
  archetype?: ArchetypeType;
  status?: InterviewerStatus;
  channel?: ChannelType;
  conversationType?: ConversationType;
  expertSource?: ExpertSourceType;
  voice?: string;
  interviewGuide?: object;
  knowledgeAssets?: object[];
  phoneNumber?: string;
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

// Mock data for when Supabase is not configured
const mockInterviewers: Interviewer[] = [
  {
    id: 'int-1',
    project_id: 'proj-1',
    name: 'Consumer Feedback Agent',
    description: 'Gathers feedback from retail consumers',
    archetype: 'market_research',
    status: 'active',
    channel: 'web',
    conversation_type: 'structured',
    expert_source: null,
    voice: 'alloy',
    interview_guide: null,
    knowledge_assets: null,
    short_code: 'ABC123',
    phone_number: null,
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    deleted_at: null,
  },
  {
    id: 'int-2',
    project_id: 'proj-2',
    name: 'Healthcare Executive Interviewer',
    description: 'B2B interviews with healthcare decision makers',
    archetype: 'ux_research',
    status: 'draft',
    channel: 'phone',
    conversation_type: 'exploratory',
    expert_source: 'glg',
    voice: 'echo',
    interview_guide: null,
    knowledge_assets: null,
    short_code: 'XYZ789',
    phone_number: '+1234567890',
    created_by: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    deleted_at: null,
  },
];

const mockSessions: Session[] = [
  {
    id: 'sess-1',
    interviewer_id: 'int-1',
    respondent_name: 'John Doe',
    respondent_email: 'john@example.com',
    status: 'completed',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    ended_at: new Date(Date.now() - 84600000).toISOString(),
    duration_minutes: 30,
    transcript: null,
    summary: null,
    feedback: 'positive',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const interviewersService = {
  /**
   * Get all interviewers (optionally filtered by project)
   */
  async getInterviewers(projectId?: string): Promise<InterviewerWithProject[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      let filtered = mockInterviewers.filter(i => !i.deleted_at && !i.archived_at);
      if (projectId) {
        filtered = filtered.filter(i => i.project_id === projectId);
      }
      return filtered.map(i => ({ ...i, project: undefined }));
    }

    let query = supabase
      .from('interviewers')
      .select(`
        *,
        project:projects(*)
      `)
      .is('deleted_at', null)
      .is('archived_at', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({
      ...d,
      project: d.project as unknown as Project,
    })) as InterviewerWithProject[];
  },

  /**
   * Get archived interviewers
   */
  async getArchivedInterviewers(projectId?: string): Promise<InterviewerWithProject[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      let filtered = mockInterviewers.filter(i => i.archived_at && !i.deleted_at);
      if (projectId) {
        filtered = filtered.filter(i => i.project_id === projectId);
      }
      return filtered.map(i => ({ ...i, project: undefined }));
    }

    let query = supabase
      .from('interviewers')
      .select(`
        *,
        project:projects(*)
      `)
      .not('archived_at', 'is', null)
      .is('deleted_at', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('archived_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({
      ...d,
      project: d.project as unknown as Project,
    })) as InterviewerWithProject[];
  },

  /**
   * Get deleted (trashed) interviewers
   */
  async getDeletedInterviewers(projectId?: string): Promise<InterviewerWithProject[]> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      let filtered = mockInterviewers.filter(i => i.deleted_at);
      if (projectId) {
        filtered = filtered.filter(i => i.project_id === projectId);
      }
      return filtered.map(i => ({ ...i, project: undefined }));
    }

    let query = supabase
      .from('interviewers')
      .select(`
        *,
        project:projects(*)
      `)
      .not('deleted_at', 'is', null);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('deleted_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({
      ...d,
      project: d.project as unknown as Project,
    })) as InterviewerWithProject[];
  },

  /**
   * Get a single interviewer by ID
   */
  async getInterviewer(id: string): Promise<InterviewerWithProject | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const interviewer = mockInterviewers.find(i => i.id === id);
      return interviewer ? { ...interviewer, project: undefined } : null;
    }

    const { data, error } = await supabase
      .from('interviewers')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      project: data.project as unknown as Project,
    } as InterviewerWithProject;
  },

  /**
   * Get interviewer by short code (for public access)
   */
  async getInterviewerByShortCode(shortCode: string): Promise<Interviewer | null> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 50));
      return mockInterviewers.find(i => i.short_code === shortCode) || null;
    }

    const { data, error } = await supabase
      .from('interviewers')
      .select('*')
      .eq('short_code', shortCode)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new interviewer
   */
  async createInterviewer(input: CreateInterviewerInput): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newInterviewer: Interviewer = {
        id: `int-${Date.now()}`,
        project_id: input.projectId,
        name: input.name,
        description: input.description || null,
        archetype: input.archetype || 'custom',
        status: 'draft',
        channel: input.channel || 'web',
        conversation_type: input.conversationType || 'structured',
        expert_source: input.expertSource || null,
        voice: input.voice || 'alloy',
        interview_guide: input.interviewGuide || null,
        knowledge_assets: input.knowledgeAssets || null,
        short_code: generateShortCode(),
        phone_number: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
        deleted_at: null,
      };
      mockInterviewers.push(newInterviewer);
      return newInterviewer;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const interviewerData: InterviewerInsert = {
      project_id: input.projectId,
      name: input.name,
      description: input.description,
      archetype: input.archetype || 'custom',
      channel: input.channel || 'web',
      conversation_type: input.conversationType || 'structured',
      expert_source: input.expertSource,
      voice: input.voice || 'alloy',
      interview_guide: input.interviewGuide,
      knowledge_assets: input.knowledgeAssets,
      short_code: generateShortCode(),
      created_by: user?.id,
    };

    const { data, error } = await supabase
      .from('interviewers')
      .insert(interviewerData)
      .select()
      .single();

    if (error) throw error;
    return data;
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
        description: input.description ?? mockInterviewers[index].description,
        archetype: input.archetype ?? mockInterviewers[index].archetype,
        status: input.status ?? mockInterviewers[index].status,
        channel: input.channel ?? mockInterviewers[index].channel,
        conversation_type: input.conversationType ?? mockInterviewers[index].conversation_type,
        expert_source: input.expertSource ?? mockInterviewers[index].expert_source,
        voice: input.voice ?? mockInterviewers[index].voice,
        phone_number: input.phoneNumber ?? mockInterviewers[index].phone_number,
        updated_at: new Date().toISOString(),
      };
      return mockInterviewers[index];
    }

    const updateData: InterviewerUpdate = {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.archetype && { archetype: input.archetype }),
      ...(input.status && { status: input.status }),
      ...(input.channel && { channel: input.channel }),
      ...(input.conversationType && { conversation_type: input.conversationType }),
      ...(input.expertSource !== undefined && { expert_source: input.expertSource }),
      ...(input.voice && { voice: input.voice }),
      ...(input.interviewGuide !== undefined && { interview_guide: input.interviewGuide }),
      ...(input.knowledgeAssets !== undefined && { knowledge_assets: input.knowledgeAssets }),
      ...(input.phoneNumber !== undefined && { phone_number: input.phoneNumber }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('interviewers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Archive an interviewer
   */
  async archiveInterviewer(id: string): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers[index].archived_at = new Date().toISOString();
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
    return data;
  },

  /**
   * Restore an archived interviewer
   */
  async restoreInterviewer(id: string): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers[index].archived_at = null;
      mockInterviewers[index].deleted_at = null;
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
    return data;
  },

  /**
   * Soft delete an interviewer (move to trash)
   */
  async deleteInterviewer(id: string): Promise<Interviewer> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const index = mockInterviewers.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Interviewer not found');
      mockInterviewers[index].deleted_at = new Date().toISOString();
      mockInterviewers[index].status = 'deleted';
      return mockInterviewers[index];
    }

    const { data, error } = await supabase
      .from('interviewers')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
   * Deploy an interviewer (set to active)
   */
  async deployInterviewer(id: string): Promise<Interviewer> {
    return this.updateInterviewer(id, { status: 'active' });
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
      return mockSessions.filter(s => s.interviewer_id === interviewerId);
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('interviewer_id', interviewerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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
    return data;
  },

  /**
   * Create a new session
   */
  async createSession(interviewerId: string, data?: Partial<SessionInsert>): Promise<Session> {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const newSession: Session = {
        id: `sess-${Date.now()}`,
        interviewer_id: interviewerId,
        respondent_name: data?.respondent_name || null,
        respondent_email: data?.respondent_email || null,
        status: 'pending',
        started_at: null,
        ended_at: null,
        duration_minutes: null,
        transcript: null,
        summary: null,
        feedback: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockSessions.push(newSession);
      return newSession;
    }

    const sessionData: SessionInsert = {
      interviewer_id: interviewerId,
      respondent_name: data?.respondent_name,
      respondent_email: data?.respondent_email,
      status: 'pending',
    };

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;
    return session;
  },

  /**
   * Get interviewer collaborators/members (via project membership - interviewers inherit from projects)
   */
  async getInterviewerMembers(interviewerId: string): Promise<InterviewerMembershipWithUser[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    // Get the interviewer's project first
    const { data: interviewer, error: intError } = await supabase
      .from('interviewers')
      .select('project_id')
      .eq('id', interviewerId)
      .single();

    if (intError || !interviewer) return [];

    // Get project members (interviewers inherit access from projects)
    const { data, error } = await supabase
      .from('project_memberships')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('project_id', interviewer.project_id);

    if (error) throw error;

    return (data || []).map(m => ({
      id: m.id,
      interviewer_id: interviewerId,
      user_id: m.user_id,
      role: m.role as InterviewerRole,
      created_at: m.created_at,
      profile: m.profile as unknown as Profile,
    }));
  },
};

// Legacy alias for backward compatibility
export const agentsService = interviewersService;
