const API_BASE_URL = 'http://localhost:8080';

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
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

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

  // Schedule endpoints
  async getAllSchedules(): Promise<Schedule[]> {
    return this.request<Schedule[]>('/Schedule/getAllSchedule');
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

  // Health check
  async healthCheck(): Promise<string> {
    return this.request<string>('/main/health-check');
  }
}

export const apiService = new ApiService();

