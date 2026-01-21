
import React, { useState, useEffect } from 'react';
import { User, Dhikr, SubscriptionTier, PrayerTimes, Gift, AuditLog, DhikrCategory, SubscriptionStatus, Language, DhikrTranslations } from './types';
import { getStoredUsers, saveUsers, getStoredDhikr, saveDhikr, getStoredGifts, saveGifts, getStoredLogs, addLog, ARAB_COUNTRIES } from './mockDb';
import { fetchPrayerTimes } from './services/prayerTimes';
import { translations } from './translations';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Moon, Sun, LayoutDashboard, Home, BookOpen, Clock, 
  Settings, User as UserIcon, LogOut, CheckCircle, 
  Search, Plus, Trash, Edit, ChevronLeft,
  ChevronRight, MapPin, RefreshCw, Trophy, Gift as GiftIcon, Info, History, Flame, Bell, BellOff, X, Lock, ChevronDown, Layers, UserPlus, Key, Globe, Sparkles, AlertCircle, Star
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('ar');
  const [view, setView] = useState<'auth' | 'main' | 'admin'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'home' | 'dhikr' | 'prayer' | 'profile' | 'gifts'>('home');
  const [selectedCategoryFromHome, setSelectedCategoryFromHome] = useState<DhikrCategory | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('السعودية');
  const [allDhikr, setAllDhikr] = useState<Dhikr[]>(getStoredDhikr());
  const [allUsers, setAllUsers] = useState<User[]>(getStoredUsers());
  const [allGifts, setAllGifts] = useState<Gift[]>(getStoredGifts());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  const t = (key: string) => translations[language][key] || key;

  useEffect(() => {
    isDarkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (currentUser) {
      setLanguage(currentUser.language);
      fetchPrayerTimes(currentUser.country).then(setPrayerTimes);
      checkStreak(currentUser);
    }
  }, [currentUser?.id]);

  const checkStreak = (user: User) => {
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    let newStreak = user.streak;
    if (user.lastActiveDate === yesterdayStr) newStreak += 1;
    else if (user.lastActiveDate !== today) newStreak = 1;
    updateUserInStorage({ ...user, streak: newStreak, lastActiveDate: today });
  };

  const updateUserInStorage = (updated: User) => {
    const updatedUsers = allUsers.map(u => u.id === updated.id ? updated : u);
    setAllUsers(updatedUsers);
    saveUsers(updatedUsers);
    setCurrentUser(updated);
  };

  const handleLogin = () => {
    const users = getStoredUsers();
    if (email === 'anasnahilo20@gmail.com' && password === 'Anas@2000') {
      const admin = users.find(u => u.email === email);
      if (admin) { setCurrentUser(admin); setLanguage(admin.language); setView('main'); return; }
    }
    const user = users.find(u => u.email === email);
    if (user) { setCurrentUser(user); setLanguage(user.language); setView('main'); }
    else alert(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid Credentials');
  };

  const handleSignUp = () => {
    if (!email || !password) return;
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
      alert(language === 'ar' ? 'هذا الحساب موجود بالفعل' : 'Account already exists');
      return;
    }
    const newUser: User = { id: Math.random().toString(36).substr(2, 9), email, role: 'user', subscriptionTier: 'مجاني', subscriptionStatus: 'Active', country, language, isEmailVerified: false, points: 0, completedCount: 0, unlockedGifts: [], streak: 1, notificationsEnabled: true, lastActiveDate: new Date().toISOString().split('T')[0] };
    const updated = [...users, newUser];
    setAllUsers(updated);
    saveUsers(updated);
    setCurrentUser(newUser);
    setView('main');
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    if (currentUser) updateUserInStorage({ ...currentUser, language: lang });
  };

  const completeDhikrAction = (dhikr: Dhikr) => {
    if (!currentUser) return;
    updateUserInStorage({ ...currentUser, points: currentUser.points + (dhikr.pointsReward || 5), completedCount: currentUser.completedCount + 1 });
  };

  const claimGift = (gift: Gift) => {
    if (!currentUser || currentUser.points < gift.requiredPoints) return;
    updateUserInStorage({ ...currentUser, points: currentUser.points - gift.requiredPoints, unlockedGifts: [...currentUser.unlockedGifts, gift.id] });
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center transition-colors duration-300 font-sans`}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
        
        <header className="p-4 flex items-center justify-between glass sticky top-0 z-50 border-b border-transparent dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><BookOpen size={24} /></div>
            <h1 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{t('appName')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            {isAdmin && view !== 'admin' && (
              <button onClick={() => setView('admin')} className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 transition">
                <LayoutDashboard size={20} />
              </button>
            )}
            {currentUser && <button onClick={() => { setCurrentUser(null); setView('auth'); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><LogOut size={20} /></button>}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 no-scrollbar pb-24">
          {view === 'auth' && (
            <div className="py-10 space-y-8 animate-fade-in flex flex-col items-center px-4 text-center">
              <div className="w-24 h-24 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl rotate-3 mb-4">
                <BookOpen size={48} />
              </div>
              <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{t('appName')}</h2>
              <p className="text-slate-400 dark:text-slate-500 italic">{t('slogan')}</p>

              <div className="w-full space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                  <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${authMode === 'login' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>{t('login')}</button>
                  <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-black text-sm transition ${authMode === 'signup' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>{t('signup')}</button>
                </div>
                <div className="relative">
                  <UserIcon className="absolute right-4 top-4 text-slate-400" size={20} />
                  <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 ring-emerald-500 transition font-bold" />
                </div>
                <div className="relative">
                  <Key className="absolute right-4 top-4 text-slate-400" size={20} />
                  <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 ring-emerald-500 transition font-bold" />
                </div>
                <button onClick={authMode === 'login' ? handleLogin : handleSignUp} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-xl transition transform active:scale-95">
                  {authMode === 'login' ? t('login') : t('signup')}
                </button>
              </div>
            </div>
          )}

          {view === 'main' && (
            <div className="space-y-6 animate-fade-in">
              {activeTab === 'home' && <HomeScreen prayerTimes={prayerTimes} user={currentUser} onSelectCategory={(cat: DhikrCategory) => { setSelectedCategoryFromHome(cat); setActiveTab('dhikr'); }} t={t} />}
              {activeTab === 'dhikr' && <DhikrListScreen allDhikr={allDhikr} onComplete={completeDhikrAction} user={currentUser} initialCategory={selectedCategoryFromHome} onClearInitialCategory={() => setSelectedCategoryFromHome(null)} t={t} language={language}/>}
              {activeTab === 'prayer' && <PrayerTimesScreen prayerTimes={prayerTimes} user={currentUser} t={t} />}
              {activeTab === 'gifts' && <GiftsScreen user={currentUser!} gifts={allGifts} onClaim={claimGift} t={t}/>}
              {activeTab === 'profile' && <ProfileScreen user={currentUser!} t={t} changeLanguage={changeLanguage}/>}
            </div>
          )}

          {view === 'admin' && (
            <AdminDashboard 
              onClose={() => setView('main')} 
              users={allUsers} 
              dhikr={allDhikr} 
              gifts={allGifts} 
              onUpdateUsers={setAllUsers} 
              onUpdateDhikr={setAllDhikr} 
              onUpdateGifts={setAllGifts} 
              adminEmail={currentUser?.email || ''} 
              t={t}
            />
          )}
        </main>

        {view === 'main' && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 glass border-t border-slate-200 dark:border-slate-700 flex items-center justify-around px-2 z-50">
            <NavBtn icon={Home} label={t('home')} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavBtn icon={BookOpen} label={t('dhikr')} active={activeTab === 'dhikr'} onClick={() => { setActiveTab('dhikr'); setSelectedCategoryFromHome(null); }} />
            <NavBtn icon={Clock} label={t('prayer')} active={activeTab === 'prayer'} onClick={() => setActiveTab('prayer')} />
            <NavBtn icon={Trophy} label={t('gifts')} active={activeTab === 'gifts'} onClick={() => setActiveTab('gifts')} />
            <NavBtn icon={UserIcon} label={t('profile')} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          </nav>
        )}
      </div>
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${active ? 'text-emerald-600 scale-110 font-bold' : 'text-slate-400 dark:text-slate-500 opacity-70'}`}>
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px]">{label}</span>
  </button>
);

const HomeScreen = ({ prayerTimes, user, onSelectCategory, t }: any) => (
  <div className="space-y-6">
    <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl text-white shadow-xl flex items-center justify-between overflow-hidden relative">
      <div className="space-y-1 relative z-10">
        <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">{t('streak')}</p>
        <h2 className="text-4xl font-black">{user?.streak} {t('days')}</h2>
        <p className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg inline-block">بطل الأذكار اليومية!</p>
      </div>
      <Flame size={80} className="text-yellow-300 fill-yellow-300 absolute -left-4 -bottom-4 opacity-40 rotate-12" />
      <Flame size={48} className="text-yellow-300 fill-yellow-300 relative z-10 animate-pulse" />
    </div>

    <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold truncate max-w-[150px]">{user?.email.split('@')[0]}</h2>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border border-white/20 mt-1 inline-block">{user?.subscriptionTier}</span>
        </div>
        <div className="bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 border border-white/20">
          <Trophy size={16} className="text-yellow-300" />
          <span className="font-black text-sm">{user?.points}</span>
        </div>
      </div>
      <Sparkles size={120} className="absolute -right-10 -bottom-10 text-white/10" />
    </div>

    <div className="grid grid-cols-2 gap-4">
      {[
        { id: 'صباح', label: t('morning'), icon: Sun, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
        { id: 'مساء', label: t('evening'), icon: Moon, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' },
        { id: 'أحاديث', label: t('hadith'), icon: History, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
        { id: 'متنوع', label: t('misc'), icon: Layers, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' }
      ].map(cat => (
        <button key={cat.id} onClick={() => onSelectCategory(cat.id as DhikrCategory)} className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-3 transition hover:shadow-lg hover:border-emerald-500 transform active:scale-95 group">
           <div className={`p-4 rounded-2xl ${cat.color} transition duration-300 group-hover:scale-110`}><cat.icon size={24} /></div>
           <span className="text-sm font-black dark:text-slate-100">{cat.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const DhikrListScreen = ({ allDhikr, onComplete, user, initialCategory, onClearInitialCategory, t, language }: any) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<DhikrCategory | null>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null);
  const [count, setCount] = useState(0);

  const isUserPremium = user?.subscriptionTier === 'مميز' || user?.subscriptionTier === 'ذهبي';
  const filteredByMain = allDhikr.filter((d: Dhikr) => d.category === selectedMainCategory);
  const subCategories = Array.from(new Set(filteredByMain.map((d: Dhikr) => d.subCategory).filter(Boolean))) as string[];
  const dhikrsToShow = selectedSubCategory ? filteredByMain.filter((d: Dhikr) => d.subCategory === selectedSubCategory) : filteredByMain.filter((d: Dhikr) => !d.subCategory);

  const handleBack = () => {
    if (selectedDhikr) { setSelectedDhikr(null); setCount(0); }
    else if (selectedSubCategory) { setSelectedSubCategory(null); }
    else if (selectedMainCategory) { setSelectedMainCategory(null); onClearInitialCategory(); }
  };

  if (selectedDhikr) {
    const trans = selectedDhikr.translations?.[language] || selectedDhikr.translations?.['ar'] || { title: 'Untitled', content: 'No Content' };
    const isLocked = selectedDhikr.isPremium && !isUserPremium;
    
    return (
      <div className="space-y-6 text-center animate-fade-in relative">
        <button onClick={handleBack} className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold mb-4 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
           {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} {t('back')}
        </button>
        
        {isLocked && (
          <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[6px] flex flex-col items-center justify-center p-10 rounded-3xl">
             <Lock size={64} className="text-amber-500 mb-4 animate-bounce" />
             <h3 className="text-xl font-black mb-2">{t('lockedTitle') || 'هذا المحتوى للمشتركين فقط'}</h3>
             <p className="text-slate-500 text-sm">{t('lockedExplanation')}</p>
          </div>
        )}

        <h2 className="text-2xl font-black dark:text-slate-100">{trans.title}</h2>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-800 text-2xl leading-relaxed shadow-xl dark:text-slate-200">
          {trans.content}
        </div>
        {trans.explanation && (
           <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl text-xs text-slate-500 dark:text-slate-400 border border-amber-100 dark:border-amber-900/30">
              <span className="font-black text-amber-600 block mb-1">{t('explanation')}:</span>
              {trans.explanation}
           </div>
        )}
        <div className="flex flex-col items-center gap-6 pt-10">
          <button 
            disabled={isLocked}
            onClick={() => { if (count < selectedDhikr.count) setCount(c => c + 1); if (count + 1 === selectedDhikr.count) onComplete(selectedDhikr); }} 
            className={`w-44 h-44 rounded-full text-white text-5xl font-black shadow-2xl transition transform active:scale-90 flex flex-col items-center justify-center border-8 border-white dark:border-slate-800 ${count >= selectedDhikr.count ? 'bg-slate-300 dark:bg-slate-700' : 'bg-emerald-600 dark:bg-emerald-500'}`}
          >
            {count}
            <span className="text-xs font-bold opacity-60">/{selectedDhikr.count}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!selectedMainCategory) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-3xl font-black dark:text-slate-100">{t('dhikr')}</h2>
        <div className="grid grid-cols-1 gap-4">
          {['صباح', 'مساء', 'نوم', 'صلاة', 'أحاديث', 'متنوع'].map(catID => (
            <button key={catID} onClick={() => setSelectedMainCategory(catID as DhikrCategory)} className="w-full p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm transition hover:shadow-md hover:border-emerald-500 transform active:scale-[0.98]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600"><BookOpen size={24}/></div>
                 <span className="text-lg font-black dark:text-slate-100">{catID}</span>
              </div>
              {language === 'ar' ? <ChevronLeft className="text-slate-300 dark:text-slate-600" /> : <ChevronRight className="text-slate-300 dark:text-slate-600" />}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={handleBack} className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl">
        {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} {selectedMainCategory}
      </button>
      <div className="space-y-4">
        {dhikrsToShow.length > 0 ? dhikrsToShow.map((d: Dhikr) => (
          <button key={d.id} onClick={() => setSelectedDhikr(d)} className="w-full p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm transition group hover:border-emerald-500">
            <div className="flex items-center gap-3">
               <h4 className="font-black text-sm dark:text-slate-200">{(d.translations?.[language] || d.translations?.['ar'] || {title: 'Dhikr'}).title}</h4>
               {d.isPremium && <Star size={14} className="text-amber-500 fill-amber-500" />}
            </div>
            {language === 'ar' ? <ChevronLeft className="text-slate-300 group-hover:text-emerald-500" /> : <ChevronRight className="text-slate-300 group-hover:text-emerald-500" />}
          </button>
        )) : <div className="text-center py-20 text-slate-400 dark:text-slate-600">قريباً...</div>}
      </div>
    </div>
  );
};

const PrayerTimesScreen = ({ prayerTimes, user, t }: any) => (
  <div className="space-y-6 animate-fade-in text-center">
    <h2 className="text-3xl font-black dark:text-slate-100">{t('prayer')}</h2>
    <p className="text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 font-bold"><MapPin size={16}/> {user?.country}</p>
    <div className="grid grid-cols-1 gap-4">
      {prayerTimes ? Object.entries(prayerTimes).map(([name, time]) => (
        <div key={name} className="flex justify-between items-center p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition">
           <span className="font-black text-lg dark:text-slate-200">{name}</span>
           <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{time as string}</span>
        </div>
      )) : <div className="py-20 flex justify-center"><RefreshCw className="animate-spin text-emerald-600" size={48}/></div>}
    </div>
  </div>
);

const GiftsScreen = ({ user, gifts, onClaim, t }: any) => (
  <div className="space-y-6 animate-fade-in">
     <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl flex justify-between items-center overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-amber-100 text-[10px] font-black uppercase mb-1">{t('points')}</p>
          <h2 className="text-5xl font-black">{user.points}</h2>
        </div>
        <Trophy size={100} className="absolute -left-4 -bottom-4 opacity-30 rotate-12" />
        <Trophy size={64} className="relative z-10 text-white" />
     </div>
  </div>
);

const ProfileScreen = ({ user, t, changeLanguage }: any) => (
  <div className="space-y-8 text-center pt-8 animate-fade-in">
     <div className="w-32 h-32 bg-emerald-600 rounded-full mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl">
       {user.email[0].toUpperCase()}
     </div>
     <h2 className="text-2xl font-black dark:text-slate-100">{user.email}</h2>
     <div className="flex justify-center gap-2">
       {['ar', 'en', 'fr'].map(l => (
         <button key={l} onClick={() => changeLanguage(l as Language)} className={`px-4 py-2 rounded-xl font-black transition ${user.language === l ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>{l.toUpperCase()}</button>
       ))}
     </div>
  </div>
);

const AdminDashboard = ({ onClose, users, dhikr, gifts, onUpdateUsers, onUpdateDhikr, onUpdateGifts, adminEmail, t }: any) => {
  const [tab, setTab] = useState<'users' | 'dhikr' | 'logs'>('users');
  const [isAddingDhikr, setIsAddingDhikr] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [newDhikr, setNewDhikr] = useState<Partial<DhikrTranslations>>({ title: '', content: '', explanation: '' });
  const [dhikrMeta, setDhikrMeta] = useState({ 
    category: 'متنوع' as DhikrCategory, 
    count: 1, 
    isPremium: false, 
    pointsReward: 5, 
    subCategory: '' 
  });

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const handleAddDhikr = async () => {
    if (!newDhikr.title || !newDhikr.content) return;
    setIsTranslating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate to Arabic, English, and French. Provide ONLY JSON object with keys 'ar', 'en', 'fr'. Each key has 'title', 'content', 'explanation'.
                   Title: ${newDhikr.title}, Content: ${newDhikr.content}, Explanation: ${newDhikr.explanation || 'None'}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ar: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, explanation: { type: Type.STRING } } },
              en: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, explanation: { type: Type.STRING } } },
              fr: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, explanation: { type: Type.STRING } } }
            }
          }
        }
      });
      const translatedData = JSON.parse(response.text);
      const item: Dhikr = { 
        id: Math.random().toString(36).substr(2, 9), 
        category: dhikrMeta.category, 
        subCategory: dhikrMeta.subCategory || undefined, 
        count: dhikrMeta.count, 
        isPremium: dhikrMeta.isPremium, 
        pointsReward: dhikrMeta.pointsReward, 
        translations: translatedData 
      };
      
      const updated = [...dhikr, item];
      onUpdateDhikr(updated);
      saveDhikr(updated);
      addLog(adminEmail, `Add Dhikr: ${newDhikr.title} (Cat: ${dhikrMeta.category})`);
      setIsAddingDhikr(false);
      setNewDhikr({ title: '', content: '', explanation: '' });
    } catch (e) {
      console.error(e);
      alert("AI Translation Failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{t('adminPanel')}</h2>
        <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full transition"><ChevronRight size={20}/></button>
      </div>
      
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-x-auto no-scrollbar border dark:border-slate-600">
        {['users', 'dhikr', 'logs'].map(tID => (
          <button key={tID} onClick={() => setTab(tID as any)} className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition ${tab === tID ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-md' : 'text-slate-400 opacity-70'}`}>
            {t(tID)}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          {users && users.length > 0 ? users.map((u: any) => (
            <div key={u.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm dark:text-slate-200">{u.email}</span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{u.points} pts</span>
              </div>
              <select 
                value={u.subscriptionTier} 
                onChange={(e) => {
                  const updated = users.map((user: any) => user.id === u.id ? { ...user, subscriptionTier: e.target.value as SubscriptionTier } : user);
                  onUpdateUsers(updated);
                  saveUsers(updated);
                }}
                className="w-full p-2.5 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="مجاني">مجاني (Free)</option>
                <option value="مميز">مميز (Premium)</option>
                <option value="ذهبي">ذهبي (Gold)</option>
              </select>
            </div>
          )) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2"><Search size={40} className="opacity-20"/><p>No users found</p></div>
          )}
        </div>
      )}

      {tab === 'dhikr' && (
        <div className="space-y-4">
          {!isAddingDhikr ? (
            <button onClick={() => setIsAddingDhikr(true)} className="w-full py-5 border-2 border-dashed border-emerald-300 dark:border-slate-700 rounded-[2rem] text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
              <Plus size={20}/> {t('addContent')}
            </button>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-emerald-500 space-y-4 animate-slide-up relative overflow-hidden">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-slate-800 dark:text-slate-100">محتوى جديد</h4>
                <button onClick={() => setIsAddingDhikr(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
              </div>

              {/* Adhkar Settings Section */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">التصنيف</label>
                    <select 
                      value={dhikrMeta.category} 
                      onChange={e => setDhikrMeta({...dhikrMeta, category: e.target.value as DhikrCategory})}
                      className="w-full p-3 rounded-xl border dark:bg-slate-800 text-xs font-bold outline-none"
                    >
                      {['صباح', 'مساء', 'نوم', 'صلاة', 'أحاديث', 'متنوع'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">العداد</label>
                    <input 
                      type="number" 
                      value={dhikrMeta.count} 
                      onChange={e => setDhikrMeta({...dhikrMeta, count: parseInt(e.target.value) || 1})}
                      className="w-full p-3 rounded-xl border dark:bg-slate-800 text-xs font-bold outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">النقاط</label>
                    <input 
                      type="number" 
                      value={dhikrMeta.pointsReward} 
                      onChange={e => setDhikrMeta({...dhikrMeta, pointsReward: parseInt(e.target.value) || 0})}
                      className="w-full p-3 rounded-xl border dark:bg-slate-800 text-xs font-bold outline-none"
                    />
                 </div>
                 <div className="flex items-center gap-2 pt-4">
                    <input 
                      type="checkbox" 
                      id="isPremium" 
                      checked={dhikrMeta.isPremium} 
                      onChange={e => setDhikrMeta({...dhikrMeta, isPremium: e.target.checked})}
                      className="w-5 h-5 accent-emerald-600 rounded"
                    />
                    <label htmlFor="isPremium" className="text-xs font-black dark:text-slate-300">محتوى مميز؟</label>
                 </div>
              </div>

              <input placeholder="العنوان (مثال: أذكار الصباح)" className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none font-bold text-slate-800 dark:text-slate-200" value={newDhikr.title} onChange={e => setNewDhikr({...newDhikr, title: e.target.value})}/>
              <textarea placeholder="النص الأساسي" className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm h-32 outline-none font-bold text-slate-800 dark:text-slate-200" value={newDhikr.content} onChange={e => setNewDhikr({...newDhikr, content: e.target.value})}/>
              <textarea placeholder="التفسير (اختياري)" className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm h-20 outline-none font-bold text-slate-800 dark:text-slate-200" value={newDhikr.explanation} onChange={e => setNewDhikr({...newDhikr, explanation: e.target.value})}/>
              
              <button 
                onClick={handleAddDhikr} 
                disabled={isTranslating} 
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50 transition transform active:scale-95 shadow-xl"
              >
                {isTranslating ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                {isTranslating ? 'AI Translating...' : 'AI Save & Translate'}
              </button>
            </div>
          )}
          {dhikr && dhikr.length > 0 ? dhikr.map((d: Dhikr) => (
            <div key={d.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-600"><BookOpen size={16}/></div>
                 <div className="flex flex-col">
                    <h4 className="font-black text-sm dark:text-slate-200">{(d.translations?.['ar'] || d.translations?.['en'] || {title: 'Unknown'}).title}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{d.category} | {d.count}x | {d.pointsReward}pts</span>
                 </div>
              </div>
              <button onClick={() => {
                const updated = dhikr.filter((item: Dhikr) => item.id !== d.id);
                onUpdateDhikr(updated);
                saveDhikr(updated);
                addLog(adminEmail, `Delete Dhikr: ${d.id}`);
              }} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"><Trash size={18}/></button>
            </div>
          )) : (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2"><BookOpen size={40} className="opacity-20"/><p>No Adhkar found</p></div>
          )}
        </div>
      )}

      {tab === 'logs' && (
        <div className="space-y-3">
          {getStoredLogs().length > 0 ? getStoredLogs().map(l => (
            <div key={l.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">{l.adminEmail}</span>
                <span className="text-slate-400">{l.timestamp}</span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{l.action}</p>
            </div>
          )) : (
             <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2"><History size={40} className="opacity-20"/><p>No logs available</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
