import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, CheckCircle } from 'lucide-react';

interface ReplicationGuideCardProps {
  guide: {
    stepByStep: string[];
    sampleConfigYaml: string;
    sampleConfigJson: string;
  };
}

export const ReplicationGuideCard: React.FC<ReplicationGuideCardProps> = ({ guide }) => {
  const [copiedType, setCopiedType] = useState<'yaml' | 'json' | null>(null);

  const handleCopyCode = (text: string, type: 'yaml' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Step by step instructions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-1 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-500" />
              مراحل گام‌به‌گام بازتولید
            </h4>
            <p className="text-xs text-slate-500 mt-1">دستورالعمل چیدمان و همسان‌سازی کانفیگ مشابه با درصد کارکرد حداکثری</p>
          </div>

          <ol className="space-y-3.5 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
            {guide.stepByStep.map((step, idx) => (
              <li key={idx} className="pl-1">
                <span className="font-sans text-slate-800 leading-relaxed font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Right Columns: Copyable Template Codes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Clash Core Template */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold font-sans">کدهای الگو فرمت بازتولید کلش (Clash / Clash Meta)</span>
              </div>
              <button
                onClick={() => handleCopyCode(guide.sampleConfigYaml, 'yaml')}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 rounded-md font-sans font-medium text-slate-300 transition duration-150 flex items-center gap-1.5"
              >
                {copiedType === 'yaml' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی کد الگو</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto text-slate-300 bg-black/40 p-3 rounded-lg max-h-[160px]">
              {guide.sampleConfigYaml}
            </pre>
          </div>

          {/* Sing-box Core Template */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-sans">کدهای الگو فرمت بازتولید سینگ‌باکس (Sing-box JSON)</span>
              </div>
              <button
                onClick={() => handleCopyCode(guide.sampleConfigJson, 'json')}
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700/80 rounded-md font-sans font-medium text-slate-300 transition duration-150 flex items-center gap-1.5"
              >
                {copiedType === 'json' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی کد الگو</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto text-slate-300 bg-black/40 p-3 rounded-lg max-h-[160px]">
              {guide.sampleConfigJson}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
