// Project Service Layer
import { Project, ProjectMembership, ProjectRole, ProjectType, User } from '@/types';
import { mockProjects, mockProjectMemberships, mockUsers, getProjectById, getUserById } from './mockData';

// Current user ID (mock - in production this would come from auth)
const CURRENT_USER_ID = 'user-1';

export interface CreateProjectInput {
  name: string;
  caseCode: string;
  projectType: ProjectType;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  caseCode?: string;
  projectType?: ProjectType;
  description?: string;
}

// In-memory store for new projects (mock persistence)
let projectsStore = [...mockProjects];
let membershipsStore = [...mockProjectMemberships];

export const projectsService = {
  /**
   * Get all projects the current user has access to
   */
  async getProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get projects where user has membership
    const userMemberships = membershipsStore.filter(pm => pm.userId === CURRENT_USER_ID);
    const projectIds = userMemberships.map(pm => pm.projectId);
    
    return projectsStore.filter(p => projectIds.includes(p.id));
  },

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return projectsStore.find(p => p.id === projectId) || null;
  },

  /**
   * Get current user's role in a project
   */
  async getUserProjectRole(projectId: string): Promise<ProjectRole | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const membership = membershipsStore.find(
      pm => pm.projectId === projectId && pm.userId === CURRENT_USER_ID
    );
    return membership?.role || null;
  },

  /**
   * Create a new project (current user becomes owner)
   */
  async createProject(data: CreateProjectInput): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date().toISOString();
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: data.name,
      caseCode: data.caseCode,
      projectType: data.projectType,
      description: data.description,
      createdAt: now,
      updatedAt: now,
    };

    projectsStore.push(newProject);

    // Add current user as owner
    const membership: ProjectMembership = {
      id: `pm-${Date.now()}`,
      userId: CURRENT_USER_ID,
      projectId: newProject.id,
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    };
    membershipsStore.push(membership);

    return newProject;
  },

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: UpdateProjectInput): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const index = projectsStore.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error('Project not found');
    }

    projectsStore[index] = {
      ...projectsStore[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return projectsStore[index];
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    projectsStore = projectsStore.filter(p => p.id !== projectId);
    membershipsStore = membershipsStore.filter(pm => pm.projectId !== projectId);
  },

  /**
   * Get all members of a project
   */
  async getProjectMembers(projectId: string): Promise<(ProjectMembership & { user?: User })[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return membershipsStore
      .filter(pm => pm.projectId === projectId)
      .map(pm => ({
        ...pm,
        user: getUserById(pm.userId) || mockUsers.find(u => u.id === pm.userId),
      }));
  },

  /**
   * Add a member to a project
   */
  async addProjectMember(projectId: string, userId: string, role: ProjectRole): Promise<ProjectMembership> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Check if already a member
    const existing = membershipsStore.find(
      pm => pm.projectId === projectId && pm.userId === userId
    );
    if (existing) {
      throw new Error('User is already a member of this project');
    }

    const now = new Date().toISOString();
    const membership: ProjectMembership = {
      id: `pm-${Date.now()}`,
      userId,
      projectId,
      role,
      createdAt: now,
      updatedAt: now,
    };

    membershipsStore.push(membership);
    return membership;
  },

  /**
   * Update a member's role
   */
  async updateMemberRole(projectId: string, userId: string, role: ProjectRole): Promise<ProjectMembership> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = membershipsStore.findIndex(
      pm => pm.projectId === projectId && pm.userId === userId
    );
    if (index === -1) {
      throw new Error('Membership not found');
    }

    membershipsStore[index] = {
      ...membershipsStore[index],
      role,
      updatedAt: new Date().toISOString(),
    };

    return membershipsStore[index];
  },

  /**
   * Remove a member from a project
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    membershipsStore = membershipsStore.filter(
      pm => !(pm.projectId === projectId && pm.userId === userId)
    );
  },

  /**
   * Search users (for inviting)
   */
  async searchUsers(query: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const lowerQuery = query.toLowerCase();
    return mockUsers.filter(
      u => u.isActive && (
        u.name.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
      )
    );
  },
};
