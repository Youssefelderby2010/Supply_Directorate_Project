import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  Warehouse, 
  Fuel, 
  Flame, 
  BarChart3, 
  LogOut,
  Bell,
  Search,
  AlertCircle,
  ChevronRight,
  Sun,
  Moon,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  Loader2,
  Plus,
  Edit2,
  FileText
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "زائر", "role": "غير مسجل"}');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'ok') {
          setStats(json.stats);
        } else {
          setError(json.message || 'خطأ في الاتصال بالخادم');
        }
      })
      .catch(err => {
        console.error(err);
        setError('تعذر الوصول إلى الخادم');
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      setIsSearching(true);
      const delayDebounceFn = setTimeout(() => {
        fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
          .then(res => res.json())
          .then(json => {
            setSearchResults(json);
            setIsSearching(false);
          })
          .catch(err => {
            console.error(err);
            setIsSearching(false);
          });
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm]);

  const categories = useMemo(() => [
    { id: 'suppliers', title: 'البدالين', icon: Users, color: 'emerald', count: stats?.suppliers ?? '...', path: '/suppliers', desc: 'إدارة البدالين التموينيين' },
    { id: 'associations', title: 'الجمعيات', icon: Building2, color: 'blue', count: stats?.associations ?? '...', path: '/associations', desc: 'الجمعيات الأهلية والمشروعات' },
    { id: 'warehouses', title: 'المخابز', icon: Warehouse, color: 'amber', count: stats?.warehouses ?? '...', path: '/warehouses', desc: 'المخابز والمطاحن والمخازن' },
    { id: 'petrol', title: 'محطات البترول', icon: Fuel, color: 'indigo', count: stats?.petrol ?? '...', path: '/petrol', desc: 'محطات الوقود والطاقة' },
    { id: 'gas', title: 'مستودعات الغاز', icon: Flame, color: 'rose', count: stats?.gas ?? '...', path: '/gas', desc: 'مستودعات البوتاجاز' },
    { id: 'reports', title: 'التقارير', icon: BarChart3, color: 'slate', count: 'إحصائيات', path: '/reports', desc: 'مركز البيانات والتقارير' },
  ].filter(cat => {
    if (user.role === 'admin') return true;
    return cat.id === 'suppliers' || cat.id === 'reports' || cat.id === 'associations' || cat.id === 'warehouses' || cat.id === 'petrol' || cat.id === 'gas';
  }), [stats, user.role]);

  const recentActivities = [
    { id: 1, type: 'update', title: 'تحديث بيانات مخبز', time: 'منذ 5 دقائق', user: 'أحمد علي' },
    { id: 2, type: 'add', title: 'إضافة بدال جديد', time: 'منذ ساعة', user: 'سارة حسن' },
    { id: 3, type: 'report', title: 'تصدير تقرير شهري', time: 'منذ ساعتين', user: 'محمد محمود' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const colorMap: Record<string, { bg: string, shadow: string, text: string }> = {
    emerald: { bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', text: 'text-emerald-500' },
    blue: { bg: 'bg-blue-500', shadow: 'shadow-blue-500/20', text: 'text-blue-500' },
    amber: { bg: 'bg-amber-500', shadow: 'shadow-amber-500/20', text: 'text-amber-500' },
    indigo: { bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', text: 'text-indigo-500' },
    rose: { bg: 'bg-rose-500', shadow: 'shadow-rose-500/20', text: 'text-rose-500' },
    slate: { bg: 'bg-slate-500', shadow: 'shadow-slate-500/20', text: 'text-slate-500' },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] font-sans relative overflow-hidden transition-colors duration-500" dir="rtl">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden"
            >
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
            </motion.div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">مديرية التموين</h1>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">التحول الرقمي</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-black text-slate-600 dark:text-slate-400">{user.role === 'admin' ? 'مسؤول النظام' : 'مشاهد'}</span>
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all font-black text-sm group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-700 dark:text-rose-400 shadow-sm"
          >
            <AlertCircle className="w-6 h-6" />
            <p className="font-black text-sm">{error}</p>
          </motion.div>
        )}

        {/* Hero Section */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                نظام الإدارة الموحد
              </div>
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
                مرحباً بك، <span className="text-emerald-600">{user.name.split(' ')[0]}</span> 👋
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-bold max-w-xl leading-relaxed">
                نظام التحول الرقمي المتكامل لمديرية التموين بمحافظة بني سويف. تابع كافة العمليات والتقارير من مكان واحد وبكل سهولة.
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 mb-6 relative z-10">
              <Zap className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 relative z-10">حالة النظام</h3>
            <p className="text-xs font-bold text-slate-400 mb-6 relative z-10">كافة الخدمات تعمل بكفاءة عالية</p>
            <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">سرعة الاستجابة</span>
                <span className="text-[10px] font-black text-emerald-500">99.9%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '99.9%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-emerald-500"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-20 max-w-4xl mx-auto z-20">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-emerald-500/15 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
            <div className="relative">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-7 h-7 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن أي شيء في النظام (بدال، جمعية، مخبز...)"
                className="w-full pr-16 pl-8 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all text-xl font-bold dark:text-white placeholder:text-slate-300"
              />
              <AnimatePresence>
                {isSearching && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-8 top-1/2 -translate-y-1/2"
                  >
                    <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Search Results */}
          <AnimatePresence>
            {searchTerm.trim().length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden max-h-[35rem] overflow-y-auto z-30"
              >
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">نتائج البحث المكتشفة</div>
                    {searchResults.map((result, idx) => (
                      <Link 
                        key={`${result._sheet}-${result.id}-${idx}`}
                        to={`/${result._sheet}`}
                        className="block p-6 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg uppercase tracking-wider">
                            {result._sheetTitle}
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>
                        <div className="font-black text-slate-800 dark:text-slate-100 text-lg group-hover:text-emerald-600 transition-colors">
                          {result.name || result.title || result.manager || result.ownerName || 'عنصر بدون اسم'}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 font-bold flex items-center gap-2">
                          <MapPin size={12} className="text-emerald-500" />
                          {result.district || result.center || result.area || 'غير محدد'}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : !isSearching ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-black text-lg">لم نجد أي نتائج لـ "{searchTerm}"</p>
                    <p className="text-xs text-slate-300 mt-2 font-bold">حاول استخدام كلمات بحث أخرى</p>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
          {/* Main Categories */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Link
                  to={cat.path}
                  className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-start gap-6 relative overflow-hidden h-full"
                >
                  {(() => {
                    const colors = colorMap[cat.color] || colorMap.slate;
                    return (
                      <>
                        <div className={`w-16 h-16 ${colors.bg} rounded-3xl flex items-center justify-center text-white shadow-xl ${colors.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          <cat.icon className="w-8 h-8" />
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{cat.title}</h3>
                          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs leading-relaxed">{cat.desc}</p>
                        </div>

                        <div className="mt-auto pt-6 w-full flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
                          <div className="flex items-center gap-2">
                             <span className="text-2xl font-black text-slate-800 dark:text-white">{cat.count}</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">عنصر</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                            <ChevronRight className="w-5 h-5 rotate-180" />
                          </div>
                        </div>

                        {/* Decorative background icon */}
                        <cat.icon className={`absolute -bottom-8 -left-8 w-32 h-32 ${colors.text} opacity-[0.03] group-hover:scale-125 transition-transform duration-700`} />
                      </>
                    );
                  })()}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  النشاط الأخير
                </h3>
                <Link to="/reports" className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">الكل</Link>
              </div>
              <div className="space-y-6">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 group cursor-default">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      activity.type === 'add' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                      activity.type === 'update' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                      'bg-purple-50 text-purple-600 dark:bg-purple-500/10'
                    }`}>
                      {activity.type === 'add' ? <Plus size={18} /> : 
                       activity.type === 'update' ? <Edit2 size={16} /> : <FileText size={18} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">{activity.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400">{activity.time}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-emerald-500">{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16"></div>
              <h3 className="font-black mb-6 relative z-10">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <button onClick={() => navigate('/reports')} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-center group">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">التقارير</span>
                </button>
                <button onClick={() => navigate('/suppliers')} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-center group">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">البدالين</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
              <Activity size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">نظام الإدارة الموحد v2.0</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مديرية التموين - محافظة بني سويف</span>
            </div>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">الدعم الفني</a>
            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">سياسة الاستخدام</a>
            <a href="#" className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">عن النظام</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Helper components no longer needed as we use lucide-react
const MapPin = ({ size, className }: { size: number, className?: string }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
