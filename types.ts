
export type CompanyStage = 'Startup' | 'Growth' | 'Mature' | 'Transformation';

export interface IndustryNode {
  id: string;
  label: string;
  type: 'industry' | 'process';
  children?: IndustryNode[];
  selected?: boolean;
}

export interface SearchQuery {
  query: string;
  volume: number;
  cpc: number;
  competition: 'Low' | 'Medium' | 'High';
}

export interface RoadmapStep {
  phase: string;
  duration: string;
  description: string;
  tasks: string[];
}

export interface MicroIdea {
  id: string;
  title: string;
  priority: string;
  description: string;
  hours: number;
  cost: string;
}

export interface BusinessProblem {
  issue: string;
  rootCause: string; // Первопричина (почему это происходит на самом деле)
  metrics: { financialLoss: string };
}

export interface ProblemGroup {
  id: string;
  title: string;
  problems: BusinessProblem[];
}

export interface InvestorProposal {
  pitch: string;
  investorBenefit: string;
  initiatorBenefit: string; // Выгода собственника (снижение нагрузки)
  groupInvestmentModel: string;
  financialHighlights: string[];
  smartContractTerms: string; // Условия ForgeProtocol
}

export interface ContactInfo {
  name: string;
  companyName: string;
  phone: string;
  email: string;
  telegram?: string;
}

export interface LandingPageContent {
  headline: string;
  subheadline: string;
  benefits: string[];
  features: string[];
  cta: string;
  painPoints: string[];
  founderStory: string; // История собственника и почему он ищет партнеров
}

export interface Idea {
  id: string;
  problemStatement: string; // Острая боль
  rootCauses: string[]; // Массив первопричин для быстрого согласия
  title: string; // Название решения
  description: string;
  department: string;
  roiEstimate: string;
  targetRole: string;
  priorityScore: number;
  industryId: string;
  
  diagnostic?: { groups: ProblemGroup[] };
  microIdeas?: MicroIdea[];
  roadmap?: RoadmapStep[];
  investorProposal?: InvestorProposal;
  searchQueries?: SearchQuery[];
  roleTasks?: { specialistTasks: string[]; managerKPIs: string[] };
  
  isAnalyzed?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  contactInfo?: ContactInfo;
}

export enum ViewState {
  INDUSTRIES = 'INDUSTRIES',
  IDEAS = 'IDEAS',
  IDEA_DETAIL = 'IDEA_DETAIL',
  LANDING_GENERATOR = 'LANDING_GENERATOR',
  CATALOG = 'CATALOG',
}
