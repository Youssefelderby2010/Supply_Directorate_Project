export const MOCK_SUPPLIERS = [
  { id: '1', name: 'شركة النيل للتوريدات', contact: 'أحمد محمد', phone: '01012345678', location: 'القاهرة', balance: '15,000 ج.م', dateReceived: '2024-03-15' },
  { id: '2', name: 'مؤسسة الأمل للتجارة', contact: 'سيد علي', phone: '01198765432', location: 'الجيزة', balance: '8,500 ج.م', dateReceived: '2024-03-18' },
];

export const MOCK_ASSOCIATIONS = [
  { id: '1', name: 'جمعية الوفاء الخيرية', type: 'زراعية', members: 150, location: 'المنوفية', status: 'نشط' },
  { id: '2', name: 'جمعية تنمية المجتمع', type: 'تنموية', members: 300, location: 'القليوبية', status: 'نشط' },
];

export const MOCK_WAREHOUSES = [
  { id: '1', name: 'مخزن المنطقة الصناعية', capacity: '5000 طن', currentStock: '3200 طن', manager: 'سيد حسن', lastAudit: '2024-03-10' },
  { id: '2', name: 'مخزن حلوان المركزي', capacity: '2000 طن', currentStock: '1800 طن', manager: 'محمود كمال', lastAudit: '2024-03-12' },
];

export const MOCK_PETROL = [
  { id: '1', name: 'محطة النيل - المعادي', fuelType: 'بنزين 92/95', dailySales: '4500 لتر', location: 'المعادي', status: 'مفتوح' },
  { id: '2', name: 'محطة مصر - المهندسين', fuelType: 'سولار/بنزين', dailySales: '6000 لتر', location: 'المهندسين', status: 'مفتوح' },
];

export const MOCK_GAS = [
  { id: '1', name: 'مستودع حلوان الرئيسي', cylinders: '1200 أسطوانة', type: 'منزلي/تجاري', manager: 'أحمد كمال', status: 'متاح' },
  { id: '2', name: 'مستودع مدينة نصر', cylinders: '800 أسطوانة', type: 'منزلي', manager: 'خالد يوسف', status: 'متاح' },
];

export const MOCK_STATS = {
  suppliers: MOCK_SUPPLIERS.length,
  associations: MOCK_ASSOCIATIONS.length,
  warehouses: MOCK_WAREHOUSES.length,
  petrol: MOCK_PETROL.length,
  gas: MOCK_GAS.length
};
