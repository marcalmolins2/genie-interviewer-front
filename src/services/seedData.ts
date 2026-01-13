import { supabase } from '@/integrations/supabase/client';

// Seed data UUIDs - using deterministic IDs for consistency
const SEED_PROJECT_IDS = {
  retail: '11111111-1111-1111-1111-111111111111',
  healthcare: '22222222-2222-2222-2222-222222222222',
  financial: '33333333-3333-3333-3333-333333333333',
};

const SEED_INTERVIEWER_IDS = {
  customerExperience: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  storeManager: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  medicalDevice: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  patientFeedback: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  fintechDD: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  marketAnalysis: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
};

export const seedDataService = {
  /**
   * Seed projects into Supabase
   */
  async seedProjects(): Promise<{ success: boolean; message: string }> {
    const projects = [
      {
        id: SEED_PROJECT_IDS.retail,
        name: 'Retail Transformation Study',
        description: 'Customer experience research for major retail client',
        project_type: 'client_work',
        case_code: 'BCG-2024-001',
      },
      {
        id: SEED_PROJECT_IDS.healthcare,
        name: 'Healthcare Innovation',
        description: 'Expert interviews for healthcare technology assessment',
        project_type: 'commercial_proposal',
        case_code: 'BCG-2024-002',
      },
      {
        id: SEED_PROJECT_IDS.financial,
        name: 'Financial Services DD',
        description: 'Due diligence interviews for fintech acquisition',
        project_type: 'client_investment',
        case_code: 'BCG-2024-003',
      },
    ];

    const { error } = await supabase
      .from('projects')
      .upsert(projects, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding projects:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: `Seeded ${projects.length} projects` };
  },

  /**
   * Create project memberships for the current user
   */
  async seedProjectMemberships(): Promise<{ success: boolean; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: 'Must be logged in to seed memberships' };
    }

    const memberships = Object.values(SEED_PROJECT_IDS).map(projectId => ({
      project_id: projectId,
      user_id: user.id,
      role: 'owner' as const,
    }));

    const { error } = await supabase
      .from('project_memberships')
      .upsert(memberships, { onConflict: 'project_id,user_id' });

    if (error) {
      console.error('Error seeding memberships:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: `Created owner access to ${memberships.length} projects` };
  },

  /**
   * Seed interviewers into Supabase
   */
  async seedInterviewers(): Promise<{ success: boolean; message: string }> {
    const interviewers = [
      // Project 1: Retail
      {
        id: SEED_INTERVIEWER_IDS.customerExperience,
        project_id: SEED_PROJECT_IDS.retail,
        name: 'Customer Experience Bot',
        title: 'Retail Customer Experience Study',
        description: 'Understanding customer pain points and satisfaction levels across retail touchpoints',
        archetype: 'customer_interview',
        status: 'live',
        channel: 'inbound_call',
        language: 'en',
        target_duration_min: 15,
        credentials_ready: true,
        short_code: 'RETAIL1',
        link_id: 'RETAIL1',
      },
      {
        id: SEED_INTERVIEWER_IDS.storeManager,
        project_id: SEED_PROJECT_IDS.retail,
        name: 'Store Manager Insights',
        title: 'Store Manager Leadership Insights',
        description: 'Gathering perspectives from store managers on operational challenges',
        archetype: 'belief_audit',
        status: 'live',
        channel: 'inbound_call',
        language: 'en',
        target_duration_min: 30,
        credentials_ready: true,
        short_code: 'RETAIL2',
        link_id: 'RETAIL2',
      },
      // Project 2: Healthcare
      {
        id: SEED_INTERVIEWER_IDS.medicalDevice,
        project_id: SEED_PROJECT_IDS.healthcare,
        name: 'Medical Device Expert',
        title: 'Medical Device Technology Deep Dive',
        description: 'Technical validation interviews with medical device specialists',
        archetype: 'expert_interview',
        status: 'live',
        channel: 'inbound_call',
        language: 'en',
        target_duration_min: 45,
        credentials_ready: true,
        short_code: 'HEALTH1',
        link_id: 'HEALTH1',
      },
      {
        id: SEED_INTERVIEWER_IDS.patientFeedback,
        project_id: SEED_PROJECT_IDS.healthcare,
        name: 'Patient Feedback',
        title: 'Patient Experience Feedback',
        description: 'Collecting patient feedback on healthcare service quality',
        archetype: 'customer_interview',
        status: 'draft',
        channel: 'inbound_call',
        language: 'en',
        target_duration_min: 10,
        credentials_ready: false,
        short_code: 'HEALTH2',
        link_id: 'HEALTH2',
      },
      // Project 3: Financial
      {
        id: SEED_INTERVIEWER_IDS.fintechDD,
        project_id: SEED_PROJECT_IDS.financial,
        name: 'Fintech DD Expert',
        title: 'Fintech Due Diligence Research',
        description: 'Investigative interviews for fintech market analysis',
        archetype: 'expert_interview',
        status: 'live',
        channel: 'inbound_call',
        language: 'en',
        target_duration_min: 60,
        credentials_ready: true,
        short_code: 'FINDD1',
        link_id: 'FINDD1',
      },
      {
        id: SEED_INTERVIEWER_IDS.marketAnalysis,
        project_id: SEED_PROJECT_IDS.financial,
        name: 'Market Analysis',
        title: 'Quick Market Sentiment Survey',
        description: 'Rapid pulse check on market trends and investor sentiment',
        archetype: 'maturity_assessment',
        status: 'archived',
        channel: 'inbound_call',
        language: 'en',
        target_duration_min: 5,
        credentials_ready: true,
        archived_at: new Date().toISOString(),
        short_code: 'FINDD2',
        link_id: 'FINDD2',
      },
    ];

    const { error } = await supabase
      .from('interviewers')
      .upsert(interviewers, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding interviewers:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: `Seeded ${interviewers.length} interviewers` };
  },

  /**
   * Seed sessions into Supabase
   */
  async seedSessions(): Promise<{ success: boolean; message: string }> {
    const sessions = [
      // Interviewer 1 sessions
      { id: 's1111111-1111-1111-1111-111111111111', interviewer_id: SEED_INTERVIEWER_IDS.customerExperience, conversation_type: 'live', started_at: '2024-11-15T14:30:00Z', ended_at: '2024-11-15T14:45:00Z', duration_sec: 892, completed: true },
      { id: 's2222222-2222-2222-2222-222222222222', interviewer_id: SEED_INTERVIEWER_IDS.customerExperience, conversation_type: 'live', started_at: '2024-11-16T10:00:00Z', ended_at: '2024-11-16T10:12:00Z', duration_sec: 720, completed: true },
      { id: 's3333333-3333-3333-3333-333333333333', interviewer_id: SEED_INTERVIEWER_IDS.customerExperience, conversation_type: 'test', started_at: '2024-06-05T11:00:00Z', ended_at: '2024-06-05T11:05:00Z', duration_sec: 300, completed: true },
      // Interviewer 2 sessions
      { id: 's4444444-4444-4444-4444-444444444444', interviewer_id: SEED_INTERVIEWER_IDS.storeManager, conversation_type: 'live', started_at: '2024-11-20T09:00:00Z', ended_at: '2024-11-20T09:32:00Z', duration_sec: 1920, completed: true },
      { id: 's5555555-5555-5555-5555-555555555555', interviewer_id: SEED_INTERVIEWER_IDS.storeManager, conversation_type: 'live', started_at: '2024-11-21T15:00:00Z', duration_sec: 0, completed: false },
      // Interviewer 3 sessions
      { id: 's6666666-6666-6666-6666-666666666666', interviewer_id: SEED_INTERVIEWER_IDS.medicalDevice, conversation_type: 'live', started_at: '2024-11-18T11:00:00Z', ended_at: '2024-11-18T11:48:00Z', duration_sec: 2880, completed: true },
      // Interviewer 5 sessions
      { id: 's7777777-7777-7777-7777-777777777777', interviewer_id: SEED_INTERVIEWER_IDS.fintechDD, conversation_type: 'live', started_at: '2024-12-01T10:00:00Z', ended_at: '2024-12-01T11:02:00Z', duration_sec: 3720, completed: true },
      { id: 's8888888-8888-8888-8888-888888888888', interviewer_id: SEED_INTERVIEWER_IDS.fintechDD, conversation_type: 'live', started_at: '2024-12-02T14:00:00Z', ended_at: '2024-12-02T14:55:00Z', duration_sec: 3300, completed: true },
      // Interviewer 6 sessions
      { id: 's9999999-9999-9999-9999-999999999999', interviewer_id: SEED_INTERVIEWER_IDS.marketAnalysis, conversation_type: 'live', started_at: '2024-09-15T10:00:00Z', ended_at: '2024-09-15T10:04:00Z', duration_sec: 240, completed: true },
      { id: 'saaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', interviewer_id: SEED_INTERVIEWER_IDS.marketAnalysis, conversation_type: 'live', started_at: '2024-09-16T11:00:00Z', ended_at: '2024-09-16T11:05:00Z', duration_sec: 300, completed: true },
    ];

    const { error } = await supabase
      .from('sessions')
      .upsert(sessions, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding sessions:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: `Seeded ${sessions.length} sessions` };
  },

  /**
   * Seed all data in the correct order
   */
  async seedAll(): Promise<{ success: boolean; results: string[] }> {
    const results: string[] = [];
    
    // 1. Seed projects first (no dependencies)
    const projectsResult = await this.seedProjects();
    results.push(`Projects: ${projectsResult.message}`);
    if (!projectsResult.success) {
      return { success: false, results };
    }

    // 2. Seed project memberships (depends on projects and authenticated user)
    const membershipsResult = await this.seedProjectMemberships();
    results.push(`Memberships: ${membershipsResult.message}`);
    if (!membershipsResult.success) {
      return { success: false, results };
    }

    // 3. Seed interviewers (depends on projects)
    const interviewersResult = await this.seedInterviewers();
    results.push(`Interviewers: ${interviewersResult.message}`);
    if (!interviewersResult.success) {
      return { success: false, results };
    }

    // 4. Seed sessions (depends on interviewers)
    const sessionsResult = await this.seedSessions();
    results.push(`Sessions: ${sessionsResult.message}`);
    if (!sessionsResult.success) {
      return { success: false, results };
    }

    return { success: true, results };
  },

  /**
   * Check if seed data already exists
   */
  async checkSeedDataExists(): Promise<boolean> {
    const { data } = await supabase
      .from('projects')
      .select('id')
      .eq('id', SEED_PROJECT_IDS.retail)
      .maybeSingle();

    return !!data;
  },
};
