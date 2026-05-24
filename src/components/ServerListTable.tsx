import React, { useState, useMemo } from 'react';
import { VpnConfig } from '../types';
import { Search, ShieldAlert, Download, Copy, Check, Filter, Info, X, CheckCircle } from 'lucide-react';

interface ServerListTableProps {
  configs: VpnConfig[];
  onSelectConfig: (c: VpnConfig) => void;
  selectedConfig: VpnConfig | null;
  onCloseDetail: () => void;
}

export const ServerListTable: React.FC<ServerListTableProps> = ({
  configs,
  onSelectConfig,
  selectedConfig,
  onCloseDetail
}) => {
  const [search, setSearch] = useState('');
  const [filterProtocol, setFilterProtocol] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterSecurity, setFilterSecurity] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive unique lists for dropdown selectors
  const uniqueProtocols = useMemo(() => {
    return ['All', ...Array.from(new Set(configs.map(c => c.protocol)))];
  }, [configs]);

  const uniqueCountries = useMemo(() => {
    return ['All', ...Array.from(new Set(configs.map(c => c.geo?.countryCode)))];
  }, [configs]);

  // Filter configurations list
  const filteredConfigs = useMemo(() => {
    return configs.filter(c => {
      const query = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(query) ||
        c.server.toLowerCase().includes(query) ||
        (c.sni && c.sni.toLowerCase().includes(query));

      const matchesProtocol = filterProtocol === 'All' || c.protocol === filterProtocol;
      const matchesCountry = filterCountry === 'All' || c.geo?.countryCode === filterCountry;
      
      let matchesSecurity = true;
      if (filterSecurity === 'Secure') {
        matchesSecurity = c.securityScore >= 80;
      } else if (filterSecurity === 'Vulnerable') {
        matchesSecurity = c.securityScore < 80;
      }

      return matchesSearch && matchesProtocol && matchesCountry && matchesSecurity;
    });
  }, [configs, search, filterProtocol, filterCountry, filterSecurity]);

  // Handle URI copy action
  const handleCopy = (uri: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uri);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getFlagEmoji = (cc: string) => {
    const codePoints = cc
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Hub */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div id="search-bar" className="relative md:col-span-2">
          <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در نام، دامنه سرور، SNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-sm bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:border-indigo-505 focus:bg-white transition duration-150"
          />
        </div>

        {/* Filter Protocol */}
        <div id="filter-proto-box" className="relative">
          <select
            value={filterProtocol}
            onChange={(e) => setFilterProtocol(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-150 rounded-xl appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700"
          >
            <option value="All">پروتکل: همه</option>
            {uniqueProtocols.filter(p => p !== 'All').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Filter Country */}
        <div id="filter-country-box" className="relative">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-150 rounded-xl appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-700"
          >
            <option value="All">موقعیت: همه</option>
            {uniqueCountries.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Filter className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid containing master table and detail card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container (2 columns span if detail card is open, otherwise full) */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${selectedConfig ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">نام سرور / کانفیگ</th>
                  <th className="px-5 py-3.5 text-center">پروتکل</th>
                  <th className="px-5 py-3.5 text-center">موقعیت/لوکیشن</th>
                  <th className="px-5 py-3.5 text-center">امنیت</th>
                  <th className="px-5 py-3.5 text-center">پینگ / تاخیر</th>
                  <th className="px-5 py-3.5 text-center">دسته‌بندی‌ها</th>
                  <th className="px-5 py-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                      هیچ سروری مطابق با فیلترهای بالا یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredConfigs.map((cfg) => {
                    const isPortHighRisk = [80, 8080, 3128].includes(cfg.port);
                    return (
                      <tr
                        key={cfg.id}
                        onClick={() => onSelectConfig(cfg)}
                        className={`hover:bg-indigo-50/20 cursor-pointer transition duration-150 ${selectedConfig?.id === cfg.id ? 'bg-indigo-50/40 font-medium' : ''}`}
                      >
                        {/* Name Column */}
                        <td className="px-5 py-4 max-w-[220px]">
                          <div className="flex items-center gap-2">
                            {cfg.allowInsecure && (
                              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" title="دارای باگ امنیتی شدید" />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-900 truncate">{cfg.name}</p>
                              <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{cfg.server}:{cfg.port}</p>
                            </div>
                          </div>
                        </td>

                        {/* Protocol Badge */}
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            cfg.protocol === 'VLESS' ? 'bg-indigo-50 text-indigo-700' :
                            cfg.protocol === 'VMess' ? 'bg-sky-50 text-sky-700' :
                            cfg.protocol === 'Trojan' ? 'bg-purple-50 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {cfg.protocol}
                          </span>
                        </td>

                        {/* Geo Location */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-sm">{getFlagEmoji(cfg.geo?.countryCode)}</span>
                            <span className="text-slate-600">{cfg.geo?.countryCode}</span>
                          </div>
                        </td>

                        {/* Security Rating */}
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            cfg.securityScore >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {cfg.securityScore}/۱۰۰
                          </span>
                        </td>

                        {/* Latency */}
                        <td className="px-5 py-4 text-center font-mono text-slate-600">
                          {cfg.latencyMs}ms
                        </td>

                        {/* Suitability Flag Badges */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {cfg.suitability.gaming && (
                              <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded cursor-help" title="مناسب گیم (تاخیر کم)">🎮</span>
                            )}
                            {cfg.suitability.streaming && (
                              <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded cursor-help" title="مناسب استریم ویدیو">📹</span>
                            )}
                            {cfg.suitability.working && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded cursor-help" title="امن برای کار">💼</span>
                            )}
                          </div>
                        </td>

                        {/* Copy / Action */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={(e) => handleCopy(cfg.originalUri, cfg.id, e)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition duration-150 inline-flex items-center"
                            title="کپی لینک مستقیم"
                          >
                            {copiedId === cfg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Detail Inspector Card (appears when selectedConfig is defined) */}
        {selectedConfig && (
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-850 shadow-lg space-y-5 flex flex-col justify-between max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    گره انتخابی ({selectedConfig.protocol})
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug mt-1.5 prune truncate max-w-[190px]">
                    {selectedConfig.name}
                  </h3>
                </div>
                <button
                  onClick={onCloseDetail}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition duration-150"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Server Parameters Matrix */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">آدرس سرور (Server Host):</span>
                  <span className="text-slate-200">{selectedConfig.server}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">پورت (Server Port):</span>
                  <span className="text-slate-200">{selectedConfig.port}</span>
                </div>
                {selectedConfig.uuidOrPassword && (
                  <div className="py-1 border-b border-slate-850">
                    <span className="text-slate-400 block mb-0.5">شناسه کاربری (UUID/Pass):</span>
                    <span className="text-slate-300 break-all bg-black/40 px-2 py-1 rounded block mt-1 text-[10px]">{selectedConfig.uuidOrPassword}</span>
                  </div>
                )}
                {selectedConfig.transport && (
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">نوع انتقال (Transport):</span>
                    <span className="text-slate-200 font-bold">{selectedConfig.transport}</span>
                  </div>
                )}
                {selectedConfig.path && (
                  <div className="py-1 border-b border-slate-850">
                    <span className="text-slate-400 block mb-0.5">مسیر مسیردهی (Path/Service):</span>
                    <span className="text-slate-300 break-all text-[11px] font-mono">{selectedConfig.path}</span>
                  </div>
                )}
                {selectedConfig.sni && (
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">شناسه گواهینامه (SNI):</span>
                    <span className="text-indigo-300 break-all">{selectedConfig.sni}</span>
                  </div>
                )}
                {selectedConfig.fingerprint && (
                  <div className="flex justify-between py-1 border-b border-slate-850">
                    <span className="text-slate-400">اثر انگشت uTLS:</span>
                    <span className="text-slate-200">{selectedConfig.fingerprint}</span>
                  </div>
                )}
                {selectedConfig.publicKey && (
                  <div className="py-1 border-b border-slate-850">
                    <span className="text-slate-400 block mb-0.5">کلید عمومی Reality (pbk):</span>
                    <span className="text-amber-200 break-all bg-black/40 px-2 py-1 rounded block text-[10px]">{selectedConfig.publicKey}</span>
                  </div>
                )}
              </div>

              {/* Computed Issues & Warnings inside detail card */}
              <div className="space-y-2 pt-2 text-xs">
                {selectedConfig.securityIssues.map((issue, idx) => (
                  <div key={idx} className="bg-red-500/10 text-red-300 p-2.5 rounded-xl border border-red-500/20 leading-relaxed flex gap-2">
                    <span className="text-sm">⚠️</span>
                    <span>{issue}</span>
                  </div>
                ))}
                {selectedConfig.securityStrengths.map((strength, idx) => (
                  <div key={idx} className="bg-emerald-500/10 text-emerald-300 p-2.5 rounded-xl border border-emerald-500/20 leading-relaxed flex gap-2">
                    <span className="text-sm">✅</span>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={(e) => handleCopy(selectedConfig.originalUri, selectedConfig.id, e)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl text-center text-xs font-semibold font-sans text-white transition duration-150 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>کپی رکوردهای پیوند مستقیم کانفیگ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
