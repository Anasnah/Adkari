
import { User, Dhikr, Gift, AuditLog } from './types';

const USERS_KEY = 'adhkari_users_v7';
const DHIKR_KEY = 'adhkari_dhikr_v7';
const GIFTS_KEY = 'adhkari_gifts_v7';
const LOGS_KEY = 'adhkari_logs_v7';

export const ARAB_COUNTRIES = [
  'السعودية', 'مصر', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان', 
  'الأردن', 'لبنان', 'فلسطين', 'سوريا', 'العراق', 'المغرب', 'تونس', 
  'الجزائر', 'ليبيا', 'السودان', 'اليمن', 'موريتانيا', 'الصومال', 'جيبوتي', 'جزر القمر'
];

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    const defaultAdmin: User = {
      id: 'admin-1',
      email: 'anasnahilo20@gmail.com',
      role: 'admin',
      subscriptionTier: 'ذهبي',
      subscriptionStatus: 'Active',
      country: 'السعودية',
      language: 'ar',
      isEmailVerified: true,
      points: 150,
      completedCount: 25,
      unlockedGifts: [],
      streak: 5,
      notificationsEnabled: true,
      reminderTime: '08:00'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  return JSON.parse(data);
};

export const saveUsers = (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const getStoredDhikr = (): Dhikr[] => {
  const data = localStorage.getItem(DHIKR_KEY);
  if (!data) {
    const initial: Dhikr[] = [
      { 
        id: '1', 
        category: 'صباح', 
        count: 1, 
        isPremium: false, 
        pointsReward: 5,
        translations: {
          ar: { title: 'أذكار الصباح', content: 'أصبحنا وأصبح الملك لله والحمد لله...', explanation: 'هذا الذكر يبعث الطمأنينة.' },
          en: { title: 'Morning Dhikr', content: 'We have reached the morning...', explanation: 'This dhikr brings tranquility.' },
          fr: { title: 'Dhikr du Matin', content: 'Nous sommes au matin...', explanation: 'Ce dhikr apporte la tranquillité.' }
        }
      },
      { 
        id: '2', 
        category: 'أحاديث', 
        subCategory: 'أحاديث نبوية', 
        count: 1, 
        isPremium: true, 
        pointsReward: 10,
        translations: {
          ar: { title: 'حديث النية', content: 'إنما الأعمال بالنيات...', explanation: 'مدار الدين على النية.' },
          en: { title: 'Hadith of Intention', content: 'Actions are but by intentions...', explanation: 'Religion is based on intention.' },
          fr: { title: "Hadith de l'Intention", content: 'Les actions ne valent que par les intentions...', explanation: "La religion est basée sur l'intention." }
        }
      }
    ];
    localStorage.setItem(DHIKR_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const saveDhikr = (dhikr: Dhikr[]) => localStorage.setItem(DHIKR_KEY, JSON.stringify(dhikr));

export const getStoredGifts = (): Gift[] => {
  const data = localStorage.getItem(GIFTS_KEY);
  if (!data) {
    const initial: Gift[] = [
      { id: 'g1', name: 'مبتدئ الذاكرين', requiredPoints: 10, rewardType: 'badge', rewardValue: 0 },
      { id: 'g2', name: 'تمديد اشتراك (3 أيام)', requiredPoints: 50, rewardType: 'subscription_extension', rewardValue: 3 },
    ];
    localStorage.setItem(GIFTS_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const saveGifts = (gifts: Gift[]) => localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));

export const getStoredLogs = (): AuditLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addLog = (adminEmail: string, action: string) => {
  const logs = getStoredLogs();
  const newLog: AuditLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleString('ar-EG'),
    adminEmail,
    action
  };
  localStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...logs].slice(0, 100)));
};
