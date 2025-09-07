// src/lib/api.ts - FIXED for production deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://richmans-kenya-journeys-1.onrender.com/api'  // Production URL
    : 'http://localhost:8000/api'  // Development URL
  );

console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', API_BASE_URL);
console.log('Is Production:', import.meta.env.PROD);

// Define interfaces (keeping your existing interfaces)
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

export interface LocationUpdateData {
  title?: string;
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
  primary_image_url?: string;
  image_url?: string;
  user_id?: string;
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

export interface TourData {
  title: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  max_capacity: number;
  price_per_person?: number;
  notes?: string;
}

export interface TourResponse extends TourData {
  id: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  current_bookings: number;
  available_spots: number;
  is_full: boolean;
  duration_days: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Check both localStorage and sessionStorage for token
    this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Enhanced headers for production
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest', // Helps with CORS
        ...(this.token && { Authorization: `Token ${this.token}` }),
      },
      mode: 'cors',
      credentials: 'omit', // Changed from 'include' for better compatibility
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`, { method: config.method || 'GET' });
      
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status} for ${url}`);
      
      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }

        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.warn('Unauthorized request, clearing token');
          this.clearToken();
          if (window.location.pathname.includes('/admin')) {
            window.location.reload(); // Reload admin page to show login
          }
        }

        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`Successful response from ${url}:`, data);
        return data as T;
      }
      
      return {} as T;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      if (error instanceof Error) {
        // Add more context to network errors
        if (error.message.includes('fetch')) {
          throw new Error(`Network error: Unable to connect to server. Please check your internet connection.`);
        }
        throw error;
      }
      throw new Error('Unknown network error occurred');
    }
  }

  private async requestWithoutContentType<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...(this.token && { Authorization: `Token ${this.token}` }),
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    try {
      console.log(`Making file upload request to: ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        console.error('File upload error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
      }
      
      return {} as T;
    } catch (error) {
      console.error(`File upload failed for ${url}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('File upload failed');
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('Attempting login...');
    const response = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', this.token);
      console.log('Login successful, token stored');
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout/', { 
      method: 'POST' 
    });
    this.clearToken();
    return response;
  }

  async getProfile(): Promise<{ user: AuthResponse["user"] }> {
    return this.request<{ user: AuthResponse["user"] }>('/auth/profile/');
  }

  // Booking methods
  async createBooking(bookingData: BookingData): Promise<BookingResponse> {
    console.log('Creating booking:', bookingData);
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
    console.log('Fetching locations...');
    const response = await this.request<{ results: LocationResponse[]; count: number }>('/locations/');
    
    // Ensure backward compatibility by setting image_url if not present
    response.results = response.results.map(location => ({
      ...location,
      image_url: location.image_url || location.primary_image_url || '',
    }));
    
    return response;
  }

  async createLocation(formData: FormData): Promise<LocationResponse> {
    console.log('Creating location with form data');
    const response = await this.requestWithoutContentType<LocationResponse>('/locations/', {
      method: 'POST',
      body: formData,
    });

    return {
      ...response,
      image_url: response.image_url || response.primary_image_url || '',
    };
  }

  async updateLocation(id: string, data: LocationUpdateData): Promise<LocationResponse> {
    const response = await this.request<LocationResponse>(`/locations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return {
      ...response,
      image_url: response.image_url || response.primary_image_url || '',
    };
  }

  async deleteLocation(id: string): Promise<void> {
    return this.request<void>(`/locations/${id}/`, { 
      method: 'DELETE' 
    });
  }

  // Tours methods
  async getTours(): Promise<{ results: TourResponse[]; count: number }> {
    return this.request<{ results: TourResponse[]; count: number }>('/tours/');
  }

  async createTour(tourData: TourData): Promise<TourResponse> {
    return this.request<TourResponse>('/tours/', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  }

  async updateTour(id: string, tourData: Partial<TourData>): Promise<TourResponse> {
    return this.request<TourResponse>(`/tours/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(tourData),
    });
  }

  async deleteTour(id: string): Promise<void> {
    return this.request<void>(`/tours/${id}/`, { 
      method: 'DELETE' 
    });
  }

  async getUpcomingTours(): Promise<TourResponse[]> {
    return this.request<TourResponse[]>('/tours/upcoming/');
  }

  async updateTourCapacity(id: string, currentBookings: number): Promise<TourResponse> {
    return this.request<TourResponse>(`/tours/${id}/update-capacity/`, {
      method: 'POST',
      body: JSON.stringify({ current_bookings: currentBookings }),
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
    sessionStorage.removeItem('token');
  }
}

export const apiClient = new ApiClient();