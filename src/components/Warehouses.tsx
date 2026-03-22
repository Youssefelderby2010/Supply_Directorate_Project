import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Search, Edit2, Trash2, Box, User, 
  Activity, AlertCircle, Loader2, Hash, Layers,
  Warehouse, TrendingUp, Calendar, ChevronRight, ChevronLeft, Database
} from 'lucide-react';
import AddModal from './AddModal';
import ConfirmModal from './ConfirmModal';

export default function Warehouses() {
  // --- States ---
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // نظام الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsData, setStatsData] = useState({ total: 0, active: 0, capacity: 0 });

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
    { name: 'name', label: 'اسم المخبز', placeholder: 'مثال: مخبز المنطقة الصناعية' },
    { name: 'capacity', label: 'السعة الإجمالية (طن)', type: 'number', placeholder: 'مثال: 5000' },
    { name: 'currentStock', label: 'المخزون الحالي (طن)', type: 'number', placeholder: 'مثال: 3200' },
    { name: 'manager', label: 'أمين المخبز', placeholder: 'مثال: سيد حسن' },
    { name: 'lastAudit', label: 'تاريخ آخر فحص', type: 'date' },
    { name: 'status', label: 'الحالة', type: 'select', options: ['نشط', 'تحت الصيانة', 'متوقف'] },
  ];

  // --- جلب البيانات ---
  const fetchData = useCallback((page = 1, search = searchTerm) => {
    setLoading(true);
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
    fetch(`/api/data/warehouses?page=${page}&limit=20${searchQuery}`)
      .then(res => res.json())
      .then(json => {
        if (json.items) {
          setData(json.items);
          setTotalPages(json.totalPages);
          setCurrentPage(json.currentPage);
          setStatsData({
            total: json.total || 0,
            active: json.items.filter((i: any) => i.status === 'نشط').length,
            capacity: json.items.reduce((acc: number, curr: any) => acc + (Number(curr.capacity) || 0), 0)
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

  // --- العمليات ---
  const handleSave = (itemData: any) => {
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/data/warehouses/${editingItem.id}` : '/api/data/warehouses';
    
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
    fetch(`/api/data/warehouses/${itemToDelete}`, { method: 'DELETE' })
      .then(() => {
        fetchData(currentPage);
        setIsConfirmOpen(false);
        setItemToDelete(null);
      });
  };

  return (
    <DashboardLayout 
      title="منظومة إدارة المخابز والمطاحن" 
      activeId="warehouses" 
      onAdd={isAdmin ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
    >
      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onSave={handleSave} 
        title={editingItem ? "تعديل بيانات المخبز" : "إضافة مخبز جديد"} 
        fields={fields} 
        initialData={editingItem} 
      />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete} 
        title="حذف مخبز" 
        message="هل أنت متأكد من حذف هذا المخبز نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
      />

      {/* الكروت الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-amber-200 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <Warehouse className="w-8 h-8 opacity-20" />
            <span className="bg-white/20 text-xs px-2 py-1 rounded-lg font-bold">الإجمالي</span>
          </div>
          <p className="text-sm font-bold opacity-80 text-white/90">إجمالي المخابز</p>
          <h3 className="text-4xl font-black mt-1">{statsData.total}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Activity className="w-8 h-8 text-amber-500 opacity-20" />
            <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">Active Status</span>
          </div>
          <p className="text-sm font-bold text-slate-400">المخابز النشطة</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{data.filter(i => i.status === 'نشط').length}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-black">إحصائيات السعة</span>
                <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إجمالي السعة (طن)</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{statsData.capacity.toLocaleString()}</h3>
            </div>
        </div>
      </div>

      {/* منطقة الجدول والبحث */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث باسم المخبز أو المدير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-amber-500/10 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            تحديث مباشر للبيانات
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-32 text-center flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
              <p className="font-bold text-sm tracking-widest uppercase">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">بيانات المخبز</th>
                  <th className="px-6 py-5">المخزون والسعة</th>
                  <th className="px-6 py-5">المسؤول</th>
                  <th className="px-6 py-5">آخر فحص</th>
                  <th className="px-6 py-5">الحالة</th>
                  <th className="px-6 py-5 text-center">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.length > 0 ? data.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                          <Warehouse className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 dark:text-slate-200 text-sm mb-0.5">{item.name}</div>
                          <div className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">كود: {item.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 w-48">
                        <div className="flex justify-between text-[10px] font-black text-slate-500">
                          <span>{item.currentStock} طن</span>
                          <span>{item.capacity} طن</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, (Number(item.currentStock) / Number(item.capacity)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-500" />
                          <div className="font-black text-slate-800 dark:text-white text-sm">{item.manager}</div>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-xs">{item.lastAudit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`
                        px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 w-fit
                        ${item.status === 'نشط' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                          item.status === 'تحت الصيانة' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'نشط' ? 'bg-emerald-500' : item.status === 'تحت الصيانة' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                                className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-200 rounded-xl transition-all shadow-sm"
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
                    <td colSpan={6} className="py-20 text-center text-slate-300 font-bold italic">لم يتم العثور على أي بيانات</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* فوتر الجدول (Pagination) */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center">
            <p className="text-xs font-bold text-slate-400">
              إجمالي النتائج: <span className="text-slate-800 dark:text-white">{data.length}</span> مخبز
            </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
