import React from 'react';
import { VpnConfig, ExecutiveSummary } from '../types';
import { ShieldCheck, ShieldAlert, Cpu, Route, Zap, Eye, Globe } from 'lucide-react';

interface DashboardOverviewProps {
  configs: VpnConfig[];
  summary: ExecutiveSummary;
  onSelectConfig: (c: VpnConfig) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ configs, summary, onSelectConfig }) => {
  // Protocol grouping
  const protocolCounts = configs.reduce((acc, c) => {
    acc[c.protocol] = (acc[c.protocol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = configs.length || 1;
  const protocolData = (Object.entries(protocolCounts) as [string, number][]).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / total) * 100),
  })).sort((a, b) => b.count - a.count);

  // Country grouping
  const countryCounts = configs.reduce((acc, c) => {
    const key = c.geo?.countryCode || 'NL';
    const name = c.geo?.countryName || 'Netherlands';
    if (!acc[key]) {
      acc[key] = { count: 0, name };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { count: number; name: string }>);

  const countryData = (Object.entries(countryCounts) as [string, { count: number; name: string }][]).map(([code, data]) => ({
    code,
    name: data.name,
    count: data.count,
    percentage: Math.round((data.count / total) * 105 / 105), // clean math
  })).sort((a, b) => b.count - a.count);

  // Filter top 3 highest scores
  const topSecurity = [...configs]
    .sort((a, b) => b.securityScore - a.securityScore || b.qualityScore - a.qualityScore)
    .slice(0, 3);

  const topPerformance = [...configs]
    .sort((a, b) => b.qualityScore - a.qualityScore || a.latencyMs - b.latencyMs)
    .slice(0, 3);

  // Flag helpers
  const getFlagEmoji = (cc: string) => {
    const codePoints = cc
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div id="kpi-total" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">کل کانفیگ‌های استخراج شده</p>
            <p className="text-3xl font-bold text-slate-900">{summary.totalConfigs}</p>
            <p className="text-[11px] text-slate-400">از سورس‌های پردازش شده</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Route className="w-6 h-6" />
          </div>
        </div>

        <div id="kpi-security" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">میانگین امتیاز امنیت</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{summary.averageSecurityScore}</p>
              <span className="text-xs text-slate-400">/ ۱۰۰</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${summary.averageSecurityScore > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <p className="text-[11px] text-slate-500">پایداری رمزنگاری انتها به انتها</p>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${summary.averageSecurityScore > 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div id="kpi-quality" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">میانگین کیفیت لود سرور</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{summary.averageQualityScore}</p>
              <span className="text-xs text-slate-400">/ ۱۰۰</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-[11px] text-slate-500">بازده سرعت لود پکت‌ها</p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div id="kpi-accessibility" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">احتمال کارکرد در ایران</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-emerald-600">{summary.iranSuccessProbability}%</p>
            </div>
            <p className="text-[11px] text-slate-400">برآورد در زمان اختلال شدید DPI</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Risk Warning Banner */}
      <div className="bg-slate-900 text-slate-200 p-4.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">ریسک امنیتی اصلی شناسایی شده</h4>
            <p className="text-xs text-slate-400 mt-0.5">{summary.primaryRiskFactor}</p>
          </div>
        </div>
        <div className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg font-mono text-slate-100 transition duration-150 select-none">
          DPI-RISK-LEVEL: {summary.iranSuccessProbability < 60 ? 'HIGH' : summary.iranSuccessProbability < 85 ? 'MEDIUM' : 'LOW'}
        </div>
      </div>

      {/* Two Column Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Distribution & Geo Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-indigo-500" />
              توزیع فراوانی پروتکل‌ها
            </h3>
            <p className="text-xs text-slate-500 mt-1">سهم هر کدام از پروتکل‌های VPN در این اشتراک ساب‌اسکریپشن</p>
          </div>

          <div className="space-y-4">
            {protocolData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-500 font-mono">{item.count} سرور ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4.5 h-4.5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-900">سهم پراکندگی جغرافیایی</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {countryData.slice(0, 4).map((country) => (
                <div key={country.code} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{getFlagEmoji(country.code)}</span>
                    <span className="text-xs font-semibold text-slate-700">{country.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-100">
                    {country.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers Ranking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              رتبه‌بندی سرورهای رده‌بالا
            </h3>
            <p className="text-xs text-slate-500 mt-1">برترین سرورهای گلچین شده با تکیه بر تحلیل‌های امنیتی و بازدهی اتصالات</p>
          </div>

          <div className="space-y-4">
            {/* Top Security Header */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md inline-block">
                🥇 برترین‌ها از نظر امنیت رمزنگاری
              </h4>
              <div className="space-y-2">
                {topSecurity.map((cfg, i) => (
                  <div
                    key={cfg.id}
                    onClick={() => onSelectConfig(cfg)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 cursor-pointer transition duration-150"
                  >
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="text-xs font-mono font-bold text-slate-400">#{i + 1}</span>
                      <span className="text-sm font-medium text-slate-800 truncate">{cfg.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {cfg.protocol}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        🛡️ {cfg.securityScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Speed Performance Header */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                ⚡ برترین‌ها از نظر سرعت و پینگ ایران
              </h4>
              <div className="space-y-2">
                {topPerformance.map((cfg, i) => (
                  <div
                    key={cfg.id}
                    onClick={() => onSelectConfig(cfg)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-amber-100 hover:bg-slate-50/50 cursor-pointer transition duration-150"
                  >
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="text-xs font-mono font-bold text-slate-400">#{i + 1}</span>
                      <span className="text-sm font-medium text-slate-800 truncate">{cfg.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-500">
                        {cfg.latencyMs}ms
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        ⚡ {cfg.qualityScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
