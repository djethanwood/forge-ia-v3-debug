// Types principaux pour FORGE-IA V2
export interface Project {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'api' | 'desktop';
  tech_stack: string[];
  created_at: string;
  updated_at: string;
  owner_id: string;
  git_url?: string;
  status: 'active' | 'archived' | 'in_development';
  description?: string;
  version?: string;
}

export interface AIAnalysis {
  id: string;
  project_id: string;
  analysis_type: 'code_quality' | 'performance' | 'security' | 'accessibility';
  ai_model: 'claude' | 'codellama' | 'openchat';
  findings: Record<string, unknown>;
  recommendations: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'applied';
  created_at: string;
  execution_time?: number;
}

export interface Component {
  id: string;
  name: string;
  category: 'ui' | 'layout' | 'form' | 'chart' | 'navigation';
  framework: 'react' | 'vue' | 'svelte';
  code: string;
  props_schema: Record<string, unknown>;
  preview_url?: string;
  tags: string[];
  downloads: number;
  rating?: number;
  author?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    complexity?: number;
  };
}

export interface AITask {
  type: 'conversational' | 'creative' | 'technical';
  complexity: number;
  context: string;
  code?: string;
  language?: string;
  requirements?: string[];
}

export interface AIResponse {
  success: boolean;
  data?: {
    content: string;
    structured_data?: Record<string, unknown>;
  };
  model: string;
  tokensUsed?: number;
  error?: string;
  processingTime: number;
}

export interface ExportOptions {
  format: 'zip' | 'github' | 'codesandbox' | 'stackblitz';
  includeAssets: boolean;
  minify: boolean;
  includeTests?: boolean;
  includeDocs?: boolean;
}

export interface FileStructure {
  [key: string]: {
    type: 'file' | 'directory';
    content?: string;
    children?: FileStructure;
    metadata?: {
      size?: number;
      lastModified?: Date;
      permissions?: string;
    };
  };
}

export interface CodeGenerationOptions {
  projectName: string;
  template: string;
  framework: 'react' | 'vue' | 'svelte' | 'nodejs' | 'nextjs' | 'nuxt';
  typescript: boolean;
  styling: 'css' | 'scss' | 'tailwind' | 'styled-components' | 'emotion';
  features: string[];
  testing: boolean;
  linting: boolean;
  deployment: 'vercel' | 'netlify' | 'docker' | 'manual';
}

export interface DatabaseSchema {
  id: string;
  name: string;
  tables: DatabaseTable[];
  relationships: DatabaseRelationship[];
}

export interface DatabaseTable {
  name: string;
  fields: DatabaseField[];
  indexes?: DatabaseIndex[];
}

export interface DatabaseField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'file' | 'relation';
  required: boolean;
  unique?: boolean;
  default?: unknown;
  validation?: string;
}

export interface DatabaseRelationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  cascadeDelete?: boolean;
}

export interface DatabaseIndex {
  fields: string[];
  unique: boolean;
}

export interface GitRepository {
  id: string;
  name: string;
  url: string;
  branch: string;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: Date;
  };
}

export interface SecurityScan {
  id: string;
  project_id: string;
  scan_type: 'vulnerability' | 'dependency' | 'code_quality' | 'compliance';
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: SecurityFinding[];
  created_at: Date;
  completed_at?: Date;
}

export interface SecurityFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  cwe_id?: string;
}

// Types d'événements pour le système de notifications
export interface NotificationEvent {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}
