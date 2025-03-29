// User-related types
export type UserProfile = 'general_administrator' | 'administrator' | 'professional';

export interface User {
  id: string;
  full_name: string;
  email: string;
  profile: UserProfile;
  admin_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  detail: {
    message: string;
    user_name: string;
    user_id: string;
    profile: UserProfile;
    token: string;
    status_code: number;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    profile: UserProfile;
    adminId?: string;
  } | null;
  token: string | null;
}

// Health Unit types
export interface HealthUnit {
  id: string;
  admin_id: string;
  name: string;
  cnpj: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export interface CreateHealthUnit {
  admin_id: string;
  name: string;
  cnpj: string;
  status: 'active' | 'inactive';
}

// Attendance types
export interface Attendance {
  id: string;
  professional_id: string;
  health_unit_id: string;
  admin_id: string;
  model_used: 'respiratory' | 'tuberculosis' | 'osteoporosis' | 'breast';
  model_result: string;
  expected_result: string;
  correct_diagnosis: boolean;
  image_base64: string;
  attendance_date: string;
  observations: string;
  bounding_boxes?: BoundingBox[];
}

export interface BoundingBox {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  observations?: string;
}

export interface CreateAttendance {
  professional_id: string;
  health_unit_id: string;
  admin_id: string;
  model_used: 'respiratory' | 'tuberculosis' | 'osteoporosis' | 'breast';
  model_result: string;
  expected_result: string;
  correct_diagnosis: boolean;
  image_base64: string;
  observation: string;
  bounding_boxes?: BoundingBox[];
}

// Subscription types
export interface Subscription {
  id: string;
  admin_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
}

// Prediction types
export interface RespiratoryPrediction {
  [disease: string]: number;
}

export interface TuberculosisPrediction {
  class_pred: string;
  probabilities: {
    negative: number;
    positive: number;
  };
}

export interface OsteoporosisPrediction {
  class_pred: string;
  probabilities: {
    Normal: number;
    Osteopenia: number;
    Osteoporosis: number;
  };
}

export interface BreastCancerDetection {
  detections: {
    class_id: number;
    confidence: number;
    bbox: [number, number, number, number];
  }[];
  bounding_boxes: BoundingBox[];
  image_base64: string;
}

// Statistics types
export interface Statistics {
  period: string;
  model_usage: {
    [model: string]: number;
  };
  model_accuracy: {
    [model: string]: {
      correct: number;
      total: number;
      accuracy_percentage: number;
    };
  };
  message?: string;
}

// API Response types
export interface ApiResponse<T> {
  detail: {
    message: string;
    status_code: number;
    [key: string]: any;
  } & T;
}

export interface PaginatedResponse<T> {
  detail: {
    message: string;
    status_code: number;
    pagination: {
      total_count: number;
      total_pages: number;
      current_page: number;
      per_page: number;
    };
    [key: string]: any;
  } & T;
}