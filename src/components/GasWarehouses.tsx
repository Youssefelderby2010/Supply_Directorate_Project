import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Search, Edit2, Trash2, Flame, MapPin, User, 
  Loader2, Factory, TrendingDown, Package,
  ChevronRight, ChevronLeft, LayoutGrid, Info
} from 'lucide-react';
import AddModal from './AddModal';
import ConfirmModal from './ConfirmModal';

export default function GasWarehouses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  // جلب البيانات من السيرفر
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data/gas?page=${page}&limit=10&search=${searchTerm}`);
      const json = await response.json();
      if (json.items) {
        setData(json.items);
        setTotalPages(json.totalPages || 1);
        setCurrentPage(json.currentPage || 1);
      } else if (Array.isArray(json)) {
        // Fallback if server returns array
        setData(json);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchData]);

  // دالة الحفظ (إضافة أو تعديل)
  const handleSave = async (formData: any) => {
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/data/gas/${editingItem._id}` : '/api/data/gas';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if(response.ok) {
        fetchData(currentPage);
        setIsModalOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error("خطأ أثناء الحفظ");
    }
  };

  // دالة الحذف
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`/api/data/gas/${itemToDelete}`, { method: 'DELETE' });
      fetchData(currentPage);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("خطأ أثناء الحذف");
    }
  };

  // تعريف الحقول للمودال (AddModal)
  const fields = [
    { name: 'name', label: 'اسم المستودع', placeholder: 'مثال: مستودع النيل' },
    { name: 'area', label: 'المنطقة السكنية', placeholder: 'اسم الحي أو المنطقة' },
    { name: 'manager', label: 'مدير المستودع', placeholder: 'الاسم الكامل للمسؤول' },
    { name: 'domesticCount', label: 'رصيد الاسطوانات المنزلية', type: 'number' },
    { name: 'commercialCount', label: 'رصيد الاسطوانات التجارية', type: 'number' },
    { 
      name: 'status', 
      label: 'حالة المستودع', 
      type: 'select', 
      options: [
        { label: 'نشط (متوفر)', value: 'نشط' },
        { label: 'مزدحم جداً', value: 'مزدحم' },
        { label: 'تحت الصيانة', value: 'تحت الصيانة' }
      ] 
    },
  ];

  return (
    <DashboardLayout 
      title="منظومة مستودعات البوتاجاز" 
      activeId="gas" 
      onAdd={isAdmin ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
    >
      {/* نوافذ التأكيد والإضافة */}
      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onSave={handleSave} 
        title={editingItem ? "تعديل بيانات المستودع" : "إضافة مستودع جديد"} 
        fields={fields} 
        initialData={editingItem} 
      />
      
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="حذف مستودع" 
        message="هل أنت متأكد من حذف هذا المستودع نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
      />

      {/* شريط البحث */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث باسم المستودع أو المنطقة..." 
            className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
          تحديث مباشر للبيانات
        </div>
      </div>

      {/* عرض البيانات كبطاقات (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="animate-spin mx-auto w-10 h-10 text-orange-500 mb-4" />
            <p className="text-slate-400 font-medium">جاري تحميل البيانات...</p>
          </div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <div key={item._id} className="group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    item.status === 'نشط' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 
                    item.status === 'مزدحم' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>
                    <Flame className={item.status === 'نشط' ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                      <MapPin size={12} className="text-orange-500" />
                      {item.area}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                      className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button 
                      onClick={() => { setItemToDelete(item._id); setIsConfirmOpen(true); }} 
                      className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                )}
              </div>

              {/* رصيد الاسطوانات */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">اسطوانات منزلية</p>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-orange-500" />
                    <span className="text-xl font-black text-slate-700 dark:text-slate-200">{item.domesticCount || 0}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">اسطوانات تجارية</p>
                  <div className="flex items-center gap-2">
                    <Factory size={16} className="text-blue-500" />
                    <span className="text-xl font-black text-slate-700 dark:text-slate-200">{item.commercialCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                    <User size={14} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.manager || 'بدون مدير'}</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                  item.status === 'نشط' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10' : 
                  item.status === 'مزدحم' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                }`}>
                  {item.status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
            <Info className="mx-auto w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold">لا توجد مستودعات مطابقة للبحث</p>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
