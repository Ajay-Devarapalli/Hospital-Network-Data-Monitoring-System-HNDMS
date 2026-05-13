import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Cpu, HardDrive, Clock, AlertTriangle } from 'lucide-react';

interface Metrics {
  cpu: number;
  memory: number;
  uptime: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length < 3) parts.push(`${s}s`);

  return parts.join(' ');
}

export function SystemMonitoring() {
  const { data, isLoading, isError } = useQuery<{ success: boolean; data: Metrics }>({
    queryKey: ['system-metrics'],
    queryFn: () => api.get('/metrics').then((r) => r.data),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isError) return null;

  const metrics = data?.data;
  const isCpuHigh = (metrics?.cpu ?? 0) > 80;
  const isMemHigh = (metrics?.memory ?? 0) > 80;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          📊 System Monitoring
        </h2>
        {(isCpuHigh || isMemHigh) && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 animate-pulse">
            <AlertTriangle className="w-4 h-4" /> HIGH LOAD
          </span>
        )}
      </div>
      <div className="p-4 space-y-4">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> CPU Usage
            </span>
            <span className={cn("font-bold", isCpuHigh ? "text-red-500" : "text-slate-700 dark:text-slate-300")}>
              {isLoading ? '...' : `${metrics?.cpu}%`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", isCpuHigh ? "bg-red-500" : "bg-indigo-500")}
              style={{ width: `${isLoading ? 0 : metrics?.cpu}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4" /> Memory Usage
            </span>
            <span className={cn("font-bold", isMemHigh ? "text-red-500" : "text-slate-700 dark:text-slate-300")}>
              {isLoading ? '...' : `${metrics?.memory}%`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500", isMemHigh ? "bg-red-500" : "bg-emerald-500")}
              style={{ width: `${isLoading ? 0 : metrics?.memory}%` }}
            />
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50 dark:border-slate-800 mt-2">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> System Uptime
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {isLoading ? '...' : formatUptime(metrics?.uptime ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
