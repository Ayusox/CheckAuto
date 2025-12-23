import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Dictionaries ---

const translations = {
  es: {
    // General
    app_name: "CheckAuto",
    app_tagline: "Mantenimiento simplificado.",
    loading: "Cargando...",
    cancel: "Cancelar",
    save: "Guardar",
    confirm: "Confirmar",
    delete: "Eliminar",
    back: "Volver",
    update: "Actualizar",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    skip: "Configurar más tarde",
    
    // Auth
    welcome_back: "Bienvenido",
    create_account: "Crear Cuenta",
    username: "Tu correo",
    password: "Contraseña",
    login: "Iniciar Sesión",
    logout: "Cerrar Sesión",
    signup: "Registrarse",
    no_account: "¿No tienes cuenta?",
    have_account: "¿Ya tienes cuenta?",
    processing: "Procesando...",
    remember_me: "Recordar mis datos",

    // Tab Bar
    tab_garage: "Garaje",
    tab_history: "Historial",
    
    // Garage
    my_garage: "Mi Garaje",
    add_vehicle: "Añadir Vehículo",
    edit_vehicle: "Editar Vehículo",
    delete_vehicle: "Eliminar Vehículo",
    delete_vehicle_confirm: "¿Estás seguro? Se borrará todo el historial y configuraciones de este coche.",
    make: "Marca",
    model: "Modelo",
    year: "Año",
    plate: "Matrícula",
    current_mileage: "Kilometraje Actual",
    status_good: "Buen Estado",
    status_soon: "Mantenimiento Pronto",
    status_attention: "Atención Necesaria",
    responsible_driver: "Conductor Responsable",
    add_photo: "Añadir Foto",
    change_photo: "Cambiar Foto",
    setup_pending: "Configuración Pendiente",
    
    empty_garage_title: "Tu garaje está vacío",
    empty_garage_desc: "Añade tu primer vehículo para empezar a controlar su salud, gastos y mantenimientos.",
    add_first_vehicle: "Añadir mi primer coche",
    
    placeholder_make: "Ej: Toyota",
    placeholder_model: "Ej: Corolla",
    placeholder_year: "Ej: 2022",
    placeholder_plate: "Ej: 1234 ABC",
    placeholder_km: "Ej: 55000",

    // Dashboard Alert
    alert_unknown_data_title: "¡Atención! Falta información",
    alert_unknown_data_msg: "Tu seguridad depende de los datos. Registra tus últimos mantenimientos para eliminar la incertidumbre.",
    
    // Setup Wizard
    wizard_title: "Configuración Inicial",
    wizard_subtitle: "Vamos a poner al día tu {car}",
    step_legal: "Legalidad",
    step_engine: "Mecánica",
    step_prefs: "Preferencias",
    wizard_sub_legal: "ITV & Impuestos",
    wizard_sub_engine: "Aceite y Filtros",
    wizard_sub_prefs: "Personalización",
    
    label_itv_date: "Fecha última ITV",
    label_itv_interval: "Vigencia ITV",
    label_tax_date: "Próximo Impuesto Circulación",
    label_oil_km: "KM Último cambio de Aceite",
    label_oil_date: "Fecha Último cambio de Aceite",
    label_oil_interval: "Intervalo de Aceite",
    
    option_1_year: "1 Año",
    option_2_years: "2 Años",
    option_4_years: "4 Años",
    
    msg_select_tracking: "Selecciona qué elementos quieres controlar:",
    
    wizard_success_title: "¡Todo listo!",
    wizard_success_msg: "Tu coche ya está bajo la supervisión de CheckAuto.",
    developed_by_branding: "Desarrollado por Ayuso.dev",
    close_wizard: "Ir al Garaje",
    
    // Health Score
    health_score: "Salud del Vehículo",
    how_it_works: "¿Cómo funciona el Score?",
    score_excellent: "Excelente",
    desc_excellent: "Tu coche está en perfectas condiciones. Fiabilidad máxima.",
    score_good: "Bueno",
    desc_good: "Estado general saludable. Mantén este ritmo.",
    score_moderate: "Riesgo Moderado",
    desc_moderate: "Falta información importante o hay mantenimientos pendientes.",
    score_critical: "Riesgo Crítico",
    desc_critical: "Revisión urgente necesaria. Tienes elementos vencidos o desconocidos.",
    score_explanation: "El sistema suma puntos por mantenimiento al día (+20) y penaliza fuertemente la incertidumbre (-10) o los elementos caducados (-25).",

    health_msg_missing_info: "Falta información importante",
    health_msg_urgent: "Revisión urgente necesaria",

    // Vehicle Detail
    details: "Detalles",
    odometer: "Odómetro",
    maintenance_status: "Estado del Mantenimiento",
    update_odometer: "Actualizar Odómetro",
    configure_maintenance: "Configurar Mantenimientos",
    mods_title: "Mis Modificaciones",
    mods_short: "Mods",
    items_suffix: "ítems",
    
    // Modifications
    add_mod: "Añadir Modificación",
    mod_name: "Nombre / Pieza",
    placeholder_mod_name: "Ej: Stage 1, Alerón...",
    mod_category: "Categoría",
    mod_price: "Precio",
    mod_date: "Fecha Instalación",
    mod_exterior: "Exterior",
    mod_interior: "Interior",
    mod_performance: "Motor",
    mod_wheels: "Ruedas",
    mod_lighting: "Iluminación",
    mod_electronics: "Electrónica",
    mod_other: "Otros",
    no_mods: "No hay modificaciones registradas.",
    mods_help: "Las modificaciones se sincronizan automáticamente con tus gastos.",
    mod_installed: "Instaladas",
    mod_wishlist: "Lista de Deseos",
    add_to_wishlist: "Añadir a Deseos",
    projected_cost: "Coste Estimado",
    total_forecast: "Previsión de Gasto",
    mark_installed: "¡Instalado!",
    confirm_install_title: "Confirmar Instalación",
    confirm_install_msg: "Genial. Confirma los datos finales para guardar el gasto.",
    final_price: "Precio Final",
    install_date: "Fecha Instalación",
    delete_mod_title: "Eliminar Modificación",
    delete_mod_msg: "¿Estás seguro? Esta acción eliminará el registro y su gasto asociado irreversiblemente.",
    
    // Config Modal
    config_title: "Seguimiento de Piezas",
    config_help: "Desactiva las opciones que no necesites seguir para mantener tu garaje limpio y evitar notificaciones innecesarias.",
    item_active: "Activo",
    item_inactive: "Inactivo",
    usage_info: "Uso actual: {km} km",
    interval_label: "Intervalo",
    config_safety_msg: "Por seguridad y salud de tu motor, el rango recomendado para esta tarea es entre {min} y {max} km.",
    
    // Edit & History
    adjust_history: "Ajustar Historial",
    last_replaced_km: "KM al Reemplazar",
    last_replaced_date: "Fecha Reemplazo",
    expiration_date: "Fecha Vencimiento",
    i_dont_know: "No lo sé (Reiniciar)",
    
    record_service: "Registrar Mantenimiento",
    edit_record: "Editar Registro",
    service_date: "Fecha del Servicio",
    total_cost: "Coste Total",
    shop: "Taller / Lugar",
    placeholder_shop: "Nombre del taller",
    notes: "Notas / Observaciones",
    replacing: "Sustituyendo:",
    renewing: "Renovando:",
    replace: "Sustituir",
    renew: "Renovar",
    confirm_replacement: "Confirmar Cambio",
    confirm_renewal: "Confirmar Renovación",
    new_expiration_date: "Nueva Fecha Vencimiento",
    
    // History View
    expense_history: "Historial de Gastos",
    total_expenses: "Inversión Total",
    cost_breakdown: "Desglose por Categoría",
    timeline: "Línea de Tiempo",
    no_history: "Aún no hay registros.",
    cost: "Coste",
    delete_record_confirm: "Esta acción no se puede deshacer. ¿Borrar este registro?",
    select_to_edit: "Selecciona para editar",
    select_to_delete: "Selecciona para eliminar",

    // Settings
    settings: "Ajustes",
    help: "Ayuda",
    open_guide: "Cómo funciona la App",
    general: "General",
    language: "Idioma",
    dark_mode: "Modo Oscuro",
    notifications: "Notificaciones",
    enable_notifications: "Alertas de Mantenimiento",
    info: "Información",
    version: "Versión",
    settings_saved: "Ajustes Guardados",
    save_settings: "Guardar Ajustes",
    
    // Maintenance Items (Categories)
    engine_oil: "Aceite Motor",
    oil_filter: "Filtro de Aceite",
    air_filter: "Filtro de Aire",
    fuel_filter: "Filtro de Combustible",
    spark_plugs: "Bujías",
    glow_plugs: "Calentadores",
    timing_belt: "Correa Distribución",
    accessory_belt: "Correa Accesorios",
    coolant: "Refrigerante",
    dpf_filter: "Filtro Partículas (FAP)",
    brake_pads: "Pastillas de Freno",
    brake_discs: "Discos de Freno",
    brake_fluid: "Líquido de Frenos",
    tires: "Neumáticos",
    shock_absorbers: "Amortiguadores",
    cabin_filter: "Filtro de Habitáculo",
    wipers: "Limpiaparabrisas",
    washer_fluid: "Líquido Limpiaparabrisas",
    bulbs: "Bombillas / Luces",
    gearbox_oil: "Aceite Caja Cambios",
    steering_fluid: "Líquido Dirección",
    clutch: "Embrague",
    battery: "Batería 12V",
    key_battery: "Pila Llave",
    insurance: "Seguro",
    road_tax: "Impuesto Circulación",
    inspection: "ITV / Inspección",
    ac_gas: "Carga Aire Acond.",
    adblue: "AdBlue",
    modification: "Modificación",
    modification_plural: "Modificaciones",
    
    // Sections
    section_legal: "Legal y Documentación",
    section_engine: "Motor y Mecánica",
    section_safety: "Seguridad y Frenada",
    section_visibility: "Visibilidad",
    section_transmission: "Transmisión",
    section_electrical: "Electricidad",
    section_other: "Otros Mantenimientos",

    // Status
    ok: "OK",
    due_soon: "Pronto",
    overdue: "Vencido",
    review_needed: "Revisar",
    
    days: "días",
    left: "restantes",
    late: "días tarde",
    expires_on: "Vence el {date}",
    last: "Último:",
    
    error_negative_mileage: "El kilometraje no puede ser negativo.",
    error_mileage_lower_than_current: "No puedes bajar el kilometraje actual.",
    error_mileage_limit: "El kilometraje del servicio no puede ser mayor al actual del coche.",
    error_negative_cost: "El coste no puede ser negativo.",
    error_future_date: "La fecha no puede ser futura.",
    
    alert_title: "Mantenimiento {car}",
    alert_msg_replace: "{item} necesita ser reemplazado.",
    alert_msg_renew: "{item} está próximo a vencer.",
    unknown_car: "Coche Desconocido",
    
    // Guide
    guide_step1_title: "Tu Garaje Digital",
    guide_step1_desc: "Añade todos tus vehículos. El 'Health Score' te indicará de un vistazo si algún coche necesita atención inmediata basándose en sus mantenimientos pendientes.",
    guide_step2_title: "Mantenimiento Inteligente",
    guide_step2_desc: "El sistema calcula el desgaste basándose en el kilometraje y el tiempo. Verde = OK, Amarillo = Pronto, Rojo = Vencido.",
    guide_step3_title: "Registro de Servicios",
    guide_step3_desc: "Cuando cambies una pieza, regístralo. El sistema actualizará el kilometraje del coche y reiniciará el contador de esa pieza automáticamente.",
    guide_step4_title: "Control de Gastos",
    guide_step4_desc: "Visualiza cuánto inviertes en tu coche. Gráficas detalladas por categoría para saber si gastas más en reparaciones, mejoras o mantenimiento.",
  },
  
  // English Fallback
  en: {
    app_name: "CheckAuto",
    app_tagline: "Maintenance simplified.",
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    confirm: "Confirm",
    delete: "Delete",
    back: "Back",
    update: "Update",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    skip: "Configure Later",
    
    welcome_back: "Welcome Back",
    create_account: "Create Account",
    username: "Email",
    password: "Password",
    login: "Log In",
    logout: "Log Out",
    signup: "Sign Up",
    no_account: "No account?",
    have_account: "Have an account?",
    processing: "Processing...",
    remember_me: "Remember Me",

    tab_garage: "Garage",
    tab_history: "History",
    
    my_garage: "My Garage",
    add_vehicle: "Add Vehicle",
    edit_vehicle: "Edit Vehicle",
    delete_vehicle: "Delete Vehicle",
    delete_vehicle_confirm: "Are you sure? This will delete all history and configs for this car.",
    make: "Make",
    model: "Model",
    year: "Year",
    plate: "Plate",
    current_mileage: "Current Mileage",
    status_good: "Good Condition",
    status_soon: "Maintenance Soon",
    status_attention: "Attention Needed",
    responsible_driver: "Responsible Driver",
    add_photo: "Add Photo",
    change_photo: "Change Photo",
    setup_pending: "Setup Pending",
    
    empty_garage_title: "Your garage is empty",
    empty_garage_desc: "Add your first vehicle to start tracking its health, expenses, and maintenance.",
    add_first_vehicle: "Add my first car",
    
    placeholder_make: "Ex: Toyota",
    placeholder_model: "Ex: Corolla",
    placeholder_year: "Ex: 2022",
    placeholder_plate: "Ex: ABC 123",
    placeholder_km: "Ex: 55000",
    
    alert_unknown_data_title: "Attention! Missing Data",
    alert_unknown_data_msg: "Your safety depends on data. Log your latest maintenance to remove uncertainty.",
    
    wizard_title: "Initial Setup",
    wizard_subtitle: "Let's update your {car}",
    step_legal: "Legal",
    step_engine: "Engine",
    step_prefs: "Preferences",
    wizard_sub_legal: "Inspection & Tax",
    wizard_sub_engine: "Oil & Filters",
    wizard_sub_prefs: "Preferences",
    
    label_itv_date: "Last Inspection Date",
    label_itv_interval: "Inspection Interval",
    label_tax_date: "Next Road Tax",
    label_oil_km: "Last Oil Change KM",
    label_oil_date: "Last Oil Change Date",
    label_oil_interval: "Oil Interval",
    
    option_1_year: "1 Year",
    option_2_years: "2 Years",
    option_4_years: "4 Years",
    
    msg_select_tracking: "Select items to track:",
    
    wizard_success_title: "All Set!",
    wizard_success_msg: "Your car is now under CheckAuto supervision.",
    developed_by_branding: "Developed by Ayuso.dev",
    close_wizard: "Go to Garage",
    
    health_score: "Vehicle Health",
    how_it_works: "How Score Works?",
    score_excellent: "Excellent",
    desc_excellent: "Perfect condition. Max reliability.",
    score_good: "Good",
    desc_good: "Healthy state. Keep it up.",
    score_moderate: "Moderate Risk",
    desc_moderate: "Missing info or pending maintenance.",
    score_critical: "Critical Risk",
    desc_critical: "Urgent check needed. Overdue items.",
    score_explanation: "Points added for up-to-date items (+20) and penalized for uncertainty (-10) or overdue items (-25).",

    health_msg_missing_info: "Missing important info",
    health_msg_urgent: "Urgent check needed",

    details: "Details",
    odometer: "Odometer",
    maintenance_status: "Maintenance Status",
    update_odometer: "Update Odometer",
    configure_maintenance: "Configure Maintenance",
    mods_title: "My Mods",
    mods_short: "Mods",
    items_suffix: "items",
    
    add_mod: "Add Mod",
    mod_name: "Name / Part",
    placeholder_mod_name: "Ex: Stage 1 Tuning",
    mod_category: "Category",
    mod_price: "Price",
    mod_date: "Install Date",
    mod_exterior: "Exterior",
    mod_interior: "Interior",
    mod_performance: "Performance",
    mod_wheels: "Wheels",
    mod_lighting: "Lighting",
    mod_electronics: "Electronics",
    mod_other: "Other",
    no_mods: "No mods recorded.",
    mods_help: "Mods automatically sync with expenses.",
    mod_installed: "Installed",
    mod_wishlist: "Wishlist",
    add_to_wishlist: "Add to Wishlist",
    projected_cost: "Est. Cost",
    total_forecast: "Total Forecast",
    mark_installed: "Installed!",
    confirm_install_title: "Confirm Install",
    confirm_install_msg: "Great. Confirm final details to save expense.",
    final_price: "Final Price",
    install_date: "Install Date",
    delete_mod_title: "Delete Mod",
    delete_mod_msg: "Are you sure? This removes the record and expense irreversibly.",
    
    config_title: "Part Tracking",
    config_help: "Disable options you don't need to keep your garage clean.",
    item_active: "Active",
    item_inactive: "Inactive",
    usage_info: "Current usage: {km} km",
    interval_label: "Interval",
    config_safety_msg: "For engine safety, recommended range is between {min} and {max} km.",
    
    adjust_history: "Adjust History",
    last_replaced_km: "Replaced at KM",
    last_replaced_date: "Replaced Date",
    expiration_date: "Expiration Date",
    i_dont_know: "I don't know (Reset)",
    
    record_service: "Record Service",
    edit_record: "Edit Record",
    service_date: "Service Date",
    total_cost: "Total Cost",
    shop: "Shop / Place",
    placeholder_shop: "Shop Name",
    notes: "Notes",
    replacing: "Replacing:",
    renewing: "Renewing:",
    replace: "Replace",
    renew: "Renew",
    confirm_replacement: "Confirm Replacement",
    confirm_renewal: "Confirm Renewal",
    new_expiration_date: "New Expiration Date",
    
    expense_history: "Expense History",
    total_expenses: "Total Investment",
    cost_breakdown: "Cost Breakdown",
    timeline: "Timeline",
    no_history: "No records yet.",
    cost: "Cost",
    delete_record_confirm: "This cannot be undone. Delete record?",
    select_to_edit: "Select to Edit",
    select_to_delete: "Select to Delete",

    settings: "Settings",
    help: "Help",
    open_guide: "How to use the App",
    general: "General",
    language: "Language",
    dark_mode: "Dark Mode",
    notifications: "Notifications",
    enable_notifications: "Maintenance Alerts",
    info: "Info",
    version: "Version",
    settings_saved: "Settings Saved",
    save_settings: "Save Settings",
    
    engine_oil: "Engine Oil",
    oil_filter: "Oil Filter",
    air_filter: "Air Filter",
    fuel_filter: "Fuel Filter",
    spark_plugs: "Spark Plugs",
    glow_plugs: "Glow Plugs",
    timing_belt: "Timing Belt",
    accessory_belt: "Accessory Belt",
    coolant: "Coolant",
    dpf_filter: "DPF Filter",
    brake_pads: "Brake Pads",
    brake_discs: "Brake Discs",
    brake_fluid: "Brake Fluid",
    tires: "Tires",
    shock_absorbers: "Shock Absorbers",
    cabin_filter: "Cabin Filter",
    wipers: "Wipers",
    washer_fluid: "Washer Fluid",
    bulbs: "Bulbs / Lights",
    gearbox_oil: "Gearbox Oil",
    steering_fluid: "Steering Fluid",
    clutch: "Clutch",
    battery: "Battery 12V",
    key_battery: "Key Battery",
    insurance: "Insurance",
    road_tax: "Road Tax",
    inspection: "Inspection / ITV",
    ac_gas: "AC Gas",
    adblue: "AdBlue",
    modification: "Modification",
    modification_plural: "Modifications",
    
    section_legal: "Legal & Docs",
    section_engine: "Engine & Mech",
    section_safety: "Safety & Brakes",
    section_visibility: "Visibility",
    section_transmission: "Transmission",
    section_electrical: "Electrical",
    section_other: "Other",

    ok: "OK",
    due_soon: "Soon",
    overdue: "Overdue",
    review_needed: "Review",
    
    days: "days",
    left: "left",
    late: "days late",
    expires_on: "Expires on {date}",
    last: "Last:",
    
    error_negative_mileage: "Mileage cannot be negative.",
    error_mileage_lower_than_current: "Cannot lower current mileage.",
    error_mileage_limit: "Service mileage cannot exceed current car mileage.",
    error_negative_cost: "Cost cannot be negative.",
    error_future_date: "Date cannot be in the future.",
    
    alert_title: "Maintenance {car}",
    alert_msg_replace: "{item} needs replacement.",
    alert_msg_renew: "{item} is expiring soon.",
    unknown_car: "Unknown Car",

    guide_step1_title: "Your Digital Garage",
    guide_step1_desc: "Add multiple vehicles. The 'Health Score' shows instantly if a car needs attention based on pending items.",
    guide_step2_title: "Smart Maintenance",
    guide_step2_desc: "System tracks wear based on KM and time. Green = OK, Yellow = Soon, Red = Overdue.",
    guide_step3_title: "Record Services",
    guide_step3_desc: "When replacing a part, log it. The system updates the car's odometer and resets that item's counter.",
    guide_step4_title: "Expense Tracking",
    guide_step4_desc: "Track every dollar. Auto-generated charts show if you spend more on repairs, mods, or maintenance.",
  }
};

type Language = 'es' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');

  // Load language from settings (or prop passed from AppEngine loading)
  // But AppEngine updates via setLanguage, so here we just default.
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations['es'];
    let text = (langDict as any)[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within a I18nProvider');
  }
  return context;
};