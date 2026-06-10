export interface Service {
  _id: string;
  name: string;
  description: string;
  rate: number;
  remark: string;
  image: string;
  order: number;
}

export interface SurveyRanking {
  serviceId: string;
  priority: number;
}

export interface SurveyResponse {
  phone: string;
  rankings: SurveyRanking[];
  submittedAt: string;
}

export interface AuthUser {
  phone: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
