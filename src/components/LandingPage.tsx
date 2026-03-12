import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  TrendingUp, 
  Rocket, 
  Play, 
  Shield, 
  Users, 
  ChevronRight, 
  X, 
  Info, 
  Database, 
  BarChart3, 
  Upload,
  User,
  Lock,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onStart: (initialQuery?: string) => void;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [showDemo, setShowDemo] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // For this demo, any credentials work
    onStart();
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vintage AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#recommendations" className="hover:text-white transition-colors">Recommendation Engine</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSignIn(true)}
              className="hidden sm:block text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              Get a demo
            </button>
            <button 
              onClick={() => onStart()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-orange-600 hover:bg-orange-500 rounded-xl transition-all shadow-lg shadow-orange-600/20"
            >
              <Rocket className="w-4 h-4" />
              Start for free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-7xl md:text-8xl font-bold leading-[0.9] mb-8 tracking-tighter">
              Turn Data <br />
              into <span className="text-orange-600 text-glow">Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/50 leading-relaxed mb-12 max-w-xl font-medium">
              The next generation of <span className="text-white">Conversational BI</span>. 
              Ask complex questions, get instant visual insights, and receive AI-driven strategic recommendations.
            </p>
            
            <div className="flex flex-wrap gap-5 mb-16">
              <button 
                onClick={() => onStart()}
                className="flex items-center gap-3 px-10 py-5 bg-orange-600 hover:bg-orange-500 rounded-[2rem] font-bold text-xl transition-all shadow-2xl shadow-orange-600/40 group led-glow-orange"
              >
                <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                Launch App
              </button>
              <button 
                onClick={() => setShowDemo(true)}
                className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                Get a demo
              </button>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <div className="w-5 h-5 rounded-full bg-orange-600/20 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-orange-600" />
                </div>
                Trusted by 200K+ users worldwide
              </div>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Shield className="w-4 h-4 text-orange-600" />
                SOC 2, GDPR compliant
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-orange-600/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl led-glow-orange">
              {/* Window Header */}
              <div className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-8">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                </div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-glow">Vintage AI Intelligence Hub</div>
                <div className="w-12" />
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Revenue', value: '$4.2M', trend: '+18.4%', color: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]' },
                    { label: 'Users', value: '128K', trend: '+9.1%', color: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]' },
                    { label: 'Churn', value: '1.8%', trend: '-0.3%', color: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]' },
                  ].map((stat, i) => (
                    <div key={i} className={cn("bg-white/5 p-6 rounded-[2rem] border border-white/5 transition-all hover:bg-white/10", stat.glow)}>
                      <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">{stat.label}</div>
                      <div className="text-2xl font-bold mb-1 text-glow">{stat.value}</div>
                      <div className={`text-[10px] font-bold ${stat.color}`}>{stat.trend}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 h-56 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-6 relative z-10">Revenue Velocity — Q1 2025</div>
                  <div className="flex items-end justify-between h-28 gap-3 relative z-10">
                    {[40, 70, 45, 60, 90, 30, 55, 80].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-xl shadow-[0_0_15px_rgba(234,88,12,0.2)] transition-all hover:scale-y-105" 
                        style={{ height: `${h}%` }} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Recommendation Engine Section */}
      <section id="recommendations" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl led-glow-orange/20"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/20 blur-3xl rounded-full animate-pulse" />
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-glow">Smart Recommendations</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">AI-Powered Insights</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/[0.08] transition-all group">
                    <div className="flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest mb-3">
                      <TrendingUp className="w-4 h-4" />
                      Growth Opportunity
                    </div>
                    <p className="text-base text-white/80 leading-relaxed italic">"Your Northeast region is outperforming others by 24%. We recommend reallocating 15% of the marketing budget from the West to the Northeast to maximize ROI."</p>
                  </div>
                  
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/[0.08] transition-all group">
                    <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-3">
                      <Rocket className="w-4 h-4" />
                      Strategy Adjustment
                    </div>
                    <p className="text-base text-white/80 leading-relaxed italic">"Product 'Vintage Pro' has seen a 10% decline in repeat purchases. Consider a targeted loyalty campaign or adjusting the pricing strategy for the next quarter."</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-600/20 rounded-full text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
                  <Sparkles className="w-3 h-3" />
                  New Feature
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                  Actionable <br />
                  <span className="text-orange-600 text-glow">Strategic Insights</span>
                </h2>
                <p className="text-xl text-white/50 leading-relaxed mb-10 font-medium">
                  Beyond just charts, our engine provides <span className="text-white">prescriptive analytics</span>. 
                  It identifies high-performing regions, flags underperforming products, and suggests concrete strategies to optimize your business performance in real-time.
                </p>
                <button 
                  onClick={() => onStart()}
                  className="flex items-center gap-3 text-orange-500 font-bold text-lg hover:gap-6 transition-all group"
                >
                  Explore Recommendations 
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Bento Grid */}
      <section id="capabilities" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Built for <span className="text-orange-600 text-glow">Speed & Precision</span></h2>
            <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium leading-relaxed">
              Vintage AI combines advanced natural language processing with high-performance data engines 
              to give you answers in seconds, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database className="w-40 h-40 text-orange-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-6">
                  <Database className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multi-Source Data Fabric</h3>
                <p className="text-white/50 max-w-md leading-relaxed">
                  Connect multiple CSV sources and databases simultaneously. Our engine automatically 
                  maps relationships across your data silos to provide a unified business view.
                </p>
              </div>
            </motion.div>

            {/* Small Feature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between hover:bg-white/[0.07] transition-all"
            >
              <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Bank-grade encryption for all your data at rest and in transit. SOC 2 Type II compliant infrastructure.
                </p>
              </div>
            </motion.div>

            {/* Small Feature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between hover:bg-white/[0.07] transition-all"
            >
              <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Instant Visualization</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  AI-driven charting that selects the most effective visualization for your specific data query automatically.
                </p>
              </div>
            </motion.div>

            {/* Large Feature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-gradient-to-br from-orange-600 via-orange-700 to-blue-900 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl shadow-orange-600/20 group"
            >
              <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-white/10 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold mb-6 text-glow">Natural Language Processing</h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-8">
                    Stop writing SQL. Just ask. Our advanced NLP engine understands complex business 
                    logic, temporal queries, and comparative analysis in plain English.
                  </p>
                  <button 
                    onClick={() => onStart("Compare sales growth between Q4 and Q1 for the tech sector")}
                    className="px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                  >
                    Try it now
                  </button>
                </div>
                <div className="w-full md:w-2/5 bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-8 led-glow-orange/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Live Intelligence Stream</span>
                  </div>
                  <p className="text-lg font-mono italic text-white/90 leading-relaxed">"Compare sales growth between Q4 and Q1 for the tech sector..."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemo(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center">
                      <Info className="w-6 h-6 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-bold">How to use Vintage AI</h2>
                  </div>
                  <button 
                    onClick={() => setShowDemo(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Upload className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">1. Upload your Data</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        Click the "Upload" button in the dashboard to import your CSV files. 
                        Vintage AI will automatically analyze the schema and prepare it for querying.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Database className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">2. Manage Data Sources</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        Create multiple databases and switch between them instantly. 
                        Connect different projects or departments to their own dedicated data silos.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">3. Ask in Natural Language</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        Type questions like "What was our total revenue last month?" or 
                        "Show me the top 5 products by stock level". No SQL knowledge required.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">4. Visualize & Export</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        The AI automatically chooses the best chart (Bar, Line, Pie) to represent your data. 
                        You can export any result as a JSON file for further use.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setShowDemo(false); onStart(); }}
                  className="w-full mt-12 py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-orange-600/30"
                >
                  Got it, let's start!
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSignIn && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignIn(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Sign in</h2>
                  <button 
                    onClick={() => setShowSignIn(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-orange-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-orange-600/30"
                  >
                    Sign in
                  </button>

                  <p className="text-center text-sm text-white/40">
                    Don't have an account? <button type="button" className="text-orange-500 font-bold hover:underline">Sign up</button>
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
