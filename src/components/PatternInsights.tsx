import React from 'react';
import { PatternAnalysisResult } from '../types';
import { Network, Terminal, Shield, Sparkles, Hash, Eye, Award } from 'lucide-react';

interface PatternInsightsProps {
  patterns: PatternAnalysisResult;
}

export const PatternInsights: React.FC<PatternInsightsProps> = ({ patterns }) => {
  return (
    <div className="space-y-6">
      {/* Bento Grid layout summarizing patterns mined */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Naming Pattern */}
        <div id="pattern-naming" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-500" />
              <h4 className="text-sm font-bold text-slate-900">الگوی الگوریتم نام‌گذاری</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {patterns.naming.patternDescription}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ثبت ایموجی کشورها: {patterns.naming.emojiConsistency >= 7 ? '✅ متوالی همسان' : '❌ نامتقارن'}</span>
            <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
              امتیاز ثبات: {patterns.naming.overallConsistencyScore}/۱۰
            </span>
          </div>
        </div>

        {/* Card 2: Infrastructure Strategy */}
        <div id="pattern-infra" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
            <Network className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-900">زیرساخت اختصاص آی‌پی و پورت</h4>
          </div>
          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">استراتژی تخصیص آی‌پی:</span>
              <p className="font-medium text-slate-800 leading-relaxed">{patterns.infrastructure.ipStrategy}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">پترن تخصیص پورت‌ها:</span>
              <p className="font-medium text-slate-800 leading-relaxed">{patterns.infrastructure.portAllocation}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Provider Profile */}
        <div id="pattern-provider" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-50">
            <Award className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-900">پروفایل و تیپ پیکربندی عرضه‌کننده</h4>
          </div>
          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">سبک پیاده‌سازی زیرساخت:</span>
              <span className={`inline-block px-2.5 py-0.5 mt-1 rounded text-[10px] font-bold ${
                patterns.provider.style === 'Professional' ? 'bg-emerald-50 text-emerald-700' :
                patterns.provider.style === 'Amateur' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
              }`}>
                {patterns.provider.style === 'Professional' ? 'حرفه‌ای و ساختاریافته' : 'آماتور / ناپایدار'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">محدوده اصلی دیتاسنترها:</span>
              <p className="font-medium text-slate-800 leading-relaxed">{patterns.provider.geoFocus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Deep Protocol Technology Mined */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="space-y-1 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
            تکنیک‌های مبهم‌سازی فعال (Obfuscation & Evasion Dynamics)
          </h3>
          <p className="text-xs text-slate-500">تحلیل عمیق روش‌های گریز از بسته‌رسی DPI فعال در سرورهای موجود</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: TLS / SNI strategy */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4.5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">استراتژی و الگوی TLS / SNI</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {patterns.tls.sniStrategy}
              </p>
              <div className="text-[11px] text-indigo-700 font-medium">
                اثر انگشت شبیه‌ساز (uTLS): {patterns.tls.fingerprintStrategy}
              </div>
            </div>

            {/* Path and Entropy */}
            <div className="bg-slate-50 p-4.5 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">الگوهای اختصاصی نوع ترابری (Transport)</h4>
              </div>
              <div className="text-xs text-slate-600 space-y-2">
                <p><strong>ترابری وب‌سوکت:</strong> {patterns.transport.wsPattern || 'فاقد اطلاعات'}</p>
                <p><strong>سازوکار gRPC:</strong> {patterns.transport.grpcPattern || 'فاقد اطلاعات'}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Anti-detection and DPI evasion */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4.5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">شبیه‌سازی ترافیک (Traffic Mimicking)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {patterns.obfuscation.trafficMimicking}
              </p>
            </div>

            <div className="bg-slate-50 p-4.5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">تکنیک بکارگیری سرورهای مرزی (CDNs)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {patterns.obfuscation.cdnUsage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
