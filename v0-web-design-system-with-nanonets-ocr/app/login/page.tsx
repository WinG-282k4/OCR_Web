'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { authAPI } from '@/lib/api-client';
import { saveTokens, saveUser } from '@/lib/auth';
import { Eye, EyeOff, Loader2, Layers, Sparkles } from 'lucide-react';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const res = await authAPI.login({ email: loginEmail, password: loginPassword });
      saveTokens(res.tokens.access, res.tokens.refresh);
      saveUser(res.user);
      dispatch(
        loginSuccess({
          user: res.user,
          accessToken: res.tokens.access,
          refreshToken: res.tokens.refresh,
        })
      );
      router.replace('/projects');
    } catch (err: any) {
      const msg = err.message || 'Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.';
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Mật khẩu phải ít nhất 8 ký tự.');
      return;
    }

    setIsLoading(true);
    dispatch(loginStart());

    try {
      const res = await authAPI.register({
        email: regEmail,
        password: regPassword,
        password_confirm: regConfirm,
        first_name: regFirstName,
        last_name: regLastName,
      });
      saveTokens(res.tokens.access, res.tokens.refresh);
      saveUser(res.user);
      dispatch(
        loginSuccess({
          user: res.user,
          accessToken: res.tokens.access,
          refreshToken: res.tokens.refresh,
        })
      );
      router.replace('/projects');
    } catch (err: any) {
      const msg = err.message || 'Đăng ký thất bại. Thử lại sau.';
      setError(msg);
      dispatch(loginFailure(msg));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] bg-violet-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">UIBuilder</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Thiết kế giao diện <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              thông minh với AI
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Upload ảnh mockup, AI tự động nhận diện components. Kéo thả, chỉnh sửa và export HTML với TailwindCSS.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-4">
          {[
            { icon: '🤖', title: 'AI OCR Detection', desc: 'Tự động phát hiện UI components từ ảnh' },
            { icon: '✏️', title: 'Visual Editor', desc: 'Chỉnh sửa trực quan, xem kết quả ngay lập tức' },
            { icon: '📦', title: 'TailwindCSS Export', desc: 'Export HTML chuẩn với Tailwind classes' },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <div className="text-white font-medium text-sm">{f.title}</div>
                <div className="text-slate-400 text-xs">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-lg font-bold">UIBuilder</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-8">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tab === t
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* ── Login Form ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang đăng nhập...</>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>
            )}

            {/* ── Register Form ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Họ</label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Nguyễn"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tên</label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Văn A"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Xác nhận mật khẩu</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Tạo tài khoản</>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            UIBuilder · AI-Powered Web Design
          </p>
        </div>
      </div>
    </div>
  );
}
