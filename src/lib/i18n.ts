/**
 * Système d'internationalisation
 * Supporte le français, l'anglais, et le malgache
 */

export type Language = 'fr' | 'en' | 'mg'

export interface Translations {
  common: {
    welcome: string
    loading: string
    error: string
    success: string
    cancel: string
    save: string
    delete: string
    edit: string
    add: string
    search: string
    filter: string
    sort: string
    back: string
    next: string
    previous: string
    submit: string
    close: string
    confirm: string
    yes: string
    no: string
  }
  navigation: {
    home: string
    rooms: string
    bookings: string
    profile: string
    login: string
    register: string
    logout: string
    dashboard: string
    analytics: string
    employees: string
    inventory: string
    services: string
    maintenance: string
    settings: string
  }
  auth: {
    login: string
    register: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    rememberMe: string
    forgotPassword: string
    resetPassword: string
    loginSuccess: string
    registerSuccess: string
    loginError: string
    registerError: string
  }
  rooms: {
    title: string
    description: string
    price: string
    capacity: string
    amenities: string
    availability: string
    available: string
    unavailable: string
    bookNow: string
    viewDetails: string
    standard: string
    superior: string
    suite: string
    deluxe: string
    family: string
  }
  bookings: {
    title: string
    checkIn: string
    checkOut: string
    guests: string
    adults: string
    children: string
    specialRequests: string
    totalPrice: string
    confirmBooking: string
    bookingSuccess: string
    bookingError: string
    status: string
    pending: string
    confirmed: string
    cancelled: string
    completed: string
    checkedIn: string
    checkedOut: string
  }
  dashboard: {
    title: string
    totalBookings: string
    totalRevenue: string
    occupancyRate: string
    averageRating: string
    pendingBookings: string
    confirmedBookings: string
    cancelledBookings: string
    completedBookings: string
    revenueByMonth: string
    bookingsByRoomType: string
  }
  employees: {
    title: string
    name: string
    email: string
    position: string
    department: string
    status: string
    active: string
    inactive: string
    onLeave: string
    hireDate: string
    schedule: string
    addEmployee: string
    editEmployee: string
    morning: string
    afternoon: string
    night: string
  }
  inventory: {
    title: string
    name: string
    category: string
    quantity: string
    unit: string
    minStock: string
    supplier: string
    lastRestock: string
    lowStockAlert: string
    addItem: string
    editItem: string
    restock: string
    linen: string
    cleaning: string
    amenities: string
    food: string
    equipment: string
  }
  services: {
    title: string
    restaurant: string
    spa: string
    vehicle: string
    excursion: string
    description: string
    price: string
    duration: string
    availability: string
    bookService: string
    viewBookings: string
    addService: string
    editService: string
  }
  maintenance: {
    title: string
    reportIssue: string
    issueTitle: string
    issueDescription: string
    location: string
    priority: string
    low: string
    medium: string
    high: string
    urgent: string
    status: string
    pending: string
    inProgress: string
    completed: string
    cancelled: string
    assignedTo: string
    date: string
    urgentAlerts: string
  }
  chatbot: {
    title: string
    online: string
    placeholder: string
    quickActions: {
      viewRooms: string
      rates: string
      services: string
      contact: string
    }
  }
  currency: {
    code: string
    symbol: string
  }
  dateFormat: string
  timeFormat: string
}

const translations: Record<Language, Translations> = {
  fr: {
    common: {
      welcome: 'Bienvenue',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      close: 'Fermer',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
    },
    navigation: {
      home: 'Accueil',
      rooms: 'Chambres',
      bookings: 'Réservations',
      profile: 'Profil',
      login: 'Connexion',
      register: 'Inscription',
      logout: 'Déconnexion',
      dashboard: 'Tableau de bord',
      analytics: 'Analytics',
      employees: 'Employés',
      inventory: 'Inventaire',
      services: 'Services',
      maintenance: 'Maintenance',
      settings: 'Paramètres',
    },
    auth: {
      login: 'Connexion',
      register: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      rememberMe: 'Se souvenir de moi',
      forgotPassword: 'Mot de passe oublié ?',
      resetPassword: 'Réinitialiser le mot de passe',
      loginSuccess: 'Connexion réussie',
      registerSuccess: 'Inscription réussie',
      loginError: 'Erreur de connexion',
      registerError: 'Erreur d\'inscription',
    },
    rooms: {
      title: 'Nos Chambres',
      description: 'Description',
      price: 'Prix',
      capacity: 'Capacité',
      amenities: 'Équipements',
      availability: 'Disponibilité',
      available: 'Disponible',
      unavailable: 'Indisponible',
      bookNow: 'Réserver maintenant',
      viewDetails: 'Voir les détails',
      standard: 'Standard',
      superior: 'Supérieure',
      suite: 'Suite',
      deluxe: 'Deluxe',
      family: 'Familiale',
    },
    bookings: {
      title: 'Réservations',
      checkIn: 'Arrivée',
      checkOut: 'Départ',
      guests: 'Invités',
      adults: 'Adultes',
      children: 'Enfants',
      specialRequests: 'Demandes spéciales',
      totalPrice: 'Prix total',
      confirmBooking: 'Confirmer la réservation',
      bookingSuccess: 'Réservation confirmée',
      bookingError: 'Erreur de réservation',
      status: 'Statut',
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée',
      completed: 'Terminée',
      checkedIn: 'Arrivée',
      checkedOut: 'Départ',
    },
    dashboard: {
      title: 'Tableau de bord',
      totalBookings: 'Réservations totales',
      totalRevenue: 'Revenus totaux',
      occupancyRate: 'Taux d\'occupation',
      averageRating: 'Note moyenne',
      pendingBookings: 'En attente',
      confirmedBookings: 'Confirmées',
      cancelledBookings: 'Annulées',
      completedBookings: 'Terminées',
      revenueByMonth: 'Revenus par mois',
      bookingsByRoomType: 'Réservations par type de chambre',
    },
    employees: {
      title: 'Gestion des employés',
      name: 'Nom',
      email: 'Email',
      position: 'Poste',
      department: 'Département',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      onLeave: 'En congé',
      hireDate: 'Date d\'embauche',
      schedule: 'Planning',
      addEmployee: 'Ajouter un employé',
      editEmployee: 'Modifier l\'employé',
      morning: 'Matin',
      afternoon: 'Après-midi',
      night: 'Nuit',
    },
    inventory: {
      title: 'Gestion de l\'inventaire',
      name: 'Article',
      category: 'Catégorie',
      quantity: 'Quantité',
      unit: 'Unité',
      minStock: 'Stock minimum',
      supplier: 'Fournisseur',
      lastRestock: 'Dernier réapprovisionnement',
      lowStockAlert: 'Alertes de réapprovisionnement',
      addItem: 'Ajouter un article',
      editItem: 'Modifier l\'article',
      restock: 'Réapprovisionner',
      linen: 'Linge',
      cleaning: 'Produits de nettoyage',
      amenities: 'Amenities',
      food: 'Nourriture',
      equipment: 'Équipement',
    },
    services: {
      title: 'Services',
      restaurant: 'Restaurant',
      spa: 'Spa & Bien-être',
      vehicle: 'Location de véhicule',
      excursion: 'Excursions',
      description: 'Description',
      price: 'Prix',
      duration: 'Durée',
      availability: 'Disponibilité',
      bookService: 'Réserver',
      viewBookings: 'Voir les réservations',
      addService: 'Ajouter un service',
      editService: 'Modifier le service',
    },
    maintenance: {
      title: 'Maintenance',
      reportIssue: 'Signaler un problème',
      issueTitle: 'Titre du problème',
      issueDescription: 'Description',
      location: 'Lieu',
      priority: 'Priorité',
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgent',
      status: 'Statut',
      pending: 'En attente',
      inProgress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
      assignedTo: 'Assigné à',
      date: 'Date',
      urgentAlerts: 'Alertes urgentes',
    },
    chatbot: {
      title: 'Assistant Hôtel',
      online: 'En ligne 24/7',
      placeholder: 'Écrivez votre message...',
      quickActions: {
        viewRooms: 'Voir les chambres',
        rates: 'Tarifs',
        services: 'Services',
        contact: 'Contact',
      },
    },
    currency: {
      code: 'MGA',
      symbol: 'Ar',
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
  en: {
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    navigation: {
      home: 'Home',
      rooms: 'Rooms',
      bookings: 'Bookings',
      profile: 'Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      employees: 'Employees',
      inventory: 'Inventory',
      services: 'Services',
      maintenance: 'Maintenance',
      settings: 'Settings',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset Password',
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful',
      loginError: 'Login error',
      registerError: 'Registration error',
    },
    rooms: {
      title: 'Our Rooms',
      description: 'Description',
      price: 'Price',
      capacity: 'Capacity',
      amenities: 'Amenities',
      availability: 'Availability',
      available: 'Available',
      unavailable: 'Unavailable',
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      standard: 'Standard',
      superior: 'Superior',
      suite: 'Suite',
      deluxe: 'Deluxe',
      family: 'Family',
    },
    bookings: {
      title: 'Bookings',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guests: 'Guests',
      adults: 'Adults',
      children: 'Children',
      specialRequests: 'Special Requests',
      totalPrice: 'Total Price',
      confirmBooking: 'Confirm Booking',
      bookingSuccess: 'Booking confirmed',
      bookingError: 'Booking error',
      status: 'Status',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
      checkedIn: 'Checked In',
      checkedOut: 'Checked Out',
    },
    dashboard: {
      title: 'Dashboard',
      totalBookings: 'Total Bookings',
      totalRevenue: 'Total Revenue',
      occupancyRate: 'Occupancy Rate',
      averageRating: 'Average Rating',
      pendingBookings: 'Pending',
      confirmedBookings: 'Confirmed',
      cancelledBookings: 'Cancelled',
      completedBookings: 'Completed',
      revenueByMonth: 'Revenue by Month',
      bookingsByRoomType: 'Bookings by Room Type',
    },
    employees: {
      title: 'Employee Management',
      name: 'Name',
      email: 'Email',
      position: 'Position',
      department: 'Department',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      onLeave: 'On Leave',
      hireDate: 'Hire Date',
      schedule: 'Schedule',
      addEmployee: 'Add Employee',
      editEmployee: 'Edit Employee',
      morning: 'Morning',
      afternoon: 'Afternoon',
      night: 'Night',
    },
    inventory: {
      title: 'Inventory Management',
      name: 'Item',
      category: 'Category',
      quantity: 'Quantity',
      unit: 'Unit',
      minStock: 'Min Stock',
      supplier: 'Supplier',
      lastRestock: 'Last Restock',
      lowStockAlert: 'Low Stock Alerts',
      addItem: 'Add Item',
      editItem: 'Edit Item',
      restock: 'Restock',
      linen: 'Linen',
      cleaning: 'Cleaning Supplies',
      amenities: 'Amenities',
      food: 'Food',
      equipment: 'Equipment',
    },
    services: {
      title: 'Services',
      restaurant: 'Restaurant',
      spa: 'Spa & Wellness',
      vehicle: 'Vehicle Rental',
      excursion: 'Excursions',
      description: 'Description',
      price: 'Price',
      duration: 'Duration',
      availability: 'Availability',
      bookService: 'Book',
      viewBookings: 'View Bookings',
      addService: 'Add Service',
      editService: 'Edit Service',
    },
    maintenance: {
      title: 'Maintenance',
      reportIssue: 'Report Issue',
      issueTitle: 'Issue Title',
      issueDescription: 'Description',
      location: 'Location',
      priority: 'Priority',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      status: 'Status',
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      assignedTo: 'Assigned To',
      date: 'Date',
      urgentAlerts: 'Urgent Alerts',
    },
    chatbot: {
      title: 'Hotel Assistant',
      online: 'Online 24/7',
      placeholder: 'Type your message...',
      quickActions: {
        viewRooms: 'View Rooms',
        rates: 'Rates',
        services: 'Services',
        contact: 'Contact',
      },
    },
    currency: {
      code: 'MGA',
      symbol: 'Ar',
    },
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm A',
  },
  mg: {
    common: {
      welcome: 'Tongasoa',
      loading: 'Efa mandeha...',
      error: 'Fahasahiana',
      success: 'Voafy',
      cancel: 'Hanala',
      save: 'Raiketo',
      delete: 'Fafao',
      edit: 'Hanova',
      add: 'Hanampy',
      search: 'Karohy',
      filter: 'Sokafy',
      sort: 'Fampirindra',
      back: 'Miverina',
      next: 'Manaraka',
      previous: 'Aloha',
      submit: 'Alefaso',
      close: 'Hidio',
      confirm: 'Hamafy',
      yes: 'Eny',
      no: 'Tsia',
    },
    navigation: {
      home: 'Fandraisana',
      rooms: 'Efitrano',
      bookings: 'Fandefasana',
      profile: 'Mombamomba',
      login: 'Hiditra',
      register: 'Hisoratra',
      logout: 'Miala',
      dashboard: 'Latabatra',
      analytics: 'Analytics',
      employees: 'Mpanao asa',
      inventory: 'Tahirin-karena',
      services: 'Serivisy',
      maintenance: 'Fiarovana',
      settings: 'Fikirana',
    },
    auth: {
      login: 'Hiditra',
      register: 'Hisoratra',
      email: 'Mailaka',
      password: 'Tenimiafina',
      confirmPassword: 'Hamafy ny tenimiafina',
      firstName: 'Anarana',
      lastName: 'Fanampin\'anarana',
      rememberMe: 'Hatsiaro ny teniko',
      forgotPassword: 'Adino ny tenimiafina?',
      resetPassword: 'Avereno ny tenimiafina',
      loginSuccess: 'Tafiditra soa aman-tsara',
      registerSuccess: 'Nosoratra soa aman-tsara',
      loginError: 'Fahasahiana amin\'ny fidirana',
      registerError: 'Fahasahiana amin\'ny fisoratana',
    },
    rooms: {
      title: 'Ny Efitranay',
      description: 'Famaritana',
      price: 'Vidiny',
      capacity: 'Fahafahana',
      amenities: 'Zavatra ilaina',
      availability: 'Fahampian\'ny',
      available: 'Misahatra',
      unavailable: 'Tsy misahatra',
      bookNow: 'Fandefasana',
      viewDetails: 'Hijery ny antsipiriany',
      standard: 'Fototra',
      superior: 'Ambony',
      suite: 'Suite',
      deluxe: 'Deluxe',
      family: 'Fianakaviana',
    },
    bookings: {
      title: 'Fandefasana',
      checkIn: 'Fidirana',
      checkOut: 'Fialanana',
      guests: 'Vahiny',
      adults: 'Lehilahy',
      children: 'Zazakely',
      specialRequests: 'Fangatahana manokana',
      totalPrice: 'Vidiny manontolo',
      confirmBooking: 'Hamafy ny fandefasana',
      bookingSuccess: 'Fandefasana voafaritra',
      bookingError: 'Fahasahiana amin\'ny fandefasana',
      status: 'Toerana',
      pending: 'Miandry',
      confirmed: 'Voafaritra',
      cancelled: 'Nofoana',
      completed: 'Vita',
      checkedIn: 'Tafiditra',
      checkedOut: 'Tafiala',
    },
    dashboard: {
      title: 'Latabatra',
      totalBookings: 'Fandefasana manontolo',
      totalRevenue: 'Harena manontolo',
      occupancyRate: 'Tahan\'ny fampiasana',
      averageRating: 'Salaman\'ny hevitra',
      pendingBookings: 'Miandry',
      confirmedBookings: 'Voafaritra',
      cancelledBookings: 'Nofoana',
      completedBookings: 'Vita',
      revenueByMonth: 'Harena isam-bolana',
      bookingsByRoomType: 'Fandefasana araka ny karazan\'efitra',
    },
    employees: {
      title: 'Fikarohana mpanao asa',
      name: 'Anarana',
      email: 'Mailaka',
      position: 'Asa',
      department: 'Sekoly',
      status: 'Toerana',
      active: 'Miasa',
      inactive: 'Tsy miasa',
      onLeave: 'Miala tsiny',
      hireDate: 'Daty niasana',
      schedule: 'Fandaharam-potoana',
      addEmployee: 'Hanampy mpanao asa',
      editEmployee: 'Hanova mpanao asa',
      morning: 'Maraina',
      afternoon: 'Tsiroaro',
      night: 'Alina',
    },
    inventory: {
      title: 'Fikarohana tahirin-karena',
      name: 'Zavatra',
      category: 'Sokajy',
      quantity: 'Isany',
      unit: 'Fomba',
      minStock: 'Isa kely indrindra',
      supplier: 'Mpamatsy',
      lastRestock: 'Fandefasana farany',
      lowStockAlert: 'Fampitandremana',
      addItem: 'Hanampy zavatra',
      editItem: 'Hanova zavatra',
      restock: 'Hanampy',
      linen: 'Lamba',
      cleaning: 'Zavatra fadio',
      amenities: 'Zavatra ilaina',
      food: 'Sakafo',
      equipment: 'Fitaovana',
    },
    services: {
      title: 'Serivisy',
      restaurant: 'Trano sakafo',
      spa: 'Spa',
      vehicle: 'Fiara',
      excursion: 'Dingana',
      description: 'Famaritana',
      price: 'Vidiny',
      duration: 'Fotoana',
      availability: 'Fahampian\'ny',
      bookService: 'Fandefasana',
      viewBookings: 'Hijery ny fandefasana',
      addService: 'Hanampy serivisy',
      editService: 'Hanova serivisy',
    },
    maintenance: {
      title: 'Fiarovana',
      reportIssue: 'Hampitandrema olana',
      issueTitle: 'Loharan\'ny olana',
      issueDescription: 'Famaritana',
      location: 'Toerana',
      priority: 'Tanjona',
      low: 'Ambany',
      medium: 'Antonony',
      high: 'Ambony',
      urgent: 'Miala tsiny',
      status: 'Toerana',
      pending: 'Miandry',
      inProgress: 'Mandeha',
      completed: 'Vita',
      cancelled: 'Nofoana',
      assignedTo: 'Iankirina',
      date: 'Daty',
      urgentAlerts: 'Fampitandrema miala tsiny',
    },
    chatbot: {
      title: 'Mpanampy tranokala',
      online: 'Amin\'ny 24/7',
      placeholder: 'Soratra ny hafatrao...',
      quickActions: {
        viewRooms: 'Hijery ny efitrano',
        rates: 'Vidiny',
        services: 'Serivisy',
        contact: 'Fifandraisana',
      },
    },
    currency: {
      code: 'MGA',
      symbol: 'Ar',
    },
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
}

/**
 * Obtenir les traductions pour une langue donnée
 */
export function getTranslations(language: Language): Translations {
  return translations[language] || translations.fr
}

/**
 * Obtenir la langue par défaut du navigateur
 */
export function getDefaultLanguage(): Language {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0] as Language
    if (translations[browserLang]) {
      return browserLang
    }
  }
  return 'fr'
}

/**
 * Formater une date selon la langue
 */
export function formatDate(date: Date, language: Language): string {
  const format = translations[language].dateFormat
  const d = new Date(date)
  
  if (language === 'fr' || language === 'mg') {
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } else {
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }
}

/**
 * Formater un montant selon la devise
 */
export function formatCurrency(amount: number, language: Language): string {
  const currency = translations[language].currency
  return `${amount.toLocaleString()} ${currency.symbol}`
}
