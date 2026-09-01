import { auth0 } from '../lib/auth0';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function Home() {
  const session = await auth0.getSession();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[150%] h-[150%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 relative shrink-0">
               <Image src="/icon.svg" alt="ClimaSense Logo" fill className="object-contain" />
             </div>
             <span className="text-xl font-bold tracking-tight text-white">ClimaSense</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/auth/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</a>
            <a href="/auth/login" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">Get Started</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 text-center lg:pt-32 lg:pb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            ClimaSense v2.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            Intelligence for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Every Climate.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            Stop guessing about the weather. ClimaSense analyzes real-time meteorological data across global cities to calculate the ultimate Comfort Index for your next destination.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <a href="/auth/login" className="w-full sm:w-auto text-base font-semibold bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-full transition-all shadow-lg flex items-center justify-center gap-2">
              Go to Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
            <a href="#features" className="w-full sm:w-auto text-base font-medium text-slate-300 hover:text-white px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm">
              Explore Features
            </a>
          </div>

          {/* Abstract Dashboard Preview (Visual candy) */}
          <div className="hidden md:block mt-20 relative mx-auto max-w-5xl animate-fade-in" style={{ animationDelay: '500ms' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10 rounded-2xl pointer-events-none" />
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-4 sm:p-6 overflow-hidden relative border-t-white/20 border-l-white/20">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div className="h-24 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                   <div className="absolute top-4 left-4 w-1/3 h-2 bg-white/10 rounded-full"></div>
                   <div className="absolute bottom-4 left-4 w-1/2 h-6 bg-white/20 rounded"></div>
                 </div>
                 <div className="h-24 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                   <div className="absolute top-4 left-4 w-1/3 h-2 bg-white/10 rounded-full"></div>
                   <div className="absolute bottom-4 left-4 w-1/2 h-6 bg-white/20 rounded"></div>
                 </div>
                 <div className="h-24 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                   <div className="absolute top-4 left-4 w-1/3 h-2 bg-white/10 rounded-full"></div>
                   <div className="absolute bottom-4 left-4 w-1/2 h-6 bg-white/20 rounded"></div>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="h-64 bg-white/5 rounded-xl border border-white/5 md:col-span-2 relative p-6">
                    <div className="w-1/4 h-3 bg-white/10 rounded-full mb-8"></div>
                    <div className="w-full h-full max-h-[150px] bg-gradient-to-t from-indigo-500/20 to-transparent border-b-2 border-indigo-500"></div>
                 </div>
                 <div className="h-64 bg-white/5 rounded-xl border border-white/5 relative p-6">
                    <div className="w-1/2 h-3 bg-white/10 rounded-full mb-6"></div>
                    <div className="flex flex-col gap-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center w-full">
                          <div className="w-2/3 h-2 bg-white/10 rounded-full"></div>
                          <div className="w-6 h-4 bg-emerald-500/20 rounded"></div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 bg-slate-900/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">Powerful Analytics, Simple Interface</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to monitor global climates, all in one beautifully designed platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Real-Time Data</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Live polling from the OpenWeatherMap API ensures you always have the most accurate and up-to-date meteorological statistics.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Custom Comfort Index</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Our proprietary algorithm analyzes temperature, humidity, and wind speed to generate a human-centric comfort score from 0-100.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Enterprise Security</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Fully secured with Auth0 identity management. Your session, data, and dashboard access are protected by industry standards.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 relative shrink-0">
               <Image src="/icon.svg" alt="ClimaSense Logo" fill className="object-contain" />
            </div>
            <span className="text-lg font-bold text-white">ClimaSense</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ClimaSense Analytics.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Twitter</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
