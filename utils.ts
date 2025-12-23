import { MaintenanceConfig, MaintenanceStatus, Vehicle } from './types';
import { differenceInDays, format } from 'date-fns';
import { CRITICAL_ITEMS, MINOR_ITEMS, MAINTENANCE_DEFINITIONS } from './constants';

// --- DATE FORMATTER ---
// Ensures strict DD/MM/YYYY consistency across the app
export const formatAppDate = (dateString: string | Date): string => {
    try {
        const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return format(d, 'dd/MM/yyyy');
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper to normalize date to start of day (00:00:00)
// Implemented locally to avoid import issues with specific date-fns versions
const startOfDay = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- IMAGE UTILS ---

export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize to max 600px width/height to save LocalStorage space
        const MAX_SIZE = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- MAINTENANCE LOGIC ---

// Helper to identify if an item is based on a future expiration date (Legal/Docs)
// vs a past service date (Mechanical/Fluids)
export const isExpirationBased = (category: string): boolean => {
    const def = MAINTENANCE_DEFINITIONS.find(d => d.category === category);
    return def?.section === 'legal';
};

export const calculateMaintenanceStatus = (vehicle: Vehicle, config: MaintenanceConfig) => {
  const isExpirationItem = isExpirationBased(config.category);

  // Handle Unknown History
  if (config.lastReplacedMileage === -1) {
    return {
      ...config,
      status: MaintenanceStatus.REVIEW_NEEDED,
      kmRemaining: 0,
      daysRemaining: 0,
      progress: 0
    };
  }

  // --- LOGIC SPLIT ---
  
  let kmRemaining = 999999;
  let daysRemaining = 9999; // Default to high number (infinite)
  let progress = 0;
  let status = MaintenanceStatus.OK;

  // Normalize dates to Start of Day to avoid timezone/hour discrepancies
  const now = startOfDay(new Date());
  const recordDate = startOfDay(new Date(config.lastReplacedDate));

  if (isExpirationItem) {
      // LEGAL / DOCS: The stored date is the Target Expiration Date (Future).
      // Logic: How many days until that date?
      
      // Calculate Days Remaining (Future Date - Now)
      daysRemaining = differenceInDays(recordDate, now);
      
      // KM irrelevant for legal items
      kmRemaining = 999999; 

      // Status Logic for Legal Items
      // Warn if less than ~1 month remaining (30 days)
      if (daysRemaining < 0) {
          status = MaintenanceStatus.OVERDUE; // Expired
      } else if (daysRemaining <= 30) {
          status = MaintenanceStatus.WARNING; // Due soon
      } else {
          status = MaintenanceStatus.OK;
      }

      // Progress Calculation (Visual only)
      const maxDays = 365; // Standard year reference for visual bar
      const clampedDays = Math.max(0, daysRemaining);
      progress = Math.max(0, Math.min(100, ((maxDays - clampedDays) / maxDays) * 100));

  } else {
      // MECHANICAL / SERVICE: The stored date is the Last Service Date (Past).
      // Logic: Usage since that date vs Limits.

      // Guard against negative usage (e.g., odometer rollback or error in data entry)
      const kmTraveled = Math.max(0, vehicle.currentMileage - config.lastReplacedMileage);
      const daysElapsed = Math.max(0, differenceInDays(now, recordDate));
      
      // 1. Calculate KM Status (Only if intervalKm > 0)
      let kmProgress = 0;
      let isKmOverdue = false;
      let isKmWarning = false;

      // Fix: Guard against division by zero if intervalKm is 0 (time-only item)
      if (config.intervalKm > 0) {
          kmRemaining = config.intervalKm - kmTraveled;
          kmProgress = kmTraveled / config.intervalKm;
          
          // Logic Upgrade: 
          // Warn if within 8% of limit OR within 1000km (whichever is larger/safer).
          // For 120,000km belt, 8% is 9,600km warning buffer. 
          // For 10,000km oil, 8% is 800km (so we use 1000km min).
          const warningThresholdKm = Math.max(1000, config.intervalKm * 0.08);

          if (kmRemaining < 0) isKmOverdue = true;
          else if (kmRemaining <= warningThresholdKm) isKmWarning = true;
      }

      // 2. Calculate Time Status (Only if intervalMonths > 0)
      let timeProgress = 0;
      let isTimeOverdue = false;
      let isTimeWarning = false;

      // Fix: Guard against division by zero if intervalMonths is 0 (mileage-only item)
      if (config.intervalMonths > 0) {
          const daysLimit = config.intervalMonths * 30; // approx
          daysRemaining = daysLimit - daysElapsed;
          timeProgress = daysElapsed / daysLimit;

          // Logic Upgrade: Warn if within 8% of time limit OR 30 days.
          const warningThresholdDays = Math.max(30, daysLimit * 0.08);

          if (daysRemaining < 0) isTimeOverdue = true;
          else if (daysRemaining <= warningThresholdDays) isTimeWarning = true;
      }

      // 3. Determine Final Status
      if (isKmOverdue || isTimeOverdue) {
          status = MaintenanceStatus.OVERDUE;
      } else if (isKmWarning || isTimeWarning) {
          status = MaintenanceStatus.WARNING;
      } else {
          status = MaintenanceStatus.OK;
      }

      // Calculate simple percentage (Max of the two factors)
      progress = Math.max(kmProgress, timeProgress) * 100;
  }

  return {
    ...config,
    status,
    kmRemaining,
    daysRemaining,
    progress
  };
};

// --- NEW WEIGHTED SCORING LOGIC ---

export const calculateHealthScore = (vehicle: Vehicle, configs: MaintenanceConfig[]) => {
    // Only calculate for ACTIVE configs
    const activeConfigs = configs.filter(c => c.vehicleId === vehicle.id && c.isActive);
    
    // If no active configs (new car or setup pending), return 100 to avoid scary red graph
    if (activeConfigs.length === 0) return 100;

    // Weight System:
    // Max Potential per Item: 20 points (Total = count * 20)
    // OK: +20
    // Warning: +10
    // Review Needed: -10
    // Overdue: -25
    
    let totalScore = 0;
    const maxPotentialScore = activeConfigs.length * 20;

    activeConfigs.forEach(config => {
        const itemStatus = calculateMaintenanceStatus(vehicle, config).status;

        if (itemStatus === MaintenanceStatus.OK) {
            totalScore += 20;
        } else if (itemStatus === MaintenanceStatus.WARNING) {
            totalScore += 10;
        } else if (itemStatus === MaintenanceStatus.REVIEW_NEEDED) {
            totalScore -= 10;
        } else if (itemStatus === MaintenanceStatus.OVERDUE) {
            totalScore -= 25;
        }
    });

    // Calculate percentage against max potential
    // Can result in negative numbers if everything is overdue, clamp to 0.
    const percentage = (totalScore / maxPotentialScore) * 100;

    return Math.max(0, Math.min(100, percentage));
};

export const getScoreMeta = (score: number) => {
    if (score >= 90) {
        return {
            level: 'score_excellent', // 90-100%
            description: 'desc_excellent',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500',
            bgSoft: 'bg-emerald-500/10',
            border: 'border-emerald-500',
            ring: 'ring-emerald-500',
            shortMsg: null
        };
    } else if (score >= 70) {
        return {
            level: 'score_good', // 70-89%
            description: 'desc_good',
            color: 'text-indigo-500', // Blue (CheckAuto Brand Color)
            bg: 'bg-indigo-500',
            bgSoft: 'bg-indigo-500/10',
            border: 'border-indigo-500',
            ring: 'ring-indigo-500',
            shortMsg: null
        };
    } else if (score >= 40) {
        return {
            level: 'score_moderate', // 40-69%
            description: 'desc_moderate',
            color: 'text-amber-500', // Yellow/Orange
            bg: 'bg-amber-500',
            bgSoft: 'bg-amber-500/10',
            border: 'border-amber-500',
            ring: 'ring-amber-500',
            shortMsg: 'health_msg_missing_info'
        };
    } else {
        return {
            level: 'score_critical', // < 40%
            description: 'desc_critical',
            color: 'text-rose-600', // Red
            bg: 'bg-rose-600',
            bgSoft: 'bg-rose-600/10',
            border: 'border-rose-600',
            ring: 'ring-rose-600',
            shortMsg: 'health_msg_urgent'
        };
    }
};