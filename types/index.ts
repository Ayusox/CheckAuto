// --- USER & AUTH ---
export interface User {
  id: string;
  username: string;
  password: string; // Note: Never store plain text passwords in production logic state
}

// --- VEHICLES ---
export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  currentMileage: number;
  image?: string; // Base64 Data URL
}

// --- MAINTENANCE CONFIGURATION ---
export enum MaintenanceStatus {
  OK = 'OK',
  WARNING = 'WARNING', // 5-10% remaining
  OVERDUE = 'OVERDUE', // Limit exceeded
  REVIEW_NEEDED = 'REVIEW_NEEDED', // Unknown history
}

export type MaintenanceCategory = 
  // Engine
  | 'engine_oil' | 'oil_filter' | 'air_filter' | 'fuel_filter'
  | 'spark_plugs' | 'glow_plugs' | 'timing_belt' | 'accessory_belt'
  | 'coolant' | 'dpf_filter'
  // Safety
  | 'brake_pads' | 'brake_discs' | 'brake_fluid' | 'tires' | 'shock_absorbers'
  // Visibility
  | 'cabin_filter' | 'wipers' | 'washer_fluid' | 'bulbs'
  // Transmission
  | 'gearbox_oil' | 'steering_fluid' | 'clutch'
  // Electrical
  | 'battery' | 'key_battery'
  // Legal
  | 'insurance' | 'road_tax'
  // Other
  | 'inspection' | 'ac_gas' | 'adblue'
  // Special
  | 'modification';

export interface MaintenanceConfig {
  id: string;
  vehicleId: string;
  category: MaintenanceCategory;
  intervalKm: number;
  intervalMonths: number;
  lastReplacedMileage: number; // -1 indicates unknown
  lastReplacedDate: string; // ISO String
  isActive: boolean;
}

// --- HISTORY & RECORDS ---
export interface ServiceRecord {
  id: string;
  vehicleId: string;
  maintenanceConfigId: string;
  date: string; // ISO String
  mileage: number;
  cost: number;
  shopName: string;
  notes?: string;
}

// --- MODIFICATIONS ---
export type ModificationCategory = 
  | 'exterior' | 'interior' | 'performance' | 'wheels' 
  | 'lighting' | 'electronics' | 'other';

export interface Modification {
  id: string;
  vehicleId: string;
  name: string;
  category: ModificationCategory;
  cost: number;
  date: string; // ISO String
  expenseId?: string; // Link to service record
  isWishlist?: boolean;
}

// --- UI HELPERS ---
export interface MaintenanceItemWithStatus extends MaintenanceConfig {
  status: MaintenanceStatus;
  kmRemaining: number;
  daysRemaining: number;
  progress: number; // 0 to 100+
}
