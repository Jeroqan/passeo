"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Kullanıcı adı veya şifre hatalı!");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#1e293b] via-[#312e81] to-[#0f172a] w-full">
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center w-full gap-8 mt-16 md:mt-32">
        {/* Sol video */}
        <div className="w-full md:w-[900px] flex items-center justify-center mb-6 md:mb-0">
          <div className="w-full aspect-video flex items-center justify-center">
            <video
              src="/login-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl shadow-2xl w-full h-full object-cover bg-black"
              style={{background:'#111'}}
            />
          </div>
        </div>
        {/* Sağ: Logo, Panel Adı ve Giriş Formu */}
        <div className="w-full max-w-md flex flex-col items-center justify-center" style={{minHeight: '400px'}}>
          {/* Logo ve Panel Adı */}
          <div className="flex flex-col items-center mt-0 mb-4 select-none z-10">
            <div className="bg-white/90 rounded-full shadow-lg p-3 mb-2 animate-logo-float">
              <img
                src="/pasajbot-logo.svg"
                alt="PasajBot Logo"
                className="w-16 h-16 object-contain pointer-events-none"
                draggable="false"
              />
            </div>
            <span className="text-white font-extrabold text-2xl tracking-tight mb-1 drop-shadow-sm text-center" style={{letterSpacing: '0.03em'}}>Pasaj SEO Paneli</span>
          </div>
          {/* Giriş Formu */}
          <form
            onSubmit={handleSubmit}
            className={`relative bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full flex flex-col gap-4 z-10 border border-blue-100 ${shake ? "animate-shake" : ""} animate-fadein [animation-delay:0.4s]`}
            autoComplete="on"
          >
            <h1 className="text-2xl font-bold mb-2 text-center text-blue-700">Giriş Yap</h1>
            <div className="relative">
              <label htmlFor="username-input" className="block text-gray-700 mb-1 font-medium">Kullanıcı Adı</label>
              <span className="absolute left-3 top-9 text-blue-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
              </span>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none bg-white"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div className="relative">
              <label htmlFor="password-input" className="block text-gray-700 mb-1 font-medium">Şifre</label>
              <span className="absolute left-3 top-9 text-blue-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M17 11V7a5 5 0 0 0-10 0v4m12 0v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7m12 0H5"/></svg>
              </span>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition outline-none bg-white"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-8 text-gray-400 hover:text-blue-500 focus:outline-none"
                onClick={() => setShowPassword(v => !v)}
                aria-label="Şifreyi Göster/Gizle"
              >
                {showPassword ? (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
                ) : (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M17.94 17.94A9.956 9.956 0 0 1 12 19c-6.5 0-10-7-10-7a19.77 19.77 0 0 1 4.22-5.29M9.53 9.53A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .47-.11.91-.29 1.29M21 21 3 3"/></svg>
                )}
              </button>
            </div>
            {error && <div className="text-red-600 mb-2 text-center font-semibold animate-shake">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold rounded-lg hover:scale-[1.03] hover:shadow-xl transition-all duration-200 shadow-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 neon-hover"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
      <div className="flex-1" />
      <footer className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-blue-200 text-xs text-center select-none z-40 w-full">
        <span className="inline-block bg-gradient-to-r from-blue-400 to-purple-400 h-1 w-24 rounded-full mb-2 opacity-40" /><br />
        © {new Date().getFullYear()} Pasaj SEO Paneli. Tüm hakları saklıdır.
      </footer>
      {/* Sağ alt köşe Powered by */}
      <div className="fixed right-2 bottom-2 text-xs text-blue-200 opacity-60 select-none z-50 pointer-events-none">
        Powered by Erkan Olus
      </div>
      {/* Animasyonlar için ek CSS */}
      <style jsx global>{`
        @keyframes fadein { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
        .animate-fadein { animation: fadein 1s both; }
        @keyframes logo-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px) scale(1.03);} }
        .animate-logo-float { animation: logo-float 4s ease-in-out infinite; }
        .neon-hover:hover {
          box-shadow: 0 0 16px 4px #7f9cf5, 0 0 32px 8px #a78bfa, 0 0 8px 2px #fff;
          filter: brightness(1.15) saturate(1.2);
        }
        @keyframes bar1 { 0%{height:0;} 100%{height:20px;} }
        @keyframes bar2 { 0%{height:0;} 100%{height:40px;} }
        @keyframes bar3 { 0%{height:0;} 100%{height:60px;} }
        @keyframes bar4 { 0%{height:0;} 100%{height:30px;} }
        .animate-bar1 { animation: bar1 1.2s cubic-bezier(.4,2,.6,1) both; }
        .animate-bar2 { animation: bar2 1.4s cubic-bezier(.4,2,.6,1) both; }
        .animate-bar3 { animation: bar3 1.6s cubic-bezier(.4,2,.6,1) both; }
        .animate-bar4 { animation: bar4 1.3s cubic-bezier(.4,2,.6,1) both; }
        @keyframes glow { 0%,100%{opacity:0.2;} 50%{opacity:1;} }
        .animate-glow { animation: glow 2.5s infinite; }
        @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.6s; }
      `}</style>
    </div>
  );
}
