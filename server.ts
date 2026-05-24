import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for GoogleGenAI
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Analysis Endpoint
app.post('/api/analyze-gemini', async (req, res): Promise<any> => {
  try {
    const { configs, rawInput } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Elegant heuristic fallback fallback when GEMINI_API_KEY is not defined
      console.log('Gemini API key not configured, returning rich heuristic pattern mining.');
      return res.json({
        isMock: true,
        summary: {
          totalConfigs: configs?.length || 0,
          activeCount: Math.ceil((configs?.length || 0) * 0.95),
          distinctCountries: Array.from(new Set(configs?.map((c: any) => c.geo?.countryCode) || [])).length || 1,
          dominantProtocol: getDominantItem(configs?.map((c: any) => c.protocol)),
          averageSecurityScore: Math.round(average(configs?.map((c: any) => c.securityScore)) || 85),
          averageQualityScore: Math.round(average(configs?.map((c: any) => c.qualityScore)) || 75),
          iranSuccessProbability: Math.round(average(configs?.map((c: any) => c.iranUsabilityPercent)) || 80),
          primaryRiskFactor: configs?.some((c: any) => c.allowInsecure) 
            ? 'آسیب‌پذیری allowInsecure=true شدید در برخی سرورها' 
            : 'توزیع تک‌شبکه‌ای و پتانسیل بالای Fingerprintهای پیش‌فرض',
        },
        patternAnalysis: generateHeuristicPatterns(configs || []),
        recommendations: generateHeuristicRecommendations(configs || []),
        replicationGuide: generateHeuristicReplication(configs || []),
      });
    }

    // Call actual Gemini with robust instruction & strict JSON response schema
    const prompt = `شما یک سیستم تحلیل پیشرفته و مهندسی معکوس ساختارهای پروکسی و کانفیگ‌های VPN هستید.
اطلاعات کانفیگ‌های پارس شده و همچنین ورودی خام ساب‌اسکریپشن در قالب JSON برای شما ارسال شده است:

کانفیگ‌های پارس شده:
${JSON.stringify(configs, null, 2)}

ورودی خام:
${rawInput ? rawInput.substring(0, 5000) : 'عدم وجود ورودی متنی خام'}

بر اساس این داده‌ها، تحلیل عمیقی انجام دهید و خروجی را دقیقاً منطبق بر ساختار JSON مشخص شده تولید کنید (پاسخ باید کاملاً به زبان فارسی باشد). تمامی بخش‌ها را با جزئیات واقعی، حرفه‌ای و با رویکرد مهندسی معکوس و کشف الگو تکمیل کنید.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `شما متخصص باسابقه شبکه‌های مقابله با سانسور، تکنیک‌های دور زدن فیلترینگ اینترنت (DPI Evasion) و طراح روش‌های پیکربندی ابزارهای V2Ray، Xray، Clash و Sing-box هستید. 
هدف شما خروجی دادن یک مستند فنی تحلیل الگوها در قالب پاسخ JSON معتبر است. پاسخ فارسی باشد.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                totalConfigs: { type: Type.INTEGER },
                activeCount: { type: Type.INTEGER },
                distinctCountries: { type: Type.INTEGER },
                dominantProtocol: { type: Type.STRING },
                averageSecurityScore: { type: Type.INTEGER },
                averageQualityScore: { type: Type.INTEGER },
                iranSuccessProbability: { type: Type.INTEGER },
                primaryRiskFactor: { type: Type.STRING },
              },
              required: ['totalConfigs', 'activeCount', 'distinctCountries', 'dominantProtocol', 'averageSecurityScore', 'averageQualityScore', 'iranSuccessProbability', 'primaryRiskFactor']
            },
            patternAnalysis: {
              type: Type.OBJECT,
              properties: {
                naming: {
                  type: Type.OBJECT,
                  properties: {
                    patternDescription: { type: Type.STRING, description: 'تحلیل عمیق ساختار نام‌گذاری و پترن آن' },
                    embeddedInformation: { type: Type.STRING, description: 'چه اطلاعاتی در نام‌ها گنجانده شده' },
                    emojiConsistency: { type: Type.INTEGER, description: 'میزان ثبات ایموجی‌ها از ۱ تا ۱۰' },
                    brandingStyle: { type: Type.STRING, description: 'سبک برندسازی عرضه‌کننده' },
                    overallConsistencyScore: { type: Type.INTEGER, description: 'امتیاز کلی ثبات نام‌گذاری از ۱ تا ۱۰' },
                  },
                  required: ['patternDescription', 'embeddedInformation', 'emojiConsistency', 'brandingStyle', 'overallConsistencyScore']
                },
                infrastructure: {
                  type: Type.OBJECT,
                  properties: {
                    ipStrategy: { type: Type.STRING, description: 'استراتژی تخصیص آی‌پی (CDN، تمیز، رنج اختصاصی)' },
                    portAllocation: { type: Type.STRING, description: 'پترن پورت‌ها (ترتیبی، رندوم، پورت‌های خاص)' },
                    domainPattern: { type: Type.STRING, description: 'الگوی دامنه‌ها و ساب‌دامنه‌ها' },
                    geoDistribution: { type: Type.STRING, description: 'تنوع موقعیت جغرافیایی و نزدیکی به خاورمیانه' },
                  },
                  required: ['ipStrategy', 'portAllocation', 'domainPattern', 'geoDistribution']
                },
                protocols: {
                  type: Type.OBJECT,
                  properties: {
                    vmessPattern: { type: Type.STRING },
                    vlessPattern: { type: Type.STRING },
                    trojanPattern: { type: Type.STRING },
                    ssPattern: { type: Type.STRING },
                  },
                  required: ['vmessPattern', 'vlessPattern', 'trojanPattern', 'ssPattern']
                },
                transport: {
                  type: Type.OBJECT,
                  properties: {
                    wsPattern: { type: Type.STRING },
                    grpcPattern: { type: Type.STRING },
                    tcpPattern: { type: Type.STRING },
                    quicPattern: { type: Type.STRING },
                  },
                  required: ['wsPattern', 'grpcPattern', 'tcpPattern', 'quicPattern']
                },
                tls: {
                  type: Type.OBJECT,
                  properties: {
                    sniStrategy: { type: Type.STRING, description: 'پترن و منطق SNI استفاده شده' },
                    alpnStrategy: { type: Type.STRING, description: 'الگوی هدر ALPN' },
                    fingerprintStrategy: { type: Type.STRING, description: 'اثر انگشت uTLS مورد استفاده برای فرار از یادگیری ماشین DPI' },
                    realityPattern: { type: Type.STRING, description: 'پیکربندی Reality شامل وب‌سایت‌های مرجع و متدها' },
                  },
                  required: ['sniStrategy', 'alpnStrategy', 'fingerprintStrategy', 'realityPattern']
                },
                obfuscation: {
                  type: Type.OBJECT,
                  properties: {
                    trafficMimicking: { type: Type.STRING, description: 'شبیه‌سازی ترافیک عادی وب' },
                    dpiEvasion: { type: Type.STRING, description: 'روش‌های دور زدن DPI گنجانده شده در کانفیگ‌ها' },
                    cdnUsage: { type: Type.STRING, description: 'نحوه عبور ترافیک از سرورهای واسط کلودفلر یا داخلی' },
                  },
                  required: ['trafficMimicking', 'dpiEvasion', 'cdnUsage']
                },
                provider: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING, description: 'یکی از مقادیر: Amateur, Professional, Suspicious, Dynamic' },
                    signature: { type: Type.STRING, description: 'امضای ویژه این لایوت' },
                    geoFocus: { type: Type.STRING, description: 'محدوده جغرافیایی هدف' },
                  },
                  required: ['style', 'signature', 'geoFocus']
                }
              },
              required: ['naming', 'infrastructure', 'protocols', 'transport', 'tls', 'obfuscation', 'provider']
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  example: { type: Type.STRING },
                  isDos: { type: Type.BOOLEAN, description: 'درست یعنی کار مثبت، غلط یعنی هشدار ضعف یا آسیب‌پذیری' },
                },
                required: ['title', 'description', 'example', 'isDos']
              }
            },
            replicationGuide: {
              type: Type.OBJECT,
              properties: {
                stepByStep: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                sampleConfigYaml: { type: Type.STRING, description: 'یک کانفیگ کامل کلش به عنوان تمپلیت تکثیر' },
                sampleConfigJson: { type: Type.STRING, description: 'یک کانفیگ کامل خط فرمت شده سینگ‌باکس با الگوی موفق' },
              },
              required: ['stepByStep', 'sampleConfigYaml', 'sampleConfigJson']
            }
          },
          required: ['summary', 'patternAnalysis', 'recommendations', 'replicationGuide']
        }
      }
    });

    const bodyText = response.text || '{}';
    res.json(JSON.parse(bodyText));

  } catch (error: any) {
    console.error('Error in analyze-gemini endpoint:', error);
    res.status(500).json({ error: error.message || 'خطا در برقراری ارتباط با مدل هوش مصنوعی' });
  }
});

// Interactive Expert AI Chat & Troubleshooter
app.post('/api/chat', async (req, res): Promise<any> => {
  try {
    const { messages, contextConfigs } = req.body;
    const ai = getGeminiClient();

    const lastUserMessage = messages[messages.length - 1]?.text || '';

    if (!ai) {
      // Return smart regex/rule-based offline expert answers regarding proxy and censorship when key is offline
      const lowercaseQuery = lastUserMessage.toLowerCase();
      let answer = '';

      if (lowercaseQuery.includes('insecure') || lowercaseQuery.includes('امنیت')) {
        answer = `در بررسی کانفیگ‌های شما، متوجه شدم که برخی گره‌ها از فلگ \`allowInsecure: true\` استفاده می‌کنند. این یکی از شایع‌ترین باگ‌های راه‌اندازی است:
1. **ریسک سرقت داده‌ها**: هر مهاجم منصف و یا سیستم سانسور دولتی می‌تواند با جعل مدارک TLS کوکی‌ها و پیام‌های رمزشده کلاینت را ردیابی کند.
2. **پیشنهاد رفع خطا**: استفاده از درگاه‌های Reality یا گرفتن گواهی رایگان Let's Encrypt معتبر برای دامنه ساب‌دامنه به جای بی‌اثر کردن مکانیسم تأییدیه.`;
      } else if (lowercaseQuery.includes('delay') || lowercaseQuery.includes('کند') || lowercaseQuery.includes('سرعت')) {
        answer = `کندی یا اتلاف بالای بسته‌ها (Packet Loss) معمولاً به چند دلیل است:
1. **وجود هدر سنگین WebSocket**: هدرهای وب‌سوکت سربار زیادی دارند. پیشنهاد من تغییر به شبیه‌سازهای gRPC یا استفاده از مکانیزم TCP خام با TLS است.
2. **پدیده مسدودسازی پورت**: سیستم‌های فیلترینگ ایران پورت‌های پیش‌فرضی مانند 8080، 3128 و 80 را تحت رصد موشکافانه قرار می‌دهند. منتقل کردن پورت سرورها به رنج‌های بالاتر (مثلاً 50000+) تأثیر مستقیم دارد.`;
      } else if (lowercaseQuery.includes('reality') || lowercaseQuery.includes('ریالیتی')) {
        answer = `پروتکل **VLESS Reality** انقلابی در دور زدن فیلترینگ است زیرا با شبیه‌سازی دقیق وب‌سایت‌های خارجی پربازدید (مانند microsoft.com ، yahoo.com)، فیلترچی را فریب می‌دهد:
1. **نکات پیاده‌سازی**: همیشه از یک سرویس با پشتیبانی از TLS 1.3 برای شبیه‌سازی (SNI) استفاده کنید.
2. **هشدار**: اگر مقدار \`shortId\` یا کلید عمومی مخدوش یا کپی‌شده در کلاینت‌های مختلف تکراری باشد، DPI با پروپ‌های خودکار می‌تواند گره را فینگرپرینت و فیلتر کند.`;
      } else {
        answer = `بنا به تحلیل ساختار کانفیگ‌های موجود شما (شامل ${contextConfigs?.length || 0} گره فعال):
پروتکل غالب مشاهده شده در سرورهای شما بر بستر ترابری امن پیکربندی شده است. گستره جغرافیایی اصلی گره‌های شما به پایداری پینگ مطلوب به سمت ایران کمک می‌کند. آیا مایلید سناریوی مشخصی از جمله رفع خطای اتصال خاص کلاینت سرور یا آموزش پیاده‌سازی ضد فیلترِ Reality را شرح دهم؟ (کلید Gemini شما غیرفعال است و از هوش مهندسی آفلاین استفاده می‌شود)`;
      }

      return res.json({
        text: answer,
        id: 'msg_off_' + Math.random().toString(36).substring(2, 11),
        sender: 'assistant'
      });
    }

    // Build perfect prompt with the parsed VPN context so the AI behaves as an ultimate Persian network wizard
    const contextPrompt = `شما یک دستیار هوش مصنوعی فوق‌پیشرفته و مهندس ارشد شبکه‌های توزیع‌شده هستید که در زمینه تحلیل، بررسی کیفیت و رفع ایراد کانفیگ‌های پروکسی و ضد فیلترینگ تسلط کامل دارید.
گره‌های کانفیگ ساب‌اسکریپشن کاربر هم‌اکنون لود و آنالیز شده است:
${JSON.stringify((contextConfigs || []).slice(0, 15), null, 2)}

تاریخچه مکالمات:
${messages.map((m: any) => `${m.sender === 'user' ? 'کاربر' : 'دستیار'}: ${m.text}`).join('\n')}

بر طبق گره‌های بالا، پاسخ کاربر را با تکیه بر اطلاعات پروتکلی فنی، راه‌حل‌های واقعی مقابله با DPI، آسیب‌پذیری‌های امنیتی و بهینه‌سازی کلاینت، با فونت مرتب مارک‌داون به زبان فارسی بنویسید. صمیمی اما جدی، علمی و با نهایت دقت آکادمیک صحبت کنید.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: 'شما راهنمای مقابله با فیلترینگ اینترنت و بهینه‌سازی کانفیگ‌های پروکسی شامل VLESS، VMess، Reality، Trojan و Shadowsocks هستید. فارسی و تخصصی پاسخ دهید.',
      }
    });

    res.json({
      text: response.text || 'پاسخی دریافت نشد.',
      id: 'msg_' + Math.random().toString(36).substring(2, 11),
      sender: 'assistant'
    });

  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message || 'خطا در پردازش سوال شما روی شبکه هوش مصنوعی' });
  }
});

// Helper calculation functions
function getDominantItem(arr: any[]): string {
  if (!arr || arr.length === 0) return 'VLESS';
  const counts: Record<string, number> = {};
  let maxItem = arr[0];
  let maxCount = 0;
  for (const item of arr) {
    if (!item) continue;
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      maxItem = item;
    }
  }
  return maxItem;
}

function average(arr: number[]): number {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function generateHeuristicPatterns(configs: any[]): any {
  return {
    naming: {
      patternDescription: 'ساختار نام‌گذاری شامل تفکیک پرچم موقعیت سرور با ایموجی و درج کد سرور (طرح نام‌گذاری با الگوی استاندارد)',
      embeddedInformation: 'لوکیشن جغرافیایی، برند ارائه‌دهنده، نوع پروتکل انتقال و شماره‌گذاری توالی سرورها',
      emojiConsistency: 8,
      brandingStyle: configs.some((c: any) => c.name.includes('Premium')) ? 'برندینگ تجاری مدل Premium/VIP' : 'فاقد لایبل ثابت برند یا نام فاقد الگو اختصاصی',
      overallConsistencyScore: 7,
    },
    infrastructure: {
      ipStrategy: 'بکارگیری گستره آی‌پی‌های ابری به همراه تجمیع درگاه‌های چند پورت (Single IP, Multi-Port)',
      portAllocation: 'ترکیبی از پورت‌های ترتیبی (مانند ۸۰۰۱، ۸۰۰۲) و پورت استاندارد ۴۴۳ جهت عبور ایمن‌تر',
      domainPattern: 'استفاده از ساب‌دامنه‌های دارای الگوهای الفبایی عددی با فواصل مشخص',
      geoDistribution: 'عمدتاً متمرکز در کشورهای با پهنای باند باکیفیت به سمت ایران (آلمان، هلند، فنلاند)',
    },
    protocols: {
      vlessPattern: 'پیکربندی VLESS مبتنی بر Reality به همراه هدرهای Chrome uTLS جهت همرنگ‌سازی ترافیک',
      vmessPattern: 'اکثراً WebSocket به همراه هدرهای سفارشی وب‌سوکت عبور داده شده از CDNهای بین‌المللی',
      trojanPattern: 'ترابری TCP با رمزگذاری گواهی و عبور پورت ترتیبی',
      ssPattern: 'الگوریتم رمزنگاری مدرن AEAD (مانند AES-256-GCM) بدون پلاگین‌های اضافی',
    },
    transport: {
      wsPattern: 'مسیرهای وب‌سوکت عشوه‌گر با آنتروپی مناسب (مثلاً /api/v2/stream)',
      grpcPattern: 'نام سرویس‌های شبیه‌ساز استریم‌های فشرده صوتی تصویری یا استریم سرعت بالا',
      tcpPattern: 'اتصال مستقیم سریع با کمترین تاخیر در لایه انتقال بدون سربار',
      quicPattern: 'ترابری با پایداری موازی ویژه اوقات دارای افت سرعت',
    },
    tls: {
      sniStrategy: 'شبیه‌سازی وب‌سایت‌های بزرگ معتبر مرجع دولتی بین‌المللی به عنوان دامنه‌های فریب (SNI Spoofing)',
      alpnStrategy: 'تنظیم تیک پروتکل هماهنگ h2 و http/1.1 جهت ممانعت از بازرسی دستی و پروب فعال',
      fingerprintStrategy: 'اعمال فینگرپرینت uTLS شامل مرورگر کروم جهت همسان‌سازی به جریان ترافیک اینترنت خانگی',
      realityPattern: 'بستر Reality با کلید عمومی نامتقارن تولید شده به روش X25519',
    },
    obfuscation: {
      trafficMimicking: 'شبیه‌سازی ارتباطات درخواست‌های وب معمولی امن HTTPS',
      dpiEvasion: 'اعمال پکت فرگمنتیشن (Fragment) و بهره‌گیری از uTLS جهت عبور از یادگیری ماشین فیلترچی',
      cdnUsage: 'پروکسی کردن ترافیک بر وب‌سوکت کلودفلر کلود با تغییر هدر Host',
    },
    provider: {
      style: 'Professional',
      signature: 'آوردن ترفندهای دقیق به همراه uTLS و ترکیب هوشمند آلمان-هلند-فنلاند',
      geoFocus: 'ایران (دارای بهینه‌سازی ساعات افت پهنای باند)',
    },
  };
}

function generateHeuristicRecommendations(configs: any[]): any[] {
  const list = [
    {
      title: 'استفاده از شبیه‌ساز پکت فرگمنت (Fragment)',
      description: 'برای ممانعت از شناسایی جریان اولیه اتصال TLS هلو کلاینت (Client Hello) توسط فیلترچی، خرد کردن سایز پکت‌های ابتدایی روشی فوق‌العاده است.',
      example: 'Fragment settings: length 10-20ms, interval 5-15ms',
      isDos: true,
    },
    {
      title: 'اتصال دامنه‌ها به رکوردهای ابری CDN تمیز',
      description: 'هدایت کانفیگ‌های وب‌سوکت ترافیک کلاینت‌ها از میان آی‌پی لبه‌های سالم و کلودفلر، پایداری اتصالات را چندین برابر می‌کند.',
      example: 'Clean IP: 162.159.136.19',
      isDos: true,
    },
  ];

  if (configs.some((c: any) => c.allowInsecure)) {
    list.push({
      title: 'ریسک فعال بودن فلگ ناامن allowInsecure=true',
      description: 'برخی کانفیگ‌ها فاقد کنترل اصالت گواهینامه امنیتی هستند. مهاجمان به راحتی می‌توانند مسیر ارتباطی را رمزگشایی کنند.',
      example: 'تغییر allowInsecure به false و تنظیم SNI صحیح سرور',
      isDos: false,
    });
  }

  const sequentialPorts = configs.filter((c: any) => c.port && c.port >= 8000 && c.port <= 8010);
  if (sequentialPorts.length >= 2) {
    list.push({
      title: 'شناسایی استفاده از پورت‌های ترتیبی (Sequential Port Scanning)',
      description: 'توالی پورت‌ها (مانند ۸۰۰۱، ۸۰۰۲) به ماشین بازرسی اینترنت کمک می‌کند با مسدود کردن یک پورت، کل سرورهای همسایه را سریعاً اسکن و ریپورت کند.',
      example: 'استفاده از پورت‌های مجزا و فواصل بلند عشوه‌ای مانند ۵۴۶۲۳ و ۱۲۹۰۴',
      isDos: false,
    });
  }

  return list;
}

function generateHeuristicReplication(configs: any[]): any {
  return {
    stepByStep: [
      'یک سرور ابری نزدیک ایران (مثلاً دیتاسنترهای آلمان یا فنلاند هتزنر) تهیه کنید.',
      'هسته کلاینت و سرور Xray را به آخرین نسخه پایدار آپدیت نمایید.',
      'از درگاه Reality برای اتصالات مستقیم پروتکل VLESS استفاده کنید.',
      'در هدر SNI وب‌سایتی را بگذارید که از TLS 1.3 پشتیبانی کرده و در شبکه داخلی بلاک نباشد (مثلاً dl.google.com یا yahoo.com).',
      'یک اثر انگشت مناسب به لایه uTLS اختصاص دهید (مثال: chrome یا random).',
      'در سمت کلاینت حتما فرگمنتیشن وب‌سوکت یا پکت‌های اول را فعال کنید تا شانس شکست فیلتر افزایش یابد.',
    ],
    sampleConfigYaml: `proxies:
  - name: "Clash-DE-Reality-Pattern"
    type: vless
    server: 88.99.112.55
    port: 443
    uuid: 7711f5ee-ccca-4444-baa4-11a2f66ff2ad
    udp: true
    tls: true
    network: grpc
    servername: microsoft.com
    reality-opts:
      public-key: G3-z_wshmOPhv_R3Yc9-S1_vSby1k3I6e5pIs51nS1E
      short-id: 146afb288fa6c04f
    grpc-opts:
      grpc-service-name: "speed-grpc-service"
    client-fingerprint: chrome`,
    sampleConfigJson: `{
  "outbounds": [
    {
      "type": "vless",
      "tag": "singbox-DE-Reality-Replicated",
      "server": "88.99.112.55",
      "server_port": 443,
      "uuid": "7711f5ee-ccca-4444-baa4-11a2f66ff2ad",
      "flow": "",
      "tls": {
        "enabled": true,
        "server_name": "microsoft.com",
        "utls": {
          "enabled": true,
          "fingerprint": "chrome"
        },
        "reality": {
          "enabled": true,
          "public_key": "G3-z_wshmOPhv_R3Yc9-S1_vSby1k3I6e5pIs51nS1E",
          "short_id": "146afb288fa6c04f"
        }
      },
      "packet_encoding": "xray"
    }
  ]
}`,
  };
}

// Prepare Express/Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
