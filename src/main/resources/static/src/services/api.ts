const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  number: string;
  userType: 'ADMIN' | 'HELPER' | 'NEEDY';
  password: string;
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
  type: string;
  email: string;
  userType: string;
  userId: number;
}

export interface Schedule {
  id: number;
  task: string;
  dateTime: string;
  rating?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  ownerId: number;
  responderId?: number;
  ownerName?: string;
  responderName?: string;
  attachments?: ScheduleAttachment[];
}

export interface ScheduleAttachment {
  id: number;
  scheduleId: number;
  fileName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export interface PresignedUrlResponse {
  url: string;
}

export interface WeatherInfo {
  city: string;
  date: string;
  description: string;
  averageTemperatureCelsius: number;
  minTemperatureCelsius: number;
  maxTemperatureCelsius: number;
  source: string;
}

export interface ScheduleListResponse {
  content: Schedule[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type ScheduleTimeOrder = 'nearest' | 'farthest';

export interface GetSchedulesParams {
  search?: string;
  status?: Schedule['status'];
  timeOrder?: ScheduleTimeOrder;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export interface ScheduleDTO {
  task: string;
  dateTime: string;
  ownerId: number;
}

export interface StatusRequest {
  id: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface RatingRequest {
  id: number;
  rating: number;
}

export interface Information {
  id: number;
  age: number;
  name: string;
  countHelps: number;
  userId: number;
}

class ApiService {
  private refreshPromise: Promise<JwtResponse> | null = null;

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setTokens(tokens: JwtResponse): void {
    localStorage.setItem('token', tokens.token);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized = true
  ): Promise<T> {
    const token = this.getToken();
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retryOnUnauthorized && endpoint !== '/auth/refresh') {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.clearTokens();
        throw new Error('Unauthorized');
      }

      try {
        if (!this.refreshPromise) {
          this.refreshPromise = this.refresh(refreshToken)
            .then((tokens) => {
              this.setTokens(tokens);
              return tokens;
            })
            .finally(() => {
              this.refreshPromise = null;
            });
        }

        await this.refreshPromise;
        return this.request<T>(endpoint, options, false);
      } catch {
        this.clearTokens();
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    // Если ответ пустой, возвращаем пустую строку
    const text = await response.text();
    if (!text) {
      return '' as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    return this.request<JwtResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: SignupRequest): Promise<string> {
    return this.request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refresh(refreshToken: string): Promise<JwtResponse> {
    return this.request<JwtResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, false);
  }

  // Schedule endpoints
  async getAllSchedules(params: GetSchedulesParams = {}): Promise<ScheduleListResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) {
      queryParams.set('search', params.search);
    }
    if (params.status) {
      queryParams.set('status', params.status);
    }
    if (params.timeOrder) {
      queryParams.set('timeOrder', params.timeOrder);
    }
    if (params.page !== undefined) {
      queryParams.set('page', String(params.page));
    }
    if (params.size !== undefined) {
      queryParams.set('size', String(params.size));
    }

    const query = queryParams.toString();
    const endpoint = query ? `/Schedule/getAllSchedule?${query}` : '/Schedule/getAllSchedule';
    return this.request<ScheduleListResponse>(endpoint, { signal: params.signal });
  }

  async getScheduleById(id: number): Promise<Schedule> {
    return this.request<Schedule>(`/Schedule/getById/${id}`);
  }

  async createSchedule(schedule: ScheduleDTO): Promise<string> {
    return this.request<string>('/needy/createSchedule', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  async respondToSchedule(id: number): Promise<string> {
    return this.request<string>(`/helper/respond/${id}`, {
      method: 'PATCH',
    });
  }

  async cancelResponse(id: number): Promise<string> {
    return this.request<string>(`/helper/cancelResponse/${id}`, {
      method: 'PATCH',
    });
  }

  async updateScheduleStatus(request: StatusRequest): Promise<string> {
    return this.request<string>('/needy/setStatus', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async updateScheduleRating(request: RatingRequest): Promise<string> {
    return this.request<string>('/needy/setRating', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async deleteSchedule(id: number): Promise<string> {
    return this.request<string>(`/needy/deleteSchedule/${id}`, {
      method: 'DELETE',
    });
  }

  async getScheduleAttachments(scheduleId: number): Promise<ScheduleAttachment[]> {
    return this.request<ScheduleAttachment[]>(`/admin/schedules/${scheduleId}/attachments`);
  }

  async uploadScheduleAttachment(scheduleId: number, file: File): Promise<ScheduleAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<ScheduleAttachment>(`/admin/schedules/${scheduleId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  }

  async getScheduleAttachmentDownloadUrl(attachmentId: number): Promise<PresignedUrlResponse> {
    return this.request<PresignedUrlResponse>(`/admin/schedules/attachments/${attachmentId}/download-url`);
  }

  async deleteScheduleAttachment(attachmentId: number): Promise<void> {
    await this.request<void>(`/admin/schedules/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // Information endpoints
  async getMyInformation(): Promise<Information | null> {
    try {
      const response = await this.request<Information | null>('/information/my');
      // Spring может вернуть Optional как объект или как null
      // Если это объект с полями Information, возвращаем его
      if (response && typeof response === 'object' && 'id' in response) {
        return response as Information;
      }
      return null;
    } catch (err) {
      // Если 404 или информация не найдена, возвращаем null
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('not found'))) {
        return null;
      }
      throw err;
    }
  }

  async getInformationByUserId(userId: number): Promise<Information> {
    return this.request<Information>(`/information/user/${userId}`);
  }

  async createInformation(data: { age: number; name: string }): Promise<Information> {
    return this.request<Information>('/information/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInformation(data: { age: number; name: string }): Promise<Information> {
    return this.request<Information>('/information/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getCurrentWeather(city?: string): Promise<WeatherInfo | null> {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';

    const response = await fetch(`${API_BASE_URL}/integrations/weather/current${query}`);
    if (response.status === 204) {
      return null;
    }
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<WeatherInfo>;
  }

  // Health check
  async healthCheck(): Promise<string> {
    return this.request<string>('/main/health-check');
  }
}

export const apiService = new ApiService();
