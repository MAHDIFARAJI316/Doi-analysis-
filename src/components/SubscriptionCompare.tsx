import React, { useState } from 'react';
import { parseSubscription } from '../utils/parser';
import { VpnConfig } from '../types';
import { Split, GitCompare, LayoutGrid, CheckCircle, HelpCircle } from 'lucide-react';

export const SubscriptionCompare: React.FC = () => {
  const [subA, setSubA] = useState('');
  const [subB, setSubB] = useState('');
  const [configsA, setConfigsA] = useState<VpnConfig[]>([]);
  const [configsB, setConfigsB] = useState<VpnConfig[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = () => {
    const listA = parseSubscription(subA);
    const listB = parseSubscription(subB);
    setConfigsA(listA);
    setConfigsB(listB);
    setHasCompared(true);
  };

  // Aggregate metrics
  const getStats = (list: VpnConfig[]) => {
    const total = list.length || 1;
    const avgSec = Math.round(list.reduce((acc, c) => acc + c.securityScore, 0) / total);
    const avgQual = Math.round(list.reduce((acc, c) => acc + c.qualityScore, 0) / total);
    const countries = Array.from(new Set(list.map(c => c.geo?.countryCode))).length;
    
    const protosObj = list.reduce((acc, c) => {
      acc[c.protocol] = (acc[c.protocol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const dominantProto = Object.entries(protosObj).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total: list.length, avgSec, avgQual, countries, dominantProto };
  };

  const statsA = getStats(configsA);
  const statsB = getStats(configsB);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Split className="w-5 h-5 text-indigo-500" />
          مقایسه تطبیقی دو ساب‌اسکریپشن (Subscription Delta Comparison)
        </h3>
        <p className="text-xs text-slate-500 mt-1">تغییرات پروتکلی، ساختار کیفیت دیتاسنترها و سرورهای منقضی یا حذف شده را مقایسه کنید</p>
      </div>

      {/* Two Text Inputs for Sub URL / Text links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5Col">
          <label className="text-xs font-bold text-slate-600">پیوند یا کدهای ساب‌اسکریپشن اول (الف)</label>
          <textarea
            value={subA}
            onChange={(e) => setSubA(e.target.value)}
            placeholder="لینک base64 یا خطوط کانفیگ‌های آلفا را وارد کنید..."
            className="w-full h-24 p-3 text-[10px] font-mono bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:border-indigo-550 focus:bg-white resize-none"
          />
        </div>

        <div className="space-y-1.5Col">
          <label className="text-xs font-bold text-slate-600">پیوند یا کدهای ساب‌اسکریپشن دوم (ب)</label>
          <textarea
            value={subB}
            onChange={(e) => setSubB(e.target.value)}
            placeholder="لینک base64 یا خطوط کانفیگ‌های بتا را وارد کنید..."
            className="w-full h-24 p-3 text-[10px] font-mono bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:border-indigo-550 focus:bg-white resize-none"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCompare}
          disabled={!subA.trim() || !subB.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 shadow-sm"
        >
          <GitCompare className="w-4 h-4" />
          <span>مقایسه و موازنه الگوها</span>
        </button>
      </div>

      {hasCompared && (
        <div className="space-y-6 pt-4 border-t border-slate-100 animate-fade-in">
          
          {/* Side by Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stats Column A */}
            <div id="stats-a-box" className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-indigo-700">ساب‌اسکریپشن آلفا (آرشیو الف)</h4>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold font-mono">
                  {statsA.total} سرور فعال
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">میانگین امتیاز امنیت</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">🛡️ {statsA.avgSec} / ۱۰۰</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">میانگین کیفیت لود</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">⚡ {statsA.avgQual} / ۱۰۰</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">تنوع دیتاسنترها</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{statsA.countries} کشور مختلف</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">پروتکل حاکم</span>
                  <span className="font-sans font-bold text-indigo-700 text-sm">{statsA.dominantProto}</span>
                </div>
              </div>
            </div>

            {/* Stats Column B */}
            <div id="stats-b-box" className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-emerald-700">ساب‌اسکریپشن بتا (آرشیو ب)</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-mono">
                  {statsB.total} سرور فعال
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">میانگین امتیاز امنیت</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">🛡️ {statsB.avgSec} / ۱۰۰</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">میانگین کیفیت لود</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">⚡ {statsB.avgQual} / ۱۰۰</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">تنوع دیتاسنترها</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{statsB.countries} کشور مختلف</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1">پروتکل حاکم</span>
                  <span className="font-sans font-bold text-emerald-700 text-sm">{statsB.dominantProto}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Differential Verdict Indicator */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="text-xs text-slate-700">
              <h5 className="font-bold text-indigo-900">نتیجه تفاوت ساختاری (Verdict)</h5>
              <p className="mt-1 font-medium leading-relaxed">
                {statsB.avgQual > statsA.avgQual 
                  ? `ساب‌اسکریپشن بتا (ب) با میانگین لود ${statsB.avgQual} از راندمان سرعت و پایداری بهتری به سوی ایران برخوردار است.` 
                  : `ساب‌اسکریپشن آلفا (الف) پایداری به مراتب بیشتری در برابر مسدودسازی متوالی پورت‌ها داراست.`}
                {` همچنین توزیع بین‌المللی ساب ${statsB.countries > statsA.countries ? 'بتا' : 'آلفا'} تنوع بیپسینگ به مراتب بالاتری را مهیا می‌سازد.`}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
