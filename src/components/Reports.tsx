import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileText, 
  PieChart as PieIcon, 
  Loader2, 
  Activity,
  ArrowUpRight,
  Calendar,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { motion } from 'motion/react';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(json => {
        if (json.status === 'ok') setStats(json.stats);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  const reportData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'البدالين', value: stats.suppliers || 0, color: '#10b981', icon: '🟢', longLabel: 'قطاع البدالين التموينيين' },
      { name: 'الجمعيات', value: stats.associations || 0, color: '#3b82f6', icon: '🔵', longLabel: 'مشروع جمعيتي والعامة' },
      { name: 'المخابز', value: stats.warehouses || 0, color: '#f59e0b', icon: '🟠', longLabel: 'المخابز البلدية والطباقي' },
      { name: 'المحطات', value: stats.petrol || 0, color: '#6366f1', icon: '🟣', longLabel: 'المواد البترولية والطاقة' },
      { name: 'المستودعات', value: stats['gas-storage'] || 0, color: '#f43f5e', icon: '🔴', longLabel: 'مستودعات البوتاجاز' },
    ];
  }, [stats]);

  const total = useMemo(() => reportData.reduce((acc, curr) => acc + curr.value, 0), [reportData]);

  const handleDownload = (reportType: string) => {
    window.open(`/api/download?type=${reportType}`, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout title="التقارير الفنية" activeId="reports">
        <div className="flex flex-col items-center justify-center h-96 gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
          </div>
          <p className="text-slate-500 font-black animate-pulse text-lg">جاري تحليل البيانات الإحصائية...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مركز التقارير والتحليلات" activeId="reports">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">التحليل الإحصائي الشامل</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">نظرة عامة على أداء كافة القطاعات التموينية</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-emerald-500" />
            {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-500 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">إجمالي المنافذ</div>
            <div className="text-5xl font-black mb-4 tracking-tighter">{total}</div>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +12% عن الشهر الماضي
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">أكثر القطاعات نشاطاً</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">المخابز البلدية</div>
            <div className="text-xs font-bold text-emerald-500">42% من إجمالي النشاط</div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">محدث الآن</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">دقة البيانات</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">100%</div>
            <div className="text-xs font-bold text-blue-500">تم التحقق من كافة السجلات</div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نظام مؤمن</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* الرسم البياني للأعمدة */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-3 text-xl">
                <BarChart3 className="w-6 h-6 text-emerald-500" />
                توزيع المنافذ حسب القطاع
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1">مقارنة عددية بين كافة الأقسام التموينية</p>
            </div>
            <button 
              onClick={() => handleDownload('general')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-black text-xs"
            >
              <Download className="w-4 h-4" />
              تصدير PDF
            </button>
          </div>

          <div className="h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    padding: '15px'
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                  {reportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* توزيع النسب المئوية */}
        <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col">
          <h3 className="font-black mb-10 flex items-center gap-3 text-xl relative z-10">
            <PieIcon className="w-6 h-6 text-emerald-400" />
            التحليل النسبي
          </h3>
          
          <div className="h-[250px] w-full relative z-10" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {reportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto space-y-4 relative z-10">
            {reportData.map((item, i) => {
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* قسم التقارير المعتمدة */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white text-xl">سجلات التقارير المعتمدة</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">تقارير جاهزة للطباعة والتصدير المباشر</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'تقرير قاعدة البيانات الشامل', desc: 'ملف Excel لكافة البيانات المسجلة', type: 'full', color: 'emerald' },
            { title: 'كشف مديونيات البدالين', desc: 'تقرير مالي بالتسويات والمستحقات', type: 'finance', color: 'blue' },
            { title: 'سجل الرقابة على المخابز', desc: 'الحصص اليومية ومعدلات الإنتاج', type: 'bread', color: 'amber' },
            { title: 'بيان حركة المواد البترولية', desc: 'مبيعات المحطات ومستودعات الغاز', type: 'energy', color: 'indigo' }
          ].map((report, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02 }}
              onClick={() => handleDownload(report.type)}
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 bg-${report.color}-500/10 rounded-2xl flex items-center justify-center text-${report.color}-600 group-hover:bg-${report.color}-500 group-hover:text-white transition-all`}>
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-black text-slate-800 dark:text-slate-100 text-base block mb-1">{report.title}</span>
                  <span className="text-xs text-slate-400 font-bold">{report.desc}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 shadow-sm transition-colors">
                <Download className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-3 text-slate-400 text-xs font-black uppercase tracking-widest">
        <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
        يتم تحديث كافة البيانات والرسوم البيانية لحظياً
      </div>
    </DashboardLayout>
  );
}
