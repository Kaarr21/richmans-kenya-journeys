// src/lib/api.ts - Updated version
const API_BASE_URL = 'http://localhost:8000/api';

// Define interfaces
export interface BookingData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  destination: string;
  group_size: number;
  preferred_date?: string;
  special_requests?: string;
}

export interface BookingResponse extends BookingData {
  id: string;
  confirmed_date?: string;
  confirmed_time?: string;
  duration_days?: number;
  amount?: number;
  notes?: string;
  admin_message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  customer_notified?: boolean;
  last_notification_sent?: string;
}

export interface BookingUpdateData {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmed_date?: string;
  confirmed_time?: string;
  duration_days?: number;
  amount?: number;
  notes?: string;
  admin_message?: string;
  send_notification?: boolean;
}

export interface LocationData {
  title: string;
  description?: string;
}

export interface LocationImage {
  id: string;
  image_url: string;
  caption: string;
  order: number;
}

export interface LocationResponse extends LocationData {
  id: string;
  images: LocationImage[];
  primary_image_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface BookingStatistics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  recent_bookings: number;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Token ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({ 
        error: `HTTP error! status: ${response.status}` 
      }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', this.token);
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout/', { 
      method: 'POST' 
    });
    this.token = null;
    localStorage.removeItem('token');
    return response;
  }

  async getProfile(): Promise<{ user: AuthResponse["user"] }> {
    return this.request<{ user: AuthResponse["user"] }>('/auth/profile/');
  }

  // Booking methods
  async createBooking(bookingData: BookingData): Promise<BookingResponse> {
    return this.request<BookingResponse>('/bookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(): Promise<{ results: BookingResponse[]; count: number }> {
    return this.request<{ results: BookingResponse[]; count: number }>('/bookings/');
  }

  async updateBooking(id: string, data: BookingUpdateData): Promise<BookingResponse> {
    return this.request<BookingResponse>(`/bookings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string): Promise<void> {
    return this.request<void>(`/bookings/${id}/`, { 
      method: 'DELETE' 
    });
  }

  async sendBookingNotification(id: string): Promise<{ message: string; customer_email: string }> {
    return this.request<{ message: string; customer_email: string }>(`/bookings/${id}/send-notification/`, {
      method: 'POST',
    });
  }

  async getBookingStatistics(): Promise<BookingStatistics> {
    return this.request<BookingStatistics>('/bookings/statistics/');
  }

  // Location methods
  async getLocations(): Promise<{ results: LocationResponse[]; count: number }> {
    return this.request<{ results: LocationResponse[]; count: number }>('/locations/');
  }

  async createLocation(formData: FormData): Promise<LocationResponse> {
    const response = await fetch(`${API_BASE_URL}/locations/`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Token ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({ 
        error: `HTTP error! status: ${response.status}` 
      }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<LocationResponse>;
  }

  async deleteLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}/`, { 
      method: 'DELETE' 
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export const apiClient = new ApiClient();
