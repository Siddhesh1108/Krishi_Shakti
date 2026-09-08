export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  language?: string;
  state?: string;
  district?: string;
  village?: string;
  created_at: string;
}

export interface Farm {
  id: string;
  farmer_id: string;
  farm_name: string;
  latitude?: number;
  longitude?: number;
  area_acres?: number;
  soil_type?: string;
  irrigation_type?: string;
  created_at: string;
}

export interface CropCycle {
  id: string;
  farm_id: string;
  crop_name: string;
  variety?: string;
  sowing_date?: string;
  expected_harvest_date?: string;
  current_stage?: string;
  status?: string;
  created_at: string;
}

export interface WeatherData {
  id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  wind_speed?: number;
  weather_condition?: string;
  recorded_at: string;
}

export interface CropDiagnosis {
  id: string;
  farmer_id: string;
  farm_id?: string;
  image_url: string;
  crop: string;
  detected_issue?: string;
  confidence?: number;
  recommendation?: string;
  status: string;
  created_at: string;
}

export interface Advisory {
  id: string;
  farmer_id?: string;
  farm_id?: string;
  title: string;
  message: string;
  severity: string;
  source?: string;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  state: string;
  required_documents?: string;
  application_url?: string;
  deadline?: string;
  source_url?: string;
  status: string;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  crop: string;
  market_name: string;
  district: string;
  state: string;
  price_per_quintal: number;
  unit: string;
  recorded_at: string;
}

export interface Notification {
  id: string;
  farmer_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Expert {
  id: string;
  name: string;
  specialization: string;
  state: string;
  verified: boolean;
  availability: string;
}

export interface ExpertReview {
  id: string;
  diagnosis_id: string;
  expert_id: string;
  decision: string;
  comments: string;
  created_at: string;
}

export interface RagDocument {
  id: string;
  title: string;
  source: string;
  category: string;
  crop?: string;
  state?: string;
  version?: string;
  status: string;
  created_at: string;
}

export interface SoilTestRequest {
  id: string;
  user_id: string;
  sample_id: string;
  farmer_name: string;
  farm_location: string;
  village: string;
  district: string;
  state: string;
  land_area: number;
  current_crop: string;
  planned_crop: string;
  soil_type: string;
  collection_date: string;
  notes?: string;
  status: 'Pending' | 'Sample Received' | 'Testing' | 'Report Ready' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface SoilTestReport {
  id: string;
  request_id: string;
  user_id: string;
  lab_id: string;
  report_file_path: string;
  report_name: string;
  remarks?: string;
  tested_by?: string;
  status: string;
  uploaded_at: string;
  completed_at: string;
}

export interface LabProfile {
  id: string;
  name: string;
  reg_no: string;
  state: string;
  district: string;
  status: 'VERIFIED' | 'PENDING_APPROVAL' | 'REJECTED';
  active_tests: number;
  tests_completed: number;
  contact_email: string;
  phone?: string;
  address?: string;
  accreditation?: string;
  created_at?: string;
}

