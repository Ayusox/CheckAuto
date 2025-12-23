import { useEffect, useRef } from 'react';
import { Vehicle, MaintenanceConfig, MaintenanceStatus, User } from '../types';
import { calculateMaintenanceStatus, isExpirationBased } from '../utils';
import { useTranslation } from '../services/i18n';

/**
 * Hook to handle local push notifications for overdue maintenance items.
 */
export const useMaintenanceAlerts = (
  user: User | null, 
  vehicles: Vehicle[], 
  configs: MaintenanceConfig[]
) => {
  const { t } = useTranslation();
  const sentNotifications = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || vehicles.length === 0 || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
        return;
    }

    // Check localStorage setting
    const stored = localStorage.getItem('notifications_enabled');
    const enabled = stored === null ? true : stored === 'true';
    if (!enabled) return;

    vehicles.forEach(vehicle => {
        const vehicleConfigs = configs.filter(c => c.vehicleId === vehicle.id && c.isActive);
        
        vehicleConfigs.forEach(config => {
             const status = calculateMaintenanceStatus(vehicle, config).status;
             const alertKey = `${vehicle.id}-${config.category}-${status}`;

             if (status === MaintenanceStatus.OVERDUE && !sentNotifications.current.has(alertKey)) {
                 const itemName = t(config.category);
                 const vehicleName = `${vehicle.make} ${vehicle.model}`;
                 const isExpiration = isExpirationBased(config.category);
                 
                 const bodyText = isExpiration 
                    ? t('alert_msg_renew', { item: itemName }) 
                    : t('alert_msg_replace', { item: itemName });

                 new Notification(t('alert_title', { car: vehicleName }), {
                     body: bodyText,
                     icon: '/public/logo.svg'
                 });
                 sentNotifications.current.add(alertKey);
             }
        });
    });
  }, [vehicles, configs, user, t]);

  const clearNotificationsHistory = () => {
    sentNotifications.current.clear();
  };

  return { clearNotificationsHistory };
};