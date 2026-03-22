import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield, ChevronRight, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

type ViewState = 'choice' | 'login' | 'register';

export default function Login() {
  const [view, setView] = useState<ViewState>('choice');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'viewer' | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'viewer'>('viewer');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // تأكد من مسح الأخطاء عند تغيير الواجهة
  useEffect(() => {
    setError(null);
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // استخدام مسار كامل إذا لم يكن الـ Proxy يعمل، أو التأكد من الـ Proxy في package.json
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim() 
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        // تخزين بيانات المستخدم كاملة
        localStorage.setItem('user', JSON.stringify(data.user));
        // الانتقال لصفحة الهوم
        navigate('/home');
      } else {
        // عرض رسالة الخطأ القادمة من السيرفر
        setError(data.message || 'خطأ في بيانات الدخول، حاول مرة أخرى');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError('فشل الاتصال بالسيرفر. تأكد من تشغيل الباك إند');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password.trim(), 
          name: name.trim(), 
          role: regRole 
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        alert('تم تسجيل الحساب بنجاح! يمكنك الآن تسجيل الدخول');
        setView('login');
        resetForm();
      } else {
        setError(data.message || 'خطأ أثناء التسجيل');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم لإتمام التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden" dir="rtl">
      {/* الخلفية */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900 via-slate-950 to-black"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden">
          
          {/* الهيدر */}
          <div className="bg-slate-900 p-8 text-center relative border-b border-emerald-500/20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white mb-4 p-2 shadow-xl ring-4 ring-emerald-500/10 overflow-hidden">
              <img 
                src="myp.jpeg" 
                alt="شعار مديرية التموين" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/ar/thumb/2/21/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%88%D8%B2%D8%A7%D8%B1%D9%81_%D8%A7%D9%84%D8%AA%D9%85%D9%88%D9%8A%D9%86_%D9%88%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D8%A9_%D8%A7%D9%84%D8%AF%D8%AE%D9%84%D9%8I%D8%A9_%D9%85%D8%B5%D8%B1.png/600px-%D8%B4%D8%B9%D8%A7%D8%B1_%D9%88%D8%B2%D8%A7%D8%B1%D9%81_%D8%A7%D9%84%D8%AA%D9%85%D9%88%D9%8A%D9%86_%D9%88%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D8%A9_%D8%A7%D9%84%D8%AF%D8%AE%D9%84%D9%8I%D8%A9_%D9%85%D8%B5%D8%B1.png";
                }}
              />
            </div>
            <h1 className="text-2xl font-black text-white">منظومة مديرية التموين</h1>
            <p className="text-emerald-400 font-bold text-xs mt-1 uppercase tracking-widest">Digital Supply Management</p>
          </div>

          <div className="p-8">
            {/* عرض رسالة الخطأ بشكل بارز */}
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-2xl flex items-center gap-3 text-rose-500 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {view === 'choice' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                  onClick={() => { setSelectedRole('admin'); setView('login'); }}
                  className="w-full flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] hover:bg-emerald-600 transition-all group"
                >
                  <div className="flex items-center gap-4 text-right">
                    <Shield className="w-8 h-8 text-emerald-400 group-hover:text-white" />
                    <div>
                      <div className="font-black text-lg">دخول كمسؤول</div>
                      <div className="text-xs opacity-60">صلاحيات إدارة وجرد البيانات</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                <button
                  onClick={() => { setSelectedRole('viewer'); setView('login'); }}
                  className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-emerald-500 rounded-[2rem] transition-all group"
                >
                  <div className="flex items-center gap-4 text-right">
                    <User className="w-8 h-8 text-slate-400 group-hover:text-emerald-500" />
                    <div>
                      <div className="font-black text-lg text-slate-900 dark:text-white">دخول كمشاهد</div>
                      <div className="text-xs text-slate-400">للاطلاع على التقارير فقط</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>

                <button onClick={() => setView('register')} className="w-full mt-4 text-emerald-500 font-bold text-sm flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" /> إنشاء حساب جديد
                </button>
              </div>
            )}

            {(view === 'login' || view === 'register') && (
              <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4 animate-in fade-in duration-300">
                <button type="button" onClick={() => setView('choice')} className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-4">
                  <ArrowRight className="w-4 h-4" /> العودة
                </button>
                
                <h2 className="text-xl font-black mb-6 text-slate-800 dark:text-white">
                  {view === 'login' ? `دخول ${selectedRole === 'admin' ? 'المسؤول' : 'المشاهد'}` : 'تسجيل مستخدم جديد'}
                </h2>

                {view === 'register' && (
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold"
                    required
                  />
                )}

                <input
                  type="text"
                  placeholder="اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold"
                  required
                />

                <input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold"
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center"
                >
                  {isLoading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (view === 'login' ? 'دخول النظام' : 'تأكيد التسجيل')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
