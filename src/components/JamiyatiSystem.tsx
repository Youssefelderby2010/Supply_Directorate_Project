import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardLayout from './DashboardLayout';
import { 
  Search, Edit2, Trash2, Store, MapPin, 
  Loader2, Database, Activity, AlertTriangle,
  ChevronRight, ChevronLeft, Download, Users, Hash, Layers
} from 'lucide-react';
import AddModal from './AddModal';
import ConfirmModal from './ConfirmModal';

// --- أنواع البيانات ---
interface Beneficiary {
  id: string;
  m: number; // المسلسل في الشيت
  phase: string;
  ownerName: string;
  status: 'نشط' | 'متوقف';
  reason?: string;
  district: string;
  village: string;
  address: string;
  nationalId: string;
  phone: string;
  merchantCode: string;
  fundingType: 'قرض' | 'ذاتي';
  insuranceAmount: number;
}

export default function JamiyatiSystem() {
  const [data, setData] = useState<Beneficiary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('الكل');
  const [selectedVillage, setSelectedVillage] = useState('الكل');
  const [loading, setLoading] = useState(true);
  
  // نظام الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // الموديلات
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // --- التحقق من الصلاحيات ---
  const user = JSON.parse(localStorage.getItem('user') || '{"role": "admin"}');
  const isAdmin = user.role === 'admin';

  // --- الحقول بناءً على أعمدة الشيت الحقيقية ---
  const fields = [
    { name: 'ownerName', label: 'إسم صاحب المنفذ', type: 'text', placeholder: 'كما هو موضح في الشيت' },
    { name: 'phase', label: 'المرحلة', type: 'select', options: ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'] },
    { name: 'district', label: 'المركز', type: 'select', options: ['بندر بني سويف', 'مركز بني سويف', 'الواسطى', 'ناصر', 'اهناسيا', 'ببا', 'سمسطا', 'الفشن'] },
    { name: 'village', label: 'القرية', type: 'text' },
    { name: 'merchantCode', label: 'كود التاجر', type: 'text' },
    { name: 'fundingType', label: 'نوع التمويل', type: 'select', options: ['قرض', 'ذاتي'] },
    { name: 'insuranceAmount', label: 'مبلغ التأمين', type: 'number' },
    { name: 'status', label: 'الحالة', type: 'select', options: ['نشط', 'متوقف'] },
    { name: 'reason', label: 'السبب (في حال التوقف)', type: 'text' },
  ];

  // --- جلب البيانات ---
  const fetchData = useCallback((page = 1, search = searchTerm, district = selectedDistrict, village = selectedVillage) => {
    setLoading(true);
    const districtQuery = district !== 'الكل' ? `&district=${encodeURIComponent(district)}` : '';
    const villageQuery = village !== 'الكل' ? `&village=${encodeURIComponent(village)}` : '';
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
    
    fetch(`/api/data/jamiyati?page=${page}&limit=20${districtQuery}${villageQuery}${searchQuery}`)
      .then(res => res.json())
      .then(json => {
        if (json.items) {
          setData(json.items);
          setTotalPages(json.totalPages);
          setCurrentPage(json.currentPage);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [searchTerm, selectedDistrict, selectedVillage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDistrict, selectedVillage]);

  // --- استخراج القرى الفريدة بناءً على المركز المختار ---
  const availableVillages = useMemo(() => {
    // في الواقع العملي، يفضل جلب القرى من الخادم، ولكن هنا سنقوم باستخراجها من البيانات الحالية
    // أو يمكننا إضافة قائمة ثابتة إذا كانت معروفة.
    // سنستخدم هنا حقلاً نصياً للبحث عن القرية بدلاً من القائمة المنسدلة إذا كانت القرى كثيرة وغير معروفة مسبقاً.
    return [];
  }, [data]);

  // --- الإحصائيات (البيان العددي) ---
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(i => i.status === 'نشط').length,
    inactive: data.filter(i => i.status === 'متوقف').length,
  }), [data]);

  // --- العمليات ---
  const handleSave = (itemData: any) => {
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/data/jamiyati/${editingItem.id}` : '/api/data/jamiyati';
    
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
    fetch(`/api/data/jamiyati/${itemToDelete}`, { method: 'DELETE' })
      .then(() => {
        fetchData(currentPage);
        setIsConfirmOpen(false);
        setItemToDelete(null);
      });
  };

  return (
    <DashboardLayout 
      title="منظومة مشروع جمعيتي - محافظة بني سويف" 
      activeId="jamiyati"
      onAdd={isAdmin ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
    >
      
      {/* كروت البيان العددي */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-blue-200 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start mb-4">
            <Users className="w-8 h-8 opacity-20" />
            <span className="bg-white/20 text-xs px-2 py-1 rounded-lg font-bold">الإجمالي</span>
          </div>
          <p className="text-sm font-bold opacity-80 text-white/90">إجمالي المنافذ</p>
          <h3 className="text-4xl font-black mt-1">{stats.total}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <Activity className="w-8 h-8 text-emerald-500 opacity-20" />
            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">Active</span>
          </div>
          <p className="text-sm font-bold text-slate-400">منافذ نشطة</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{stats.active}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-500 opacity-20" />
            <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/10 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">Stopped</span>
          </div>
          <p className="text-sm font-bold text-slate-400">منافذ متوقفة</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{stats.inactive}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-black">إحصائيات التأمين</span>
                <Layers className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إجمالي مبالغ التأمين</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                {data.reduce((acc, curr) => acc + (Number(curr.insuranceAmount) || 0), 0).toLocaleString()} ج.م
              </h3>
            </div>
        </div>
      </div>

      {/* أدوات التحكم والبحث */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-t-[2.5rem] border-x border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو كود التاجر..." 
            className="w-full pr-10 pl-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالقرية..." 
              className="pr-10 pl-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white w-40"
              onChange={(e) => setSelectedVillage(e.target.value || 'الكل')}
            />
          </div>
          <select 
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold px-6 py-4 outline-none text-slate-600 dark:text-slate-300"
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="الكل">جميع المراكز</option>
            {['بندر بني سويف', 'مركز بني سويف', 'الواسطى', 'ناصر', 'اهناسيا', 'ببا', 'سمسطا', 'الفشن'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button 
            onClick={() => window.open('/api/download?type=jamiyati', '_blank')}
            className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* جدول البيانات الرئيسي */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-b-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">م</th>
                <th className="px-6 py-5">المستفيد / المرحلة</th>
                <th className="px-6 py-5">الموقع</th>
                <th className="px-6 py-5">كود التاجر</th>
                <th className="px-6 py-5">التأمين / التمويل</th>
                <th className="px-6 py-5">الحالة</th>
                <th className="px-6 py-5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold">لا توجد نتائج للبحث</td></tr>
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors group">
                  <td className="px-8 py-5 text-xs font-mono text-slate-400">{item.m}</td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-800 dark:text-slate-200 text-sm mb-0.5">{item.ownerName}</div>
                    <div className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md inline-block">{item.phase}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-xs">{item.district}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 mr-5">{item.village}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-slate-300" />
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{item.merchantCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-black text-slate-800 dark:text-white mb-1">{Number(item.insuranceAmount).toLocaleString()} ج.م</div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-bold">{item.fundingType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`
                      px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 w-fit
                      ${item.status === 'نشط' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'نشط' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {item.status}
                    </span>
                    {item.reason && <div className="text-[9px] text-rose-400 mt-1 mr-1 font-bold">سبب: {item.reason}</div>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => { setEditingItem(item); setIsModalOpen(true); }} 
                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-200 rounded-xl transition-all shadow-sm"
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
              ))}
            </tbody>
          </table>
        </div>

        {/* فوتر الجدول */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-center items-center">
          <p className="text-xs font-bold text-slate-400">
            إجمالي النتائج المعروضة: <span className="text-slate-800 dark:text-white">{data.length}</span> منفذ
          </p>
        </div>
      </div>

      <AddModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        onSave={handleSave} 
        title={editingItem ? "تعديل بيانات المنفذ" : "إضافة منفذ جديد"} 
        fields={fields} 
        initialData={editingItem} 
      />

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete} 
        title="حذف منفذ" 
        message="هل أنت متأكد من حذف هذا المنفذ نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
      />

    </DashboardLayout>
  );
}
