
export type SubscriptionTier = 'مجاني' | 'مميز' | 'ذهبي';
export type SubscriptionStatus = 'Active' | 'Expired';
export type Language = 'ar' | 'en' | 'fr';

// Added User interface to fix missing export errors in other files
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  country: string;
  language: Language;
  isEmailVerified: boolean;
  points: number;
  completedCount: number;
  unlockedGifts: string[];
  streak: number;
  notificationsEnabled: boolean;
  reminderTime?: string;
  lastActiveDate?: string;
}

export interface DhikrTranslations {
  title: string;
  content: string;
  explanation?: string;
}

export interface Dhikr {
  id: string;
  category: DhikrCategory;
  subCategory?: string; 
  count: number;
  isPremium: boolean; 
  pointsReward: number;
  translations: Record<Language, DhikrTranslations>;
}

export type DhikrCategory = 'صباح' | 'مساء' | 'نوم' | 'صلاة' | 'أحاديث' | 'متنوع';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface Gift {
  id: string;
  name: string;
  requiredPoints: number;
  rewardType: 'subscription_extension' | 'badge';
  rewardValue: number; 
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
}
