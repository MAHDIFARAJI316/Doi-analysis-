import React, { useState, useEffect } from 'react';
import { parseSubscription, generateSampleSubscription } from './utils/parser';
import { VpnConfig, AnalysisResponse, ExecutiveSummary, PatternAnalysisResult, BestPracticeRecommendation } from './types';
import { DashboardOverview } from './components/DashboardOverview';
import { ServerListTable } from './components/ServerListTable';
import { PatternInsights } from './components/PatternInsights';
import { ReplicationGuideCard } from './components/ReplicationGuideCard';
import { CensorshipTroubleshooter } from './components/CensorshipTroubleshooter';
import { SubscriptionCompare } from './components/SubscriptionCompare';
import { 
  Network, 
  Sparkles, 
  TableProperties, 
  Terminal, 
  RefreshCw, 
  Cpu, 
  Upload, 
  HelpCircle, 
  SlidersHorizontal,
  FileSpreadsheet,
  Split,
  Database,
  Info
} from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [configs, setConfigs] = useState<VpnConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<VpnConfig | null>(null);
  
  // Dashboard, Insights, and Replication Data
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<BestPracticeRecommendation[]>([]);
  const [replicationGuide, setReplicationGuide] = useState<AnalysisResponse['replicationGuide'] | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inspector' | 'patterns' | 'replication' | 'troubleshoot' | 'compare'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyMock, setIsApiKeyMock] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Auto trigger analysis on configs import
  const triggerAnalysis = async (parsed: VpnConfig[], raw: string) => {
    if (parsed.length === 0) return;
    setIsLoading(true);
    setLoadingStep('در حال شکست و بازیابی لایه‌های رمزگذاری...');
    
    // Simulate high tech parsing steps visually
    setTimeout(() => {
      setLoadingStep('در حال کشف الگوهای نام‌گذاری و ثبات معماری سیستم...');
    }, 800);
    setTimeout(() => {
      setLoadingStep('در حال تحلیل الگوریتم فرار از کنترل فعال DPI...');
    }, 1500);

    try {
      const response = await fetch('/api/analyze-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: parsed, rawInput: raw })
      });

      if (!response.ok) {
        throw new Error('سیستم آنالیز موقتاً با مشکل روبرو شد.');
      }

      const data: AnalysisResponse & { isMock?: boolean } = await response.json();
      
      setSummary(data.summary);
      setPatternAnalysis(data.patternAnalysis);
      setRecommendations(data.recommendations);
      setReplicationGuide(data.replicationGuide);
      setIsApiKeyMock(!!data.isMock);
    } catch (error) {
      console.error('Failed calling pattern intelligence API', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!inputText.trim()) return;
    const parsed = parseSubscription(inputText);
    setConfigs(parsed);
    setSelectedConfig(null);
    triggerAnalysis(parsed, inputText);
  };

  const handleLoadSamples = () => {
    const samples = generateSampleSubscription();
    setInputText(samples);
    const parsed = parseSubscription(samples);
    setConfigs(parsed);
    setSelectedConfig(null);
    triggerAnalysis(parsed, samples);
  };

  // Drag and drop setup for configuration file upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setInputText(text);
          const parsed = parseSubscription(text);
          setConfigs(parsed);
          setSelectedConfig(null);
          triggerAnalysis(parsed, text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClean = () => {
    setInputText('');
    setConfigs([]);
    setSelectedConfig(null);
    setSummary(null);
    setPatternAnalysis(null);
    setRecommendations([]);
    setReplicationGuide(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans select-none antialiased selection:bg-indigo-500 selection:text-white pb-10">
      
      {/* Visual background gradient accents */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-50/50 via-slate-50/0 to-slate-50/0 pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Navigation & Brand Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Cpu className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">VConfig Pattern Analyzer</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">پلتفرم پیشرفته مهندسی معکوس، واکاوی الگو و عیب‌یابی پیکربندی‌های پروکسی و VPN</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSamples}
              className="text-xs font-sans font-bold bg-white hover:bg-slate-50 border border-slate-205 py-2 px-3.5 rounded-xl transition duration-150 text-slate-700 flex items-center gap-1.5 shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>بارگذاری نمونه کانفیگ‌های ضد فیلتر</span>
            </button>
            {configs.length > 0 && (
              <button
                onClick={handleClean}
                className="text-xs font-sans font-semibold bg-red-50 hover:bg-red-100/80 text-red-700 py-2 px-3.5 rounded-xl transition duration-150 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>پاکسازی نتایج</span>
              </button>
            )}
          </div>
        </header>

        {/* Input area / Paste Subscription */}
        {configs.length === 0 ? (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`bg-white p-8 rounded-3xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center min-h-[380px] text-center space-y-6 ${
              dragActive ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200'
            }`}
          >
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h2 className="text-base font-extrabold text-slate-900">وارد کردن یا دراپ فایل ساب‌اسکریپشن</h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                کدهای ساب‌اسکریپشن (بیس۶۴)، پیوند‌های مستقیم پروتکل‌های VLESS، VMess، Trojan، Shadowsocks و یا فایل متنی حاوی کانفیگ‌ها را در فضای زیر بیاندازید یا کپی کنید.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="vless://...&#10;vmess://...&#10;پیوندهای مستقیم را به تفکیک خط اینجا در میان بگذارید..."
                className="w-full h-32 p-4 text-xs font-mono bg-slate-50 border border-slate-150 rounded-2xl focus:outline-none focus:border-indigo-550 focus:bg-white transition-all duration-150 resize-none text-slate-700"
              />
              <button
                onClick={handleImport}
                disabled={!inputText.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold py-3.5 rounded-2xl transition duration-150 shadow-sm shadow-indigo-200/50"
              >
                شروع پردازش و استخراج الگوهای پروتکلی
              </button>
            </div>
          </div>
        ) : (
          /* Main Dashboard zone once configurations are imported */
          <div className="space-y-6">
            
            {/* Adviser alert stating server-key status and proxy proxy limits */}
            {isApiKeyMock && (
              <div className="bg-amber-50 border border-amber-100 p-4.5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-900 text-xs">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="font-semibold leading-relaxed">
                    کلید اختصاصی هوش مصنوعی (GEMINI_API_KEY) شناسایی نشد. تحلیل الگوها در حال حاضر با سیستم پردازش مهندسی معکوس خطی محلی انجام پذیرفت.
                  </p>
                </div>
                <div className="text-[10px] bg-amber-100 text-amber-800 px-3 py-1 rounded-lg font-bold select-none shrink-0 text-center font-sans">
                  برای تحلیل‌های معنایی پیشرفته کلید جمینی را در کادر Secrets لود کنید
                </div>
              </div>
            )}

            {/* Configs Stats Mini Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                <p className="text-xs text-slate-600 font-medium">
                  پایگاه داده لود شده: <strong className="text-slate-900 font-extrabold">{configs.length} سرور</strong> فعال و پردازش شده.
                </p>
              </div>

              {/* Stateful Mode tabs */}
              <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs overflow-x-auto select-none max-w-full">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition duration-150 ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  داشبورد تحلیلی
                </button>
                <button
                  onClick={() => setActiveTab('inspector')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition duration-150 ${activeTab === 'inspector' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  بازرس کدهای گره منفرد
                </button>
                <button
                  onClick={() => setActiveTab('patterns')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition duration-150 ${activeTab === 'patterns' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  استخراج الگوهای امنیتی
                </button>
                <button
                  onClick={() => setActiveTab('replication')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition duration-150 ${activeTab === 'replication' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  طرح بازتولید مشابه
                </button>
                <button
                  onClick={() => setActiveTab('troubleshoot')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition duration-150 ${activeTab === 'troubleshoot' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  هوش کلاینت (چت)
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition duration-150 ${activeTab === 'compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  مقایسه تطبیقی
                </button>
              </nav>
            </div>

            {/* TAB CONTENTS */}
            <main className="transition-all duration-300">
              
              {/* Tab 1: Dashboard Overview */}
              {activeTab === 'dashboard' && summary && (
                <DashboardOverview
                  configs={configs}
                  summary={summary}
                  onSelectConfig={(cfg) => {
                    setSelectedConfig(cfg);
                    setActiveTab('inspector');
                  }}
                />
              )}

              {/* Tab 2: Server Inspector */}
              {activeTab === 'inspector' && (
                <ServerListTable
                  configs={configs}
                  selectedConfig={selectedConfig}
                  onSelectConfig={(cfg) => setSelectedConfig(cfg)}
                  onCloseDetail={() => setSelectedConfig(null)}
                />
              )}

              {/* Tab 3: Pattern Mining Insights */}
              {activeTab === 'patterns' && patternAnalysis && (
                <PatternInsights patterns={patternAnalysis} />
              )}

              {/* Tab 4: Config Replication Guide */}
              {activeTab === 'replication' && replicationGuide && (
                <ReplicationGuideCard guide={replicationGuide} />
              )}

              {/* Tab 5: Expert troubleshooter (chat) */}
              {activeTab === 'troubleshoot' && (
                <CensorshipTroubleshooter contextConfigs={configs} />
              )}

              {/* Tab 6: Comparison Mode */}
              {activeTab === 'compare' && (
                <SubscriptionCompare />
              )}

            </main>
          </div>
        )}

      </div>

      {/* Modern analysis loading screen overlap */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center justify-items-center z-50 animate-fade-in content-center">
          <div className="bg-white p-8 rounded-3xl max-w-sm text-center flex flex-col items-center gap-4.5 shadow-xl border border-slate-100">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20 animate-ping"></span>
              <span className="p-3 bg-indigo-600 text-white rounded-2xl">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">در حال مهندسی معکوس الگوهای پروکسی...</h4>
              <p className="text-xs text-slate-400 font-medium px-4">
                {loadingStep || 'شکست هدرهای ترابری و تحلیل لایه‌های TLS اینترنت ایران...'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
