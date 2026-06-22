import { Context } from 'telegraf';

export interface SessionData {
  step?: string;
  lang?: string;
  phone?: string;
  // Registration
  fullName?: string;
  birthDate?: string;
  gender?: string;
  regionId?: number;
  districtId?: number;
  mahallaId?: number;
  address?: string;
  education?: string;
  employmentStatus?: string;
  socialStatus?: string;
  interests?: string;
  // Appeal creation
  appealTitle?: string;
  appealDescription?: string;
  appealCategory?: string;
  appealPriority?: string;
  appealConfidential?: boolean;
  appealFileId?: string;
  appealFileType?: string;
  appealLatitude?: number;
  appealLongitude?: number;
  appealContactPhone?: string;
  // Problem creation
  problemTitle?: string;
  problemDescription?: string;
  problemCategory?: string;
  problemFileId?: string;
  problemLatitude?: number;
  problemLongitude?: number;
  // Profile edit
  editField?: string;
  // Broadcast
  broadcastTarget?: string;
  broadcastTargetId?: number;
  broadcastText?: string;
  broadcastFileId?: string;
  // Admin
  adminAppealId?: number;
  adminReplyText?: string;
  // Pagination
  page?: number;
}

export interface BotContext extends Context {
  session: SessionData;
}

export interface ApiUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  regionId?: number;
  districtId?: number;
  mahallaId?: number;
  telegramId?: string;
  isActive: boolean;
  region?: { id: number; nameUz: string; nameRu: string };
  district?: { id: number; nameUz: string; nameRu: string };
  mahalla?: { id: number; nameUz: string; nameRu: string };
  youthProfile?: any;
}

export interface ApiAppeal {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  youthId: number;
  youth?: { fullName: string; phone?: string };
  assignedTo?: { fullName: string };
  region?: { nameUz: string; nameRu: string };
  district?: { nameUz: string; nameRu: string };
  mahalla?: { nameUz: string; nameRu: string };
  comments?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiTask {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: { fullName: string };
  createdBy?: { fullName: string };
  createdAt: string;
}

export interface ApiDashboard {
  totalYouth: number;
  totalAppeals: number;
  newAppeals: number;
  resolvedAppeals: number;
  totalProblems: number;
  totalTasks: number;
  doneTasks: number;
  overdueTasksCount: number;
}

export interface Region {
  id: number;
  nameUz: string;
  nameRu: string;
}

export interface District {
  id: number;
  nameUz: string;
  nameRu: string;
  regionId: number;
}

export interface Mahalla {
  id: number;
  nameUz: string;
  nameRu: string;
  districtId: number;
}
