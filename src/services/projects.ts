import { Project, ProjectMember } from '@/types';

// Mock data for projects
const mockProjects: Project[] = [
  {
    id: 'proj-genai-research',
    name: 'GenAI Research Initiative',
    description: 'Comprehensive research on generative AI adoption in enterprise environments',
    createdAt: '2024-11-15T10:30:00Z',
    ownerId: 'user-123',
    agentsCount: 3,
    members: [
      {
        userId: 'user-123',
        email: 'sarah.chen@company.com',
        name: 'Sarah Chen',
        role: 'owner',
        joinedAt: '2024-11-15T10:30:00Z'
      },
      {
        userId: 'user-456',
        email: 'mike.rodriguez@company.com', 
        name: 'Mike Rodriguez',
        role: 'admin',
        joinedAt: '2024-11-16T14:20:00Z'
      },
      {
        userId: 'user-789',
        email: 'emma.johnson@company.com',
        name: 'Emma Johnson', 
        role: 'member',
        joinedAt: '2024-11-18T09:15:00Z'
      }
    ]
  },
  {
    id: 'proj-customer-insights',
    name: 'Customer Experience Study',
    description: 'Understanding customer pain points and satisfaction drivers',
    createdAt: '2024-11-20T14:45:00Z',
    ownerId: 'user-123',
    agentsCount: 2,
    members: [
      {
        userId: 'user-123',
        email: 'sarah.chen@company.com',
        name: 'Sarah Chen',
        role: 'owner',
        joinedAt: '2024-11-20T14:45:00Z'
      },
      {
        userId: 'user-101',
        email: 'david.kim@company.com',
        name: 'David Kim',
        role: 'member',
        joinedAt: '2024-11-21T11:30:00Z'
      }
    ]
  },
  {
    id: 'proj-product-feedback',
    name: 'Product Feedback Collection',
    description: 'Gathering feedback on new product features and usability',
    createdAt: '2024-11-25T09:00:00Z',
    ownerId: 'user-456',
    agentsCount: 1,
    members: [
      {
        userId: 'user-456',
        email: 'mike.rodriguez@company.com',
        name: 'Mike Rodriguez',
        role: 'owner',
        joinedAt: '2024-11-25T09:00:00Z'
      },
      {
        userId: 'user-123',
        email: 'sarah.chen@company.com',
        name: 'Sarah Chen',
        role: 'admin',
        joinedAt: '2024-11-25T16:20:00Z'
      }
    ]
  }
];

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects;
  },

  async getProject(projectId: string): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockProjects.find(p => p.id === projectId) || null;
  },

  async createProject(projectData: Partial<Project>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      ownerId: 'user-123', // Current user
      agentsCount: 0,
      members: [
        {
          userId: 'user-123',
          email: 'sarah.chen@company.com',
          name: 'Sarah Chen',
          role: 'owner',
          joinedAt: new Date().toISOString()
        }
      ]
    };

    mockProjects.unshift(newProject);
    return newProject;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...updates };
    return mockProjects[projectIndex];
  },

  async deleteProject(projectId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return false;

    mockProjects.splice(projectIndex, 1);
    return true;
  },

  async addMember(projectId: string, email: string, role: 'admin' | 'member' = 'member'): Promise<ProjectMember | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) return null;

    // Check if member already exists
    if (project.members.some(m => m.email === email)) {
      throw new Error('User is already a member of this project');
    }

    const newMember: ProjectMember = {
      userId: `user-${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role,
      joinedAt: new Date().toISOString()
    };

    project.members.push(newMember);
    return newMember;
  },

  async removeMember(projectId: string, userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) return false;

    const memberIndex = project.members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) return false;

    // Can't remove owner
    if (project.members[memberIndex].role === 'owner') {
      throw new Error('Cannot remove project owner');
    }

    project.members.splice(memberIndex, 1);
    return true;
  }
};