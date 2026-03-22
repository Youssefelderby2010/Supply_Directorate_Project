import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, Building2, Warehouse, Fuel, Flame, BarChart3, 
  LogOut, ChevronLeft, Plus, Moon, Sun, Bell, 
  Activity, Menu, X, Database, Search, Store,
  LayoutDashboard, Settings, HelpCircle, ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activeId?: string;
  onAdd?: () => void;
}

export default function DashboardLayout({ children, title, activeId, onAdd }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // إدارة المستخدم
  const user = useMemo(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { name: "مستخدم زائر", role: "viewer" };
  }, []);

  const isAdmin = user.role === 'admin';

  // القائمة الجانبية المحدثة بتصنيفات
  const menuGroups = [
    {
      label: "الرقابة والعمليات",
      items: [
        { id: 'suppliers', title: 'البدالين التموينيين', icon: Users, path: '/suppliers' },
        { id: 'associations', title: 'الجمعيات الأهلية', icon: Building2, path: '/associations' },
        { id: 'jamiyati', title: 'مشروع جمعيتي', icon: Store, path: '/jamiyati' },
        { id: 'warehouses', title: 'المخابز والمطاحن', icon: Warehouse, path: '/warehouses' },
      ]
    },
    {
      label: "الطاقة والوقود",
      items: [
        { id: 'petrol', title: 'محطات الوقود', icon: Fuel, path: '/petrol' },
        { id: 'gas', title: 'مستودعات الغاز', icon: Flame, path: '/gas' },
      ]
    },
    {
      label: "التحليلات",
      items: [
        { id: 'reports', title: 'مركز التقارير', icon: BarChart3, path: '/reports' },
      ]
    }
  ];

  // إدارة الثيم (تم الحفاظ عليه بناءً على طلبك السابق ولكن بشكل أنعم)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setDbStatus(data.dbStatus === 'connected' ? 'connected' : 'error');
        setDbError(data.dbError || null);
      } catch (e) {
        setDbStatus('error');
        setDbError('تعذر الاتصال بالخادم');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans flex flex-col" dir="rtl">
      
      {/* 1. Sidebar الموبايل (Overlay) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Header المطور (Glassmorphism) */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/home" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-emerald-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform overflow-hidden">
                <img 
                  src="myp.jpeg" 
                  alt="شعار مديرية التموين" 
                  className="w-full h-full object-contain p-1"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <Activity className="text-white w-7 h-7 fallback-icon hidden" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tight leading-none text-slate-800 dark:text-white">مديرية التموين</h1>
                <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-[0.2em]">التحول الرقمي</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
             {/* مؤشر حالة قاعدة البيانات */}
             <div 
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-help group/status relative ${
                dbStatus === 'connected' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : dbStatus === 'loading'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
              title={dbError || ''}
            >
              <div className={`w-2 h-2 rounded-full ${
                dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                dbStatus === 'loading' ? 'bg-amber-500 animate-bounce' : 'bg-rose-500'
              }`}></div>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {dbStatus === 'connected' ? 'قاعدة البيانات متصلة' : 
                 dbStatus === 'loading' ? 'جاري الاتصال...' : 'خطأ في الربط'}
              </span>
              
              {dbError && dbStatus === 'error' && (
                <div className="absolute top-full mt-2 left-0 w-64 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 hidden group-hover/status:block animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold break-words">{dbError}</p>
                </div>
              )}
            </div>

             {/* زر الإشعارات */}
             <button className="relative p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 left-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
             </button>

             <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

             {/* بروفايل المستخدم */}
             <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 pr-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                <div className="hidden lg:flex flex-col items-end leading-tight">
                  <span className="text-xs font-black text-slate-800 dark:text-white">{user.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{user.role}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
                   {user.name[0]}
                </div>
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 3. Sidebar الجانبي (Desktop & Mobile Slide) */}
        <aside className={`
          fixed lg:sticky top-20 bottom-0 z-[70] lg:z-30
          w-80 bg-white dark:bg-slate-900 lg:bg-transparent
          border-l border-slate-200/60 dark:border-slate-800/60
          transition-transform duration-500 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          flex flex-col p-6 overflow-y-auto custom-scrollbar
        `}>
          
          <div className="lg:hidden flex items-center justify-between mb-8 border-b pb-4 border-slate-100 dark:border-slate-800">
             <span className="font-black text-emerald-600">قائمة النظام</span>
             <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl"><X /></button>
          </div>

          <div className="space-y-8 flex-1">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 px-4 tracking-[0.2em]">{group.label}</p>
                <div className="space-y-1">
                  {group.items.filter(item => isAdmin || item.id === 'suppliers' || item.id === 'reports').map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
                        activeId === item.id 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-500/5 hover:text-emerald-600'
                      }`}
                    >
                      <div className="flex items-center gap-4 font-black text-sm">
                        <item.icon className={`w-5 h-5 ${activeId === item.id ? 'text-white' : 'group-hover:text-emerald-500'}`} />
                        <span>{item.title}</span>
                      </div>
                      <ChevronLeft className={`w-4 h-4 transition-transform ${activeId === item.id ? 'opacity-100 -translate-x-1' : 'opacity-0'}`} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer السايدبار */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => { localStorage.removeItem('user'); navigate('/'); }}
              className="w-full flex items-center gap-3 px-6 py-4 bg-rose-50 dark:bg-rose-500/5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all duration-300 font-black text-sm group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* 4. منطقة المحتوى (Main Content) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* خلفية جمالية خفيفة تتحرك مع السكرول */}
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>

          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-12 relative z-10">
            
            {/* Page Header & Breadcrumbs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <Link to="/home" className="hover:text-emerald-600 transition-colors">الرئيسية</Link>
                  <ChevronLeft className="w-3 h-3" />
                  <span className="text-emerald-600 underline decoration-2 underline-offset-4">{title}</span>
                </nav>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  {title}
                </h2>
              </div>
              
              {onAdd && isAdmin && (
                <button 
                  onClick={onAdd}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] shadow-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all active:scale-95 font-black group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  <span>إضافة {title.replace(/ين$/, '')} جديد</span>
                </button>
              )}
            </div>

            {/* Content Slot */}
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
