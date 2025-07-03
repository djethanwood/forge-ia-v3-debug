import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Project } from '../types';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  createProject: (name: string, type: Project['type']) => void;
  loadProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  saveProject: (project: Project) => void;
  exportProject: (projectId: string, format: string) => void;
  importProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'demo-1',
      name: 'E-commerce Platform',
      type: 'web',
      tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: 'user-1',
      status: 'active'
    }
  ]);
  const [currentProject, setCurrentProject] = useState<Project | null>(projects[0]);

  const createProject = useCallback((name: string, type: Project['type']) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      type,
      tech_stack: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: 'user-1',
      status: 'in_development'
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
  }, []);

  const loadProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  }, [projects]);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updated_at: new Date().toISOString() }
        : project
    ));

    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentProject]);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  }, [currentProject]);

  const saveProject = useCallback((project: Project) => {
    console.log("💾 Sauvegarde du projet", project.name);
    updateProject(project.id, project);
  }, [updateProject]);

  const exportProject = useCallback((projectId: string, format: string) => {
    console.log("📤 Export du projet", projectId, "en format", format);
  }, []);

  const importProject = useCallback(() => {
    console.log("📥 Import de projet");
  }, []);

  const value: ProjectContextType = {
    projects,
    currentProject,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    saveProject,
    exportProject,
    importProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject doit être utilisé dans un ProjectProvider');
  }
  return context;
};

export default ProjectContext;
