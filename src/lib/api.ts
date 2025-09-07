// src/lib/api.ts - ENHANCED for reliable production deployment

// CRITICAL: More robust API URL detection
const getApiBaseUrl = (): string => {
  // First, try the build-time injected environment variable
  const buildTimeUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Detect if we're in production by checking the hostname
  const isProduction = window.location.hostname.includes('onrender.com') || 
                      import.meta.env.PROD || 
                      import.meta.env.MODE === 'production';
  
  console.log('🔍 API URL Detection:');
  console.log('- Build-time VITE_API_BASE_URL:', buildTimeUrl);
  console.log('- Current hostname:', window.location.hostname);
  console.log('- import.meta.env.PROD:', import.meta.env.PROD);
  console.log('- import.meta.env.MODE:', import.meta.env.MODE);
  console.log('- Detected as production:', isProduction);
  
  if (buildTimeUrl && buildTimeUrl !== 'undefined' && buildTimeUrl.trim() !== '') {
    console.log('✅ Using build-time API URL:', buildTimeUrl);
    return buildTimeUrl.trim();
  }
  
  if (isProduction) {
    const productionUrl = 'https://richmans-kenya-journeys-1.onrender.com/api';
    console.log('🔧 Using fallback production URL:', productionUrl);
    return productionUrl;
  }
  
  const developmentUrl = 'http://localhost:8000/api';
  console.log('🔧 Using development URL:', developmentUrl);
  return developmentUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🚀 Final API Base URL:', API_BASE_URL);

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
    if (this.token) {
      console.log('🔐 Found existing auth token');
    }
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Enhanced headers for better compatibility
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
        ...(this.token && { Authorization: `Token ${this.token}` }),
      },
      mode: 'cors',
      credentials: 'omit', // Simplified for better compatibility
      ...options,
    };

    try {
      console.log(`📡 Making request to: ${url}`, { 
        method: config.method || 'GET',
        hasAuth: !!this.token 
      });
      
      const response = await fetch(url, config);
      
      console.log(`📡 Response: ${response.status} ${response.statusText} for ${endpoint}`);
      
      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            error: `HTTP ${response.status}: ${response.statusText}` 
          };
        }

        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.warn('🔐 Unauthorized request, clearing token');
          this.clearToken();
          if (window.location.pathname.includes('/admin')) {
            window.location.reload();
          }
        }

        // Enhanced error logging
        console.error('❌ API Error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          details: errorData.details
        });

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ Success response from ${endpoint}:`, {
          dataType: Array.isArray(data) ? 'array' : typeof data,
          keys: typeof data === 'object' && data ? Object.keys(data) : 'n/a'
        });
        return data as T;
      }
      
      console.log(`✅ Non-JSON response from ${endpoint}`);
      return {} as T;
      
    } catch (error) {
      console.error(`❌ Request failed for ${url}:`, error);
      
      if (error instanceof Error) {
        // More specific error messages
        if (error.message.includes('fetch') || error.message.includes('network')) {
          const isLocal = url.includes('localhost');
          throw new Error(
            isLocal 
              ? 'Cannot connect to local server. Make sure Django is running on http://localhost:8000'
              : 'Network error: Unable to connect to server. Please check your internet connection.'
          );
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
      console.log(`📎 Making file upload request to: ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        console.error('❌ File upload error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
      }
      
      return {} as T;
    } catch (error) {
      console.error(`❌ File upload failed for ${url}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('File upload failed');
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('🔐 Attempting login for:', email);
    const response = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('token', this.token);
      console.log('✅ Login successful, token stored');
    }
    
    return response;
  }

  async logout(): Promise<{ message: string }> {
    console.log('🔐 Logging out...');
    const response = await this.request<{ message: string }>('/auth/logout/', { 
      method: 'POST' 
    });
    this.clearToken();
    console.log('✅ Logged out successfully');
    return response;
  }

  async getProfile(): Promise<{ user: AuthResponse["user"] }> {
    return this.request<{ user: AuthResponse["user"] }>('/auth/profile/');
  }

  // Booking methods
  async createBooking(bookingData: BookingData): Promise<BookingResponse> {
    console.log('📝 Creating booking:', bookingData.destination);
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
    console.log('🗺️ Fetching locations...');
    const response = await this.request<{ results: LocationResponse[]; count: number }>('/locations/');
    
    // Ensure backward compatibility by setting image_url if not present
    response.results = response.results.map(location => ({
      ...location,
      image_url: location.image_url || location.primary_image_url || '',
    }));
    
    console.log(`✅ Loaded ${response.results.length} locations`);
    return response;
  }

  async createLocation(formData: FormData): Promise<LocationResponse> {
    console.log('📸 Creating location with images');
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
    console.log('🔐 Token set and stored');
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    console.log('🔐 Token cleared');
  }

  // Debug method to check current configuration
  getDebugInfo() {
    return {
      apiBaseUrl: API_BASE_URL,
      hasToken: !!this.token,
      hostname: window.location.hostname,
      isProduction: window.location.hostname.includes('onrender.com'),
      envMode: import.meta.env.MODE,
      envProd: import.meta.env.PROD,
      buildTimeApiUrl: import.meta.env.VITE_API_BASE_URL
    };
  }
}

export const apiClient = new ApiClient();

// Export debug function for console debugging
(window as any).apiDebug = () => {
  console.log('🔧 API Client Debug Info:', apiClient.getDebugInfo());
  return apiClient.getDebugInfo();
};