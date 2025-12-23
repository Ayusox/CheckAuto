import { MaintenanceCategory } from './types';
import React from 'react';

export type SectionType = 'legal' | 'engine' | 'safety' | 'visibility' | 'transmission' | 'electrical' | 'other';

interface ItemMetadata {
  category: MaintenanceCategory;
  intervalKm: number;
  intervalMonths: number;
  section: SectionType;
}

export const MAINTENANCE_DEFINITIONS: ItemMetadata[] = [
  // 0. Legal & Documentación (New Section)
  { category: 'insurance', intervalKm: 0, intervalMonths: 12, section: 'legal' },
  { category: 'road_tax', intervalKm: 0, intervalMonths: 12, section: 'legal' },

  // 1. Motor (Corazón del coche)
  { category: 'engine_oil', intervalKm: 15000, intervalMonths: 12, section: 'engine' },
  { category: 'oil_filter', intervalKm: 15000, intervalMonths: 12, section: 'engine' },
  { category: 'air_filter', intervalKm: 30000, intervalMonths: 24, section: 'engine' },
  { category: 'fuel_filter', intervalKm: 60000, intervalMonths: 48, section: 'engine' },
  { category: 'spark_plugs', intervalKm: 60000, intervalMonths: 48, section: 'engine' }, // Gasolina default
  { category: 'glow_plugs', intervalKm: 100000, intervalMonths: 96, section: 'engine' }, // Diesel default (long life)
  { category: 'timing_belt', intervalKm: 120000, intervalMonths: 84, section: 'engine' }, // ~7 years / 120k km (Conservative average)
  { category: 'accessory_belt', intervalKm: 100000, intervalMonths: 84, section: 'engine' },
  { category: 'coolant', intervalKm: 60000, intervalMonths: 60, section: 'engine' }, // ~5 years (Organic/Long Life is standard now)
  { category: 'dpf_filter', intervalKm: 150000, intervalMonths: 0, section: 'engine' }, // Diesel Only

  // 2. Seguridad y Frenado
  { category: 'brake_pads', intervalKm: 40000, intervalMonths: 36, section: 'safety' },
  { category: 'brake_discs', intervalKm: 80000, intervalMonths: 0, section: 'safety' }, // Wear based mostly
  { category: 'brake_fluid', intervalKm: 0, intervalMonths: 24, section: 'safety' }, // Time critical (Hygroscopic)
  { category: 'tires', intervalKm: 45000, intervalMonths: 60, section: 'safety' }, // 5 Years rubber aging
  { category: 'shock_absorbers', intervalKm: 100000, intervalMonths: 0, section: 'safety' }, 

  // 3. Visibilidad y Confort
  { category: 'cabin_filter', intervalKm: 15000, intervalMonths: 12, section: 'visibility' },
  { category: 'wipers', intervalKm: 0, intervalMonths: 24, section: 'visibility' },
  { category: 'washer_fluid', intervalKm: 0, intervalMonths: 6, section: 'visibility' }, // Check frequently
  { category: 'bulbs', intervalKm: 0, intervalMonths: 36, section: 'visibility' }, // Check

  // 4. Transmisión y Dirección
  { category: 'gearbox_oil', intervalKm: 100000, intervalMonths: 120, section: 'transmission' },
  { category: 'steering_fluid', intervalKm: 80000, intervalMonths: 96, section: 'transmission' },
  { category: 'clutch', intervalKm: 150000, intervalMonths: 0, section: 'transmission' }, // Usage based

  // 5. Sistema Eléctrico
  { category: 'battery', intervalKm: 0, intervalMonths: 48, section: 'electrical' },
  { category: 'key_battery', intervalKm: 0, intervalMonths: 24, section: 'electrical' },

  // 6. Otros
  { category: 'inspection', intervalKm: 0, intervalMonths: 12, section: 'legal' }, 
  { category: 'ac_gas', intervalKm: 0, intervalMonths: 48, section: 'other' },
  { category: 'adblue', intervalKm: 15000, intervalMonths: 0, section: 'other' },
  
  // 7. Hidden / Special
  { category: 'modification', intervalKm: 0, intervalMonths: 0, section: 'other' },
];

// Define Safety Ranges for Customization
export const MAINTENANCE_LIMITS: Record<string, { min: number, max: number, step: number }> = {
    // Engine
    'engine_oil': { min: 5000, max: 35000, step: 1000 },
    'oil_filter': { min: 5000, max: 35000, step: 1000 },
    'air_filter': { min: 10000, max: 60000, step: 5000 },
    'fuel_filter': { min: 20000, max: 90000, step: 5000 },
    'timing_belt': { min: 60000, max: 240000, step: 10000 },
    'coolant': { min: 30000, max: 150000, step: 10000 },
    
    // Safety
    'tires': { min: 10000, max: 100000, step: 5000 },
    'brake_pads': { min: 10000, max: 100000, step: 5000 },
    'brake_fluid': { min: 0, max: 100000, step: 5000 },

    // Default Fallback
    'default': { min: 0, max: 300000, step: 5000 }
};

export const DEFAULT_LIMITS = { min: 0, max: 200000, step: 5000 };

export const DEFAULT_ACTIVE_CATEGORIES: MaintenanceCategory[] = [];

// Definition of Critical Items (20 pts penalty)
export const CRITICAL_ITEMS: MaintenanceCategory[] = [
    'engine_oil', 'timing_belt', 'brake_pads', 'brake_discs', 'tires', 'clutch', 'brake_fluid', 'gearbox_oil', 'insurance', 'inspection'
];

// Definition of Minor Items (5 pts penalty)
export const MINOR_ITEMS: MaintenanceCategory[] = [
    'wipers', 'washer_fluid', 'key_battery', 'bulbs', 'cabin_filter', 'adblue', 'ac_gas'
];

export const SECTION_METADATA: { id: SectionType, label: string }[] = [
    { id: 'legal', label: 'section_legal' },
    { id: 'engine', label: 'section_engine' },
    { id: 'safety', label: 'section_safety' },
    { id: 'visibility', label: 'section_visibility' },
    { id: 'transmission', label: 'section_transmission' },
    { id: 'electrical', label: 'section_electrical' },
    { id: 'other', label: 'section_other' },
];

export const DEFAULT_MAINTENANCE_ITEMS = MAINTENANCE_DEFINITIONS.filter(d => d.category !== 'modification').map(def => ({
  category: def.category,
  intervalKm: def.intervalKm,
  intervalMonths: def.intervalMonths
}));