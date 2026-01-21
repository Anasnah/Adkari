
import { PrayerTimes } from '../types';

export const fetchPrayerTimes = async (country: string): Promise<PrayerTimes | null> => {
  try {
    // In a real app, we might need a city too. For simplicity, we use the country or let user choose.
    // Defaulting to a capital for the demo.
    const cityMap: Record<string, string> = {
      'السعودية': 'الرياض',
      'مصر': 'القاهرة',
      'الإمارات': 'دبي',
      'الكويت': 'الكويت',
      'الأردن': 'عمان',
    };
    const city = cityMap[country] || 'Makkah';
    
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=4`);
    const data = await response.json();
    
    if (data.code === 200) {
      return {
        Fajr: data.data.timings.Fajr,
        Sunrise: data.data.timings.Sunrise,
        Dhuhr: data.data.timings.Dhuhr,
        Asr: data.data.timings.Asr,
        Maghrib: data.data.timings.Maghrib,
        Isha: data.data.timings.Isha,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
};
