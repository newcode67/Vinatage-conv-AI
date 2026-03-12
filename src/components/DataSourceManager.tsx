import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  HardDrive
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DataSource {
  name: string;
  active: boolean;
}

interface DataSourceManagerProps {
  onSourceChange: () => void;
  activeSource: string;
}

export default function DataSourceManager({ onSourceChange, activeSource }: DataSourceManagerProps) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/datasources');
      const data = await res.json();
      if (data.datasources) {
        setSources(data.datasources);
      }
    } catch (err) {
      console.error("Failed to fetch sources", err);
      setError("Failed to load data sources");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/datasources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSourceName.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setNewSourceName('');
      await fetchSources();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSource = async (name: string) => {
    if (name === activeSource) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/datasources/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      await fetchSources();
      onSourceChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasources/${name}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      await fetchSources();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <HardDrive className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold uppercase text-xs tracking-widest">Data Sources</h3>
        </div>
      </div>

      <form onSubmit={handleCreateSource} className="flex gap-2">
        <input
          type="text"
          value={newSourceName}
          onChange={(e) => setNewSourceName(e.target.value)}
          placeholder="New DB name..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !newSourceName.trim()}
          className="p-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-[10px]">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {sources.map((source) => (
          <div 
            key={source.name}
            className={cn(
              "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
              source.active 
                ? "bg-orange-600/10 border-orange-600/50" 
                : "bg-white/5 border-white/5 hover:bg-white/10"
            )}
            onClick={() => handleSelectSource(source.name)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "p-2 rounded-lg",
                source.active ? "bg-orange-600 text-white" : "bg-white/5 text-white/40"
              )}>
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{source.name}</p>
                {source.active && <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Active</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {source.active ? (
                <div className="p-1.5 text-orange-500">
                  <Check className="w-4 h-4" />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSource(source.name);
                  }}
                  className="p-1.5 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && sources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/20">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs">Loading sources...</p>
          </div>
        )}
      </div>
    </div>
  );
}
