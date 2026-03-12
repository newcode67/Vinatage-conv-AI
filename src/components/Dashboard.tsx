import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  Table as TableIcon, 
  Upload, 
  Database, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  Info,
  Download,
  History,
  User,
  Lock,
  Globe,
  Languages,
  LogOut,
  ChevronDown,
  ChevronRight,
  Mic,
  MicOff,
  ExternalLink,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LandingPage from './LandingPage';
import DataSourceManager from './DataSourceManager';

import { 
  generateStrategicSynthesis, 
  generateFollowUpQuestions,
  answerFollowUp,
  generateSQL
} from '../services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#ffedd5', '#c2410c', '#9a3412'];

interface FrequencyItem {
  value: string | number;
  count: number;
  percentage: number;
}

interface SearchResult {
  query: string;
  data: any[];
  table: string;
  timestamp: number;
  insight: string;
  summary: string;
  followUpQuestions: string[];
  frequencyDistribution: Record<string, FrequencyItem[]>;
  chartConfig: {
    type: 'bar' | 'line' | 'pie' | 'area' | 'none';
    xKey: string;
    yKey: string;
  };
}

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<Record<string, string[]>>({});
  const [activeDb, setActiveDb] = useState<string>('analytics.db');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDataSourceOpen, setIsDataSourceOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<{ query: string, timestamp: number }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        setTimeout(() => {
          handleSearch(undefined, transcript);
        }, 500);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setQuery('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSchema();
      try {
        const savedHistory = localStorage.getItem('bi_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
        
        const savedResults = localStorage.getItem('bi_results_session');
        if (savedResults) setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
  }, [isLoggedIn]);

  const fetchSchema = async () => {
    try {
      const res = await fetch('/api/schema');
      const data = await res.json();
      setSchema(data.schema);
      if (data.activeDb) setActiveDb(data.activeDb);
    } catch (err) {
      console.error("Failed to fetch schema", err);
    }
  };

  const [selectedReport, setSelectedReport] = useState<SearchResult | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState<{ question: string, answer: string } | null>(null);
  const [answeringFollowUp, setAnsweringFollowUp] = useState(false);

  const calculateFrequencyDistribution = (data: any[]): Record<string, FrequencyItem[]> => {
    if (!data || !Array.isArray(data) || data.length === 0) return {};
    
    const firstRow = data[0];
    if (!firstRow) return {};
    
    const keys = Object.keys(firstRow);
    const distribution: Record<string, FrequencyItem[]> = {};
    
    keys.forEach(key => {
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const val = row[key] === null || row[key] === undefined ? 'N/A' : String(row[key]);
        counts[val] = (counts[val] || 0) + 1;
      });
      
      const items: FrequencyItem[] = Object.entries(counts)
        .map(([value, count]) => ({
          value,
          count,
          percentage: (count / data.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50); // Keep more values for better distribution analysis
        
      distribution[key] = items;
    });
    
    return distribution;
  };

  const handleFollowUpClick = async (question: string, result: SearchResult) => {
    setAnsweringFollowUp(true);
    setFollowUpAnswer(null);
    try {
      const answer = await answerFollowUp(result.data, question, result.table);
      setFollowUpAnswer({ question, answer });
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setAnsweringFollowUp(false);
    }
  };

  const renderDataTable = (data: any[]) => {
    if (!data || data.length === 0) return null;
    const firstRow = data[0];
    if (!firstRow) return null;
    const headers = Object.keys(firstRow);
    return (
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              {headers.map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 100).map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                {headers.map(h => (
                  <td key={h} className="px-4 py-3 text-sm text-white/60 border-b border-white/5 whitespace-nowrap">
                    {String(row[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 100 && (
          <div className="p-4 text-center text-xs text-white/20 font-bold uppercase tracking-widest">
            Showing first 100 of {data.length} records
          </div>
        )}
      </div>
    );
  };

  const generateDetailedReport = (result: SearchResult) => {
    const { data, table, chartConfig } = result;
    if (!data || data.length === 0) return "No data available for a detailed report.";

    const firstRow = data[0];
    if (!firstRow) return "No data available for a detailed report.";

    const keys = Object.keys(firstRow);
    const numericKeys = keys.filter(k => typeof data[0][k] === 'number');
    const categoricalKeys = keys.filter(k => typeof data[0][k] === 'string');

    let report = `### Detailed Report: ${result.query}\n\n`;
    report += `This report provides an in-depth analysis of the **${table}** dataset based on your search. The data consists of ${data.length} records.\n\n`;

    if (numericKeys.length > 0) {
      report += `#### Numerical Analysis\n`;
      numericKeys.forEach(key => {
        const values = data.map(d => d[key]).filter(v => typeof v === 'number');
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

        report += `- **${key}**: The values range from ${min.toLocaleString()} to ${max.toLocaleString()}. The average value is ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}, with a median of ${median.toLocaleString()}. The cumulative total across all records is ${total.toLocaleString()}.\n`;
      });
      report += `\n`;
    }

    if (categoricalKeys.length > 0) {
      report += `#### Categorical Insights\n`;
      categoricalKeys.slice(0, 3).forEach(key => {
        const counts: Record<string, number> = {};
        data.forEach(d => {
          const val = d[key];
          counts[val] = (counts[val] || 0) + 1;
        });
        const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const top3 = sortedEntries.slice(0, 3);
        
        report += `- **${key}**: There are ${Object.keys(counts).length} unique categories. The most prominent are ${top3.map(([val, count]) => `"${val}" (${count} occurrences)`).join(', ')}.\n`;
      });
      report += `\n`;
    }

    if (chartConfig.type !== 'none') {
      report += `#### Visualization Breakdown\n`;
      report += `The generated **${chartConfig.type.toUpperCase()} chart** visualizes the relationship between **${chartConfig.xKey}** and **${chartConfig.yKey}**.\n`;
      
      if (chartConfig.type === 'line' || chartConfig.type === 'area') {
        report += `This visualization highlights trends over time or sequence. Look for peaks and valleys to identify periods of high and low activity.\n`;
      } else if (chartConfig.type === 'bar') {
        report += `The bar chart allows for direct comparison between different categories of ${chartConfig.xKey}. The height of each bar represents the magnitude of ${chartConfig.yKey}.\n`;
      } else if (chartConfig.type === 'pie') {
        report += `The pie chart illustrates the proportional distribution of ${chartConfig.yKey} across different ${chartConfig.xKey} segments. It's ideal for understanding market share or composition.\n`;
      }
    }

    report += `\n#### Conclusion\n`;
    report += `Based on the current dataset, the data shows a ${data.length > 20 ? 'robust' : 'limited'} sample size. Further investigation into the top-performing categories and numerical outliers is recommended for strategic decision-making.`;

    return report;
  };

  const getChartConfig = (data: any[]): SearchResult['chartConfig'] => {
    if (!data || data.length === 0) return { type: 'none', xKey: '', yKey: '' };
    
    const firstRow = data[0];
    if (!firstRow) return { type: 'none', xKey: '', yKey: '' };

    const keys = Object.keys(firstRow);
    const numericKeys = keys.filter(k => typeof data[0][k] === 'number');
    const categoricalKeys = keys.filter(k => typeof data[0][k] === 'string');
    
    // Prioritize line chart as requested
    if (categoricalKeys.length > 0) {
      const bestCatKey = categoricalKeys.find(k => {
        const uniqueCount = new Set(data.map(d => d[k])).size;
        return uniqueCount > 1 && uniqueCount <= 20;
      }) || categoricalKeys[0];

      // If we have numeric keys, we can plot them. If not, we plot counts.
      const yKey = numericKeys.length > 0 ? numericKeys[0] : 'count';
      return { type: 'line', xKey: bestCatKey, yKey };
    }

    if (numericKeys.length === 0) return { type: 'none', xKey: '', yKey: '' };
    
    const yKey = numericKeys[0];
    let xKey = categoricalKeys[0] || keys[0];
    
    // Check for temporal data
    const temporalKey = categoricalKeys.find(k => 
      k.toLowerCase().includes('date') || 
      k.toLowerCase().includes('time') || 
      k.toLowerCase().includes('month') || 
      k.toLowerCase().includes('year')
    );
    
    if (temporalKey) {
      return { type: 'line', xKey: temporalKey, yKey };
    }
    
    return { type: 'bar', xKey, yKey };
  };

  const renderChart = (data: any[], config: SearchResult['chartConfig']) => {
    if (config.type === 'none') return null;

    let chartData: any[] = [];
    let yKeyToUse = config.yKey;
    const numericKeys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] === 'number');

    if (config.yKey === 'count') {
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const val = String(item[config.xKey] || 'N/A');
        counts[val] = (counts[val] || 0) + 1;
      });

      chartData = Object.entries(counts)
        .map(([name, count]) => ({
          [config.xKey]: name,
          count,
          percentage: (count / data.length) * 100
        }))
        .sort((a, b) => String(a[config.xKey]).localeCompare(String(b[config.xKey]), undefined, { numeric: true }))
        .slice(0, 12);
      
      yKeyToUse = 'count';
    } else {
      const aggregatedDataMap: Record<string, any> = {};
      data.forEach(item => {
        const xVal = String(item[config.xKey]);
        if (!aggregatedDataMap[xVal]) {
          aggregatedDataMap[xVal] = { [config.xKey]: xVal };
          numericKeys.forEach(k => aggregatedDataMap[xVal][k] = 0);
        }
        numericKeys.forEach(k => {
          aggregatedDataMap[xVal][k] += Number(item[k]) || 0;
        });
      });

      chartData = Object.values(aggregatedDataMap)
        .sort((a, b) => String(a[config.xKey]).localeCompare(String(b[config.xKey]), undefined, { numeric: true }))
        .slice(0, 15);
    }

    const infographicColors = ['#facc15', '#f97316', '#0d9488', '#6366f1', '#ec4899'];

    return (
      <div className="flex flex-col gap-8">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.1)" vertical={true} horizontal={true} />
            <XAxis 
              dataKey={config.xKey} 
              stroke="rgba(255,255,255,0.4)" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
              orientation="top"
              dy={-10}
              fontWeight="bold"
            />
            <YAxis hide={true} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(10px)' }}
              itemStyle={{ fontSize: '12px' }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
            />
            {yKeyToUse === 'count' ? (
              <Line 
                type="linear" 
                dataKey="count" 
                stroke={infographicColors[0]} 
                strokeWidth={3} 
                dot={{ r: 5, fill: infographicColors[0], strokeWidth: 2, stroke: '#000' }} 
                activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }} 
              />
            ) : (
              numericKeys.slice(0, 3).map((key, index) => (
                <Line 
                  key={key}
                  type="linear" 
                  dataKey={key} 
                  stroke={infographicColors[index % infographicColors.length]} 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: infographicColors[index % infographicColors.length], strokeWidth: 2, stroke: '#000' }} 
                  activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }} 
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Infographic Legend Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-white/10">
          {chartData.slice(0, 4).map((item, idx) => (
            <div key={idx} className="group flex flex-col gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-500">
              <div className="text-4xl font-black tracking-tighter leading-none" style={{ color: infographicColors[idx % infographicColors.length] }}>
                {typeof item[config.xKey] === 'number' ? Number(item[config.xKey]).toFixed(1) : String(item[config.xKey])}
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold leading-tight">
                  {yKeyToUse === 'count' 
                    ? `${item.count} occurrences detected in dataset`
                    : `Primary metric value: ${Number(item[config.yKey]).toLocaleString()}`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    
    // Ensure activeQuery is a string to prevent .trim() errors
    const rawQuery = typeof customQuery === 'string' ? customQuery : query;
    const activeQuery = typeof rawQuery === 'string' ? rawQuery : '';
    
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      // Use Gemini to generate a smart SQL query based on the user's natural language
      const sql = await generateSQL(activeQuery, schema);
      
      if (!sql) {
        throw new Error("Could not generate a valid query for your request.");
      }

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });

      const queryResult = await res.json();
      if (queryResult.error) throw new Error(queryResult.error);

      const data = queryResult.results || [];
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server.");
      }

      // Determine target table from SQL for the insight message
      let targetTable = 'data';
      const tableMatch = sql.match(/FROM\s+"?([^"\s]+)"?/i);
      if (tableMatch) targetTable = tableMatch[1];
      
      // Use Gemini for Strategic Synthesis and Follow-up Questions
      const [geminiSynthesis, geminiFollowUps] = await Promise.all([
        generateStrategicSynthesis(data, activeQuery, targetTable),
        generateFollowUpQuestions(data, activeQuery, targetTable)
      ]);

      const newResult: SearchResult = {
        query: activeQuery,
        data,
        table: targetTable,
        timestamp: Date.now(),
        insight: `Found ${data.length} records in ${targetTable} matching your search.`,
        summary: geminiSynthesis,
        followUpQuestions: geminiFollowUps,
        frequencyDistribution: calculateFrequencyDistribution(data),
        chartConfig: getChartConfig(data)
      };
      
      const newResults = [newResult];
      setResults(newResults);
      localStorage.setItem('bi_results_session', JSON.stringify(newResults));
      
      const newHistory = [{ query: activeQuery, timestamp: Date.now() }, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('bi_history', JSON.stringify(newHistory));
      
      if (!customQuery) setQuery('');
    } catch (err) {
      console.error("Search Error:", err);
      setError(`Search Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onStart={(initialQuery) => {
      setIsLoggedIn(true);
      if (initialQuery) {
        setQuery(initialQuery);
        // We need to wait for the component to mount/update before searching
        setTimeout(() => {
          handleSearch(undefined, initialQuery);
        }, 100);
      }
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-xl shadow-orange-600/20">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-glow">Vintage Intelligence</h1>
              <div className="flex items-center gap-1.5 text-[10px] text-orange-500/60 font-bold uppercase tracking-[0.2em]">
                <Database className="w-3 h-3" />
                Active Node: {activeDb}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
              title="History"
            >
              <History className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
            </button>
            <button 
              onClick={() => setIsDataSourceOpen(true)}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
              title="Data Sources"
            >
              <Database className="w-4 h-4 group-hover:text-orange-500 transition-colors" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-6 py-2.5 text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all led-glow-orange/0 hover:led-glow-orange/20"
            >
              <Upload className="w-4 h-4 text-orange-500" />
              {uploading ? 'Processing...' : 'Import Data'}
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => {
               const file = e.target.files?.[0];
               if (!file) return;
               setUploading(true);
               Papa.parse(file, {
                 header: true,
                 dynamicTyping: true,
                 skipEmptyLines: true,
                 complete: async (results) => {
                   try {
                     const tableName = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
                     const res = await fetch('/api/upload', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ tableName, data: results.data })
                     });
                     const uploadResult = await res.json();
                     if (uploadResult.error) throw new Error(uploadResult.error);
                     
                     await fetchSchema();
                     handleSearch(undefined, `Search in ${tableName}`);
                   } catch (err) {
                     alert("Upload failed: " + (err as Error).message);
                   } finally { setUploading(false); }
                 }
               });
            }} accept=".csv" className="hidden" />
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="p-2 bg-white/10 hover:bg-red-500/40 rounded-full transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        {/* Search Bar - Center Focused */}
        <div className="mb-16">
          <form onSubmit={handleSearch} className="relative group neon-border rounded-[2.5rem]">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-orange-500 transition-colors z-20">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={query}
              onFocus={() => {
                if (results.length > 0) {
                  setQuery('');
                  setResults([]);
                }
                setError(null);
              }}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask anything about your business data..."}
              className={cn(
                "w-full bg-black/60 border border-white/10 rounded-[2.5rem] py-8 pl-16 pr-44 text-2xl font-medium placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600/50 backdrop-blur-3xl transition-all shadow-2xl led-glow-orange relative z-10",
                isListening && "ring-4 ring-red-500/20 border-red-500/50 led-glow-blue"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={toggleListening}
                className={cn(
                  "p-5 rounded-2xl transition-all flex items-center justify-center",
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-white hover:bg-white/10"
                )}
              >
                {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              <button
                type="submit"
                disabled={loading || typeof query !== 'string' || !query.trim()}
                className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-all flex items-center gap-3 disabled:opacity-50 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Quick Suggestions */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {Object.keys(schema).slice(0, 5).map(table => (
              <button 
                key={table}
                onClick={() => handleSearch(undefined, table)}
                className="px-6 py-3 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-2xl text-sm font-bold text-white/40 hover:text-orange-500 transition-all flex items-center gap-2 group"
              >
                <Database className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                {table}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-12">
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-200 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {results.length === 0 && !loading && !error && (
              <div className="text-center py-20 opacity-20">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Database className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to explore</h2>
                <p>Type a table name or keyword to see your data</p>
              </div>
            )}

            {results.map((result, idx) => (
              <motion.div 
                key={result.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Result Header */}
                <div className="flex items-center justify-between text-white/40 text-xs font-bold uppercase tracking-widest px-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <TableIcon className="w-3 h-3" />
                    {result.table}
                  </div>
                </div>

                {/* Result Card */}
                <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl led-glow-orange/10 hover:led-glow-orange/20 transition-all duration-500">
                  <div className="p-12 border-b border-white/5">
                    <div className="flex flex-col mb-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                          <Sparkles className="w-8 h-8 text-orange-500" />
                        </div>
                        <h3 className="text-4xl font-bold text-white tracking-tight text-glow leading-tight">
                          {result.query}
                        </h3>
                      </div>
                      <p className="text-white/60 text-xl leading-relaxed mb-8 font-medium max-w-4xl">{result.insight}</p>
                      
                      {/* Summary Section */}
                      <div className="p-8 bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] mb-10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px] uppercase tracking-[0.2em] mb-4 relative z-10">
                          <Info className="w-4 h-4" />
                          Strategic Synthesis
                        </div>
                        <p className="text-lg text-white/80 leading-relaxed italic relative z-10 font-medium">
                          "{result.summary}"
                        </p>
                      </div>

                      {/* Data Explorer Table */}
                      <div className="mb-10 p-8 bg-black/40 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.1)] hover:shadow-[0_0_70px_rgba(234,88,12,0.15)] transition-all duration-700 group/table">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px] uppercase tracking-[0.2em]">
                            <TableIcon className="w-4 h-4" />
                            Data Explorer
                          </div>
                          <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            Showing {Math.min(result.data.length, 50)} of {result.data.length} records
                          </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar max-h-[500px] overflow-y-auto">
                          <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead className="sticky top-0 z-20 bg-[#0a0a0a]">
                              <tr>
                                {result.data.length > 0 && Object.keys(result.data[0]).map((key) => (
                                  <th key={key} className="pb-4 px-4 font-bold text-white/40 uppercase tracking-wider border-b border-white/10 whitespace-nowrap">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {result.data.slice(0, 50).map((row, rIdx) => (
                                <tr key={rIdx} className="group/row hover:bg-orange-500/5 transition-colors">
                                  {Object.values(row).map((val: any, cIdx) => (
                                    <td key={cIdx} className="py-4 px-4 text-white/70 group-hover/row:text-white transition-colors whitespace-nowrap border-b border-white/5">
                                      {val === null || val === undefined ? (
                                        <span className="opacity-20 italic">null</span>
                                      ) : typeof val === 'boolean' ? (
                                        <span className={val ? 'text-emerald-500' : 'text-rose-500'}>{val.toString()}</span>
                                      ) : val.toString()}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {result.data.length > 50 && (
                          <div className="mt-6 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
                            + {result.data.length - 50} more records
                          </div>
                        )}
                      </div>

                      {/* Chart Section */}
                      {result.chartConfig.type !== 'none' && (
                        <div className="mb-10 p-10 bg-black/40 rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(234,88,12,0.05)] hover:shadow-[0_0_70px_rgba(234,88,12,0.1)] transition-all duration-700">
                          <div className="flex items-center justify-between mb-10">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px] uppercase tracking-[0.2em]">
                                <TrendingUp className="w-4 h-4" />
                                Line Chart Infographics
                              </div>
                              <h4 className="text-3xl font-black text-white tracking-tighter">
                                Strategic Data Synthesis
                              </h4>
                            </div>
                            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-white/60 font-bold uppercase tracking-[0.3em]">
                              {result.chartConfig.xKey} Analysis
                            </div>
                          </div>
                          <div className="w-full">
                            {renderChart(result.data, result.chartConfig)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suggested Next Steps */}
                    <div className="bg-black/40 rounded-[2.5rem] p-10 border border-white/5">
                      <div className="flex items-center gap-2 text-orange-500/60 font-bold text-[11px] uppercase tracking-[0.2em] mb-8">
                        <Sparkles className="w-4 h-4" />
                        Strategic Deep-Dives
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleFollowUpClick(q, result)}
                            className="text-left px-6 py-5 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/40 rounded-2xl text-base text-white/60 hover:text-white transition-all group flex items-center justify-between led-glow-orange/0 hover:led-glow-orange/20"
                          >
                            <span className="line-clamp-2 font-medium">{q}</span>
                            <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-orange-500 shrink-0" />
                          </button>
                        ))}
                      </div>

                      {/* Follow-up Answer Section */}
                      <AnimatePresence>
                        {(answeringFollowUp || followUpAnswer) && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 p-8 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden"
                          >
                            {answeringFollowUp ? (
                              <div className="flex items-center gap-3 text-blue-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-bold uppercase tracking-widest">Synthesizing Answer...</span>
                              </div>
                            ) : followUpAnswer && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-blue-400 font-bold text-[11px] uppercase tracking-[0.2em]">
                                  <Sparkles className="w-4 h-4" />
                                  AI Insight: {followUpAnswer.question}
                                </div>
                                <p className="text-lg text-white/90 leading-relaxed">
                                  {followUpAnswer.answer}
                                </p>
                                <button 
                                  onClick={() => setFollowUpAnswer(null)}
                                  className="text-xs text-white/40 hover:text-white transition-colors"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="px-12 py-8 bg-black/40 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                      <Database className="w-4 h-4" />
                      {result.data.length} Records Synthesized
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedReport(result)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm text-orange-500"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Full Report
                      </button>
                      <button 
                        onClick={() => {
                          const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(result.data, null, 2))}`;
                          const link = document.createElement("a");
                          link.href = jsonString;
                          link.download = `strategic_report_${idx + 1}.json`;
                          link.click();
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold text-sm group"
                      >
                        <Download className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="w-12 h-12 border-4 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest text-white/40">Searching through your data...</p>
            </div>
          )}
        </div>
      </main>

      {/* Full Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-600 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Full Data Report</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">{selectedReport.table} Analysis</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <LogOut className="w-6 h-6 rotate-180" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  {/* Chart in Modal */}
                  <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest mb-6">
                      <BarChart3 className="w-3 h-3" />
                      Visual Representation
                    </div>
                    {renderChart(selectedReport.data, selectedReport.chartConfig)}
                  </div>

                  {/* Detailed Analysis Text */}
                  <div className="prose prose-invert max-w-none">
                    <div className="space-y-6 text-white/80 leading-relaxed">
                      {generateDetailedReport(selectedReport).split('\n\n').map((paragraph, i) => {
                        if (paragraph.startsWith('### ')) {
                          return <h3 key={i} className="text-2xl font-bold text-orange-500 mt-8 mb-4">{paragraph.replace('### ', '')}</h3>;
                        }
                        if (paragraph.startsWith('#### ')) {
                          return <h4 key={i} className="text-lg font-bold text-white mb-2">{paragraph.replace('#### ', '')}</h4>;
                        }
                        if (paragraph.includes('- **')) {
                          return (
                            <ul key={i} className="space-y-2 list-none p-0">
                              {paragraph.split('\n').map((item, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-orange-500">•</span>
                                  <span dangerouslySetInnerHTML={{ __html: item.replace('- **', '<strong>').replace('**: ', '</strong>: ') }} />
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={i} className="text-white/70">{paragraph}</p>;
                      })}
                    </div>
                  </div>

                  {/* Raw Data Table */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-widest">
                      <TableIcon className="w-3 h-3" />
                      Raw Data Records
                    </div>
                    {renderDataTable(selectedReport.data)}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Generated on {new Date(selectedReport.timestamp).toLocaleString()}
                </div>
                <button 
                  onClick={() => {
                    const reportText = generateDetailedReport(selectedReport);
                    const blob = new Blob([reportText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `report_${selectedReport.table}.txt`;
                    a.click();
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Sidebar */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[120] bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <History className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Search History</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your recent explorations</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <History className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">No history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleSearch(undefined, item.query);
                          setIsHistoryOpen(false);
                        }}
                        className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">{item.query}</span>
                          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <Search className="w-4 h-4 text-white/20 group-hover:text-orange-500 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5">
                <button 
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('bi_history');
                  }}
                  className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  Clear All History
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Data Source Modal */}
      <AnimatePresence>
        {isDataSourceOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDataSourceOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-10"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-600 rounded-2xl">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Data Source Manager</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">Manage your connected datasets</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDataSourceOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <LogOut className="w-6 h-6 rotate-180" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <DataSourceManager 
                  onSourceChange={() => {
                    fetchSchema();
                    setIsDataSourceOpen(false);
                  }} 
                  activeSource={activeDb} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar - Hidden by default, accessible via floating button if needed */}
    </div>
  );
}

