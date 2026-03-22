import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Search, Edit2, Trash2, Fuel, MapPin, 
  BarChart3, Loader2, Database, Activity, AlertCircle,
  ChevronRight, ChevronLeft, Plus
} from 'lucide-react';
import AddModal from './AddModal';
import ConfirmModal from './ConfirmModal';

export default function PetrolStations() {
  // --- States ---
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // نظام الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsData, setStatsData] = useState({ total: 0, active: 0, maintenance: 0 });

  // الموديلات (Modals)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // --- التحقق من الصلاحيات ---
  const user = JSON.parse(localStorage.getItem('user') || '{"role": "admin"}');
  const isAdmin = user.role === 'admin';

  // --- تعريف الحقول (Fields) ---
  const fields = [
    { 
      name: 'name', 
      label: 'اسم المحطة', 
      type: 'text',
      placeholder: 'مثال: محطة مصر للبترول' 
    },
    { 
      name: 'company', 
      label: 'الشركة التابعة', 
      type: 'select',
      options: ['مصر للبترول', 'التعاون', 'وطنية', 'توتال', 'موبيل', 'أخرى'],
      placeholder: 'اختر الشركة' 
    },
    { 
      name: 'district', 
      label: 'المركز', 
      type: 'select',
      options: ['بني سويف', 'الواسطى', 'ناصر', 'ببا', 'الفشن', 'سمسطا', 'اهناسيا'],
      placeholder: 'اختر المركز التابع له' 
    },
    { 
      name: 'fuelType', 
      label: 'أنواع الوقود المتوفرة', 
      type: 'text', 
      placeholder: 'مثال: 80، 92، سولار' 
    },
    { 
      name: 'dailySales', 
      label: 'متوسط المبيعات اليومية (لتر)', 
      type: 'number', 
      placeholder: 'أدخل الكمية بالأرقام' 
    },
    { 
      name: 'location', 
      label: 'العنوان بالتفصيل', 
      type: 'text', 
      placeholder: 'الشارع / المعلم المميز' 
    },
    { 
      name: 'status', 
      label: 'الحالة التشغيلية', 
      type: 'select', 
      options: ['مفتوح', 'مغلق', 'صيانة'],
      placeholder: 'اختر الحالة الحالية'
    },
  ];

  // --- جلب البيانات ---
  const fetchData = useCallback((page = 1, search = searchTerm) => {
    setLoading(true);
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
    fetch(`/api/data/petrol?page=${page}&limit=20${searchQuery}`)
      .then(res => res.json())
      .then(json => {
        if (json.items) {
          setData(json.items);
          setTotalPages(json.totalPages);
          setCurrentPage(json.currentPage);
          setStatsData({
            total: json.total || 0,
            active: json.items.filter((i: any) => i.status === 'مفتوح').length,
            maintenance: json.items.filter((i: any) => i.status === 'صيانة').length
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- العمليات (Save / Delete) ---
  const handleSave = (itemData: any) => {
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/data/petrol/${editingItem.id}` : '/api/data/petrol';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    }).then(() => {
      fetchData(currentPage);
      setIsModalOpen(false);
      setEditingItem(null);
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    fetch(`/api/data/petrol/${itemToDelete}`, { method: 'DELETE' })
      .then(() => {
        fetchData(currentPage);
        setIsConfirmOpen(false);
        setItemToDelete(null);
      });
  };

  return (
    <DashboardLayout 
      title="منظومة إدارة محطات الوقود" 
      activeId="petrol" 
      onAdd={isAdmin ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
    >
      {/* الموديلات */}
      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onSave={handleSave} 
        title={editingItem ? "تعديل بيانات المحطة" : "إضافة محطة وقود جديدة"} 
        fields={fields} 
        initialData={editingItem} 
      />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete} 
        title="حذف محطة" 
        message="هل أنت متأكد من حذف هذه المحطة نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
      />

      {/* الكروت الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-emerald-200 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <Database className="w-8 h-8 opacity-20" />
            <span className="bg-white/20 text-xs px-2 py-1 rounded-lg font-bold">الإجمالي</span>
          </div>
          <p className="text-sm font-bold opacity-80 text-white/90">إجمالي المحطات المسجلة</p>
          <h3 className="text-4xl font-black mt-1">{statsData.total}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Activity className="w-8 h-8 text-emerald-500 opacity-20" />
            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">Active Now</span>
          </div>
          <p className="text-sm font-bold text-slate-400">المحطات النشطة</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{data.filter(i => i.status === 'مفتوح').length}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-black">إحصائيات المبيعات</span>
                <BarChart3 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إجمالي المبيعات اليومية (لتر)</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                {data.reduce((acc, curr) => acc + (Number(curr.dailySales) || 0), 0).toLocaleString()}
              </h3>
            </div>
        </div>
      </div>

      {/* منطقة الجدول والبحث */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* البار العلوي للبحث */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث باسم المحطة أو المركز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            تحديث مباشر للبيانات
          </div>
        </div>
        
        {/* الجدول */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-32 text-center flex flex-col items-center gap-4 text-slate-400">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <Fuel className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" />
              </div>
              <p className="font-bold text-sm tracking-widest uppercase">جاري مزامنة قاعدة البيانات...</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">معلومات المحطة</th>
                  <th className="px-6 py-5">الموقع الجغرافي</th>
                  <th className="px-6 py-5">الخدمات المتوفرة</th>
                  <th className="px-6 py-5">المبيعات اليومية</th>
                  <th className="px-6 py-5">الحالة</th>
                  <th className="px-6 py-5 text-center">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.length > 0 ? data.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                          <Fuel className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 dark:text-slate-200 text-sm mb-0.5">{item.name}</div>
                          <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">{item.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-xs">{item.district}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1 mr-5">{item.location}</div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-wrap gap-1">
                          {item.fuelType?.split('،').map((type: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg">
                              {type}
                            </span>
                          ))}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="font-black text-slate-800 dark:text-white text-sm">{item.dailySales?.toLocaleString()}</div>
                          <span className="text-[10px] font-bold text-slate-400">لتر/يوم</span>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`
                        px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 w-fit
                        ${item.status === 'مفتوح' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                          item.status === 'صيانة' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'مفتوح' ? 'bg-emerald-500' : item.status === 'صيانة' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 rounded-xl transition-all shadow-sm"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => { setItemToDelete(item.id); setIsConfirmOpen(true); }}
                                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-xl transition-all shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <Search className="w-12 h-12 opacity-20" />
                        <p className="font-bold italic text-lg">لم يتم العثور على أي بيانات مطابقة</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* فوتر الجدول (Pagination) */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center">
            <p className="text-xs font-bold text-slate-400">
              إجمالي النتائج: <span className="text-slate-800 dark:text-white">{data.length}</span> محطة
            </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
