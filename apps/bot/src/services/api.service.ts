import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import { ApiUser, ApiAppeal, ApiTask, ApiDashboard, Region, District, Mahalla } from '../types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const msg = error.response?.data?.message || error.message;
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${msg}`);
      throw new Error(msg);
    }
    throw error;
  }

  // Auth
  async verifyPhone(phone: string, telegramId: string): Promise<ApiUser | null> {
    try {
      const { data } = await this.client.post<ApiResponse<ApiUser>>('/auth/telegram/verify', { phone, telegramId });
      return data.data;
    } catch {
      return null;
    }
  }

  async register(payload: {
    fullName: string;
    phone: string;
    telegramId: string;
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
  }): Promise<ApiUser> {
    try {
      const { data } = await this.client.post<ApiResponse<ApiUser>>('/auth/telegram/register', payload);
      return data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // User
  async getUserByTelegramId(telegramId: string): Promise<ApiUser | null> {
    try {
      const { data } = await this.client.get<ApiResponse<ApiUser>>(`/users/telegram/${telegramId}`);
      return data.data;
    } catch {
      return null;
    }
  }

  async updateProfile(userId: number, payload: Record<string, unknown>): Promise<ApiUser> {
    try {
      const { data } = await this.client.patch<ApiResponse<ApiUser>>(`/users/${userId}`, payload);
      return data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await this.client.delete(`/users/${userId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Appeals
  async createAppeal(payload: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    youthId: number;
    regionId?: number;
    districtId?: number;
    mahallaId?: number;
    isConfidential?: boolean;
    contactPhone?: string;
    latitude?: number;
    longitude?: number;
    fileUrl?: string;
    fileType?: string;
  }): Promise<ApiAppeal> {
    try {
      const { data } = await this.client.post<ApiResponse<ApiAppeal>>('/appeals', payload);
      return data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyAppeals(userId: number, page = 1, limit = 5): Promise<{ data: ApiAppeal[]; total: number }> {
    try {
      const { data } = await this.client.get<ApiResponse<{ data: ApiAppeal[]; total: number }>>(
        `/appeals/user/${userId}?page=${page}&limit=${limit}`
      );
      return data.data;
    } catch {
      return { data: [], total: 0 };
    }
  }

  async getAppealById(id: number): Promise<ApiAppeal | null> {
    try {
      const { data } = await this.client.get<ApiResponse<ApiAppeal>>(`/appeals/${id}`);
      return data.data;
    } catch {
      return null;
    }
  }

  async addComment(appealId: number, userId: number, text: string): Promise<void> {
    try {
      await this.client.post(`/appeals/${appealId}/comments`, { userId, text });
    } catch (error) {
      this.handleError(error);
    }
  }

  async rateAppeal(appealId: number, rating: number): Promise<void> {
    try {
      await this.client.post(`/appeals/${appealId}/rate`, { rating });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Admin appeals
  async getAppeals(params: { status?: string; page?: number; limit?: number; regionId?: number }): Promise<{ data: ApiAppeal[]; total: number }> {
    try {
      const { data } = await this.client.get<ApiResponse<{ data: ApiAppeal[]; total: number }>>('/appeals', { params });
      return data.data;
    } catch {
      return { data: [], total: 0 };
    }
  }

  async updateAppealStatus(id: number, status: string, userId: number): Promise<void> {
    try {
      await this.client.patch(`/appeals/${id}/status`, { status, userId });
    } catch (error) {
      this.handleError(error);
    }
  }

  async replyToAppeal(appealId: number, userId: number, text: string): Promise<void> {
    try {
      await this.client.post(`/appeals/${appealId}/reply`, { userId, text });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Tasks
  async getMyTasks(userId: number, page = 1): Promise<{ data: ApiTask[]; total: number }> {
    try {
      const { data } = await this.client.get<ApiResponse<{ data: ApiTask[]; total: number }>>(
        `/tasks/user/${userId}?page=${page}&limit=5`
      );
      return data.data;
    } catch {
      return { data: [], total: 0 };
    }
  }

  async updateTaskStatus(taskId: number, status: string): Promise<void> {
    try {
      await this.client.patch(`/tasks/${taskId}/status`, { status });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Problems
  async createProblem(payload: {
    title: string;
    description: string;
    category: string;
    reportedById: number;
    regionId?: number;
    districtId?: number;
    mahallaId?: number;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  }): Promise<{ id: number }> {
    try {
      const { data } = await this.client.post<ApiResponse<{ id: number }>>('/problems', payload);
      return data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Dashboard
  async getDashboard(params?: { regionId?: number; districtId?: number }): Promise<ApiDashboard> {
    try {
      const { data } = await this.client.get<ApiResponse<ApiDashboard>>('/dashboard', { params });
      return data.data;
    } catch {
      return { totalYouth: 0, totalAppeals: 0, newAppeals: 0, resolvedAppeals: 0, totalProblems: 0, totalTasks: 0, doneTasks: 0, overdueTasksCount: 0 };
    }
  }

  // KPI
  async getKpi(userId: number): Promise<{ score: number; appeals: number; tasks: number; youth: number; rank: number } | null> {
    try {
      const { data } = await this.client.get<ApiResponse<any>>(`/kpi/user/${userId}`);
      return data.data;
    } catch {
      return null;
    }
  }

  // Regions
  async getRegions(): Promise<Region[]> {
    try {
      const { data } = await this.client.get<ApiResponse<Region[]>>('/regions');
      return data.data;
    } catch {
      return [];
    }
  }

  async getDistricts(regionId: number): Promise<District[]> {
    try {
      const { data } = await this.client.get<ApiResponse<District[]>>(`/districts?regionId=${regionId}`);
      return data.data;
    } catch {
      return [];
    }
  }

  async getMahallas(districtId: number): Promise<Mahalla[]> {
    try {
      const { data } = await this.client.get<ApiResponse<Mahalla[]>>(`/mahallas?districtId=${districtId}`);
      return data.data;
    } catch {
      return [];
    }
  }

  // Broadcast
  async sendBroadcast(payload: {
    target: string;
    targetId?: number;
    targetRole?: string;
    text: string;
    fileUrl?: string;
    senderId: number;
  }): Promise<{ sent: number; failed: number }> {
    try {
      const { data } = await this.client.post<ApiResponse<{ sent: number; failed: number }>>('/broadcast', payload);
      return data.data;
    } catch {
      return { sent: 0, failed: 0 };
    }
  }

  // Notifications
  async getNotifications(userId: number, page = 1): Promise<{ data: any[]; total: number }> {
    try {
      const { data } = await this.client.get<ApiResponse<{ data: any[]; total: number }>>(
        `/notifications/user/${userId}?page=${page}&limit=10`
      );
      return data.data;
    } catch {
      return { data: [], total: 0 };
    }
  }

  async markNotificationsRead(userId: number): Promise<void> {
    try {
      await this.client.post(`/notifications/user/${userId}/read-all`);
    } catch {}
  }

  // Events
  async getEvents(page = 1, limit = 5): Promise<{ data: any[]; total: number }> {
    try {
      const { data } = await this.client.get<ApiResponse<any>>(`/events?page=${page}&limit=${limit}&status=UPCOMING`);
      const d = data.data;
      return { data: d.data || d || [], total: d.total || 0 };
    } catch {
      return { data: [], total: 0 };
    }
  }

  async getEventById(id: number): Promise<any | null> {
    try {
      const { data } = await this.client.get<ApiResponse<any>>(`/events/${id}`);
      return data.data;
    } catch {
      return null;
    }
  }

  async registerForEvent(eventId: number): Promise<boolean> {
    try {
      await this.client.post(`/events/${eventId}/register`);
      return true;
    } catch {
      return false;
    }
  }

  // Surveys
  async getActiveSurveys(page = 1): Promise<{ data: any[]; total: number }> {
    try {
      const { data } = await this.client.get<ApiResponse<any>>(`/surveys?page=${page}&limit=5&status=ACTIVE`);
      const d = data.data;
      return { data: d.data || d || [], total: d.total || 0 };
    } catch {
      return { data: [], total: 0 };
    }
  }

  async getSurveyById(id: number): Promise<any | null> {
    try {
      const { data } = await this.client.get<ApiResponse<any>>(`/surveys/${id}`);
      return data.data;
    } catch {
      return null;
    }
  }

  async submitSurveyResponse(surveyId: number, answers: { questionId: number; value: string }[]): Promise<boolean> {
    try {
      await this.client.post(`/surveys/${surveyId}/respond`, { answers });
      return true;
    } catch {
      return false;
    }
  }

  // File upload
  async uploadFile(fileBuffer: Buffer, filename: string): Promise<string> {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fileBuffer, filename);
    try {
      const { data } = await this.client.post<ApiResponse<{ url: string }>>('/upload', form, {
        headers: form.getHeaders(),
      });
      return data.data.url;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const apiService = new ApiService();
