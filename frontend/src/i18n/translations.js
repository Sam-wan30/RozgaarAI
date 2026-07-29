import en from "./en.json";
import hi from "./hi.json";

export const languageConfig = [
  { code: "en", label: "English", speechLocale: "en-IN", htmlLang: "en" },
  { code: "hi", label: "हिन्दी", speechLocale: "hi-IN", htmlLang: "hi" },
  { code: "mr", label: "मराठी", speechLocale: "mr-IN", htmlLang: "mr" },
  { code: "bn", label: "বাংলা", speechLocale: "bn-IN", htmlLang: "bn" },
  { code: "te", label: "తెలుగు", speechLocale: "te-IN", htmlLang: "te" },
  { code: "ta", label: "தமிழ்", speechLocale: "ta-IN", htmlLang: "ta" },
  { code: "kn", label: "ಕನ್ನಡ", speechLocale: "kn-IN", htmlLang: "kn" },
  { code: "gu", label: "ગુજરાતી", speechLocale: "gu-IN", htmlLang: "gu" },
  { code: "ml", label: "മലയാളം", speechLocale: "ml-IN", htmlLang: "ml" },
  { code: "pa", label: "ਪੰਜਾਬੀ", speechLocale: "pa-IN", htmlLang: "pa" }
];

export const supportedLocales = Object.fromEntries(
  languageConfig.map(({ code, label, speechLocale, htmlLang }) => [
    code,
    { code, locale: speechLocale, label, htmlLang }
  ])
);

const regionalLocaleNames = Object.fromEntries(languageConfig.map(({ code, label }) => [code, label]));
const regionalNavMain = {
  mr: { challenge: "आव्हान", howItWorks: "कसे काम करते", product: "उत्पादन", employers: "नियोक्ते", exploreDemo: "डेमो पाहा", signIn: "साइन इन", language: "भाषा" },
  bn: { challenge: "চ্যালেঞ্জ", howItWorks: "কীভাবে কাজ করে", product: "পণ্য", employers: "নিয়োগকর্তা", exploreDemo: "ডেমো দেখুন", signIn: "সাইন ইন", language: "ভাষা" },
  te: { challenge: "సవాలు", howItWorks: "ఎలా పనిచేస్తుంది", product: "ఉత్పత్తి", employers: "ఉద్యోగదాతలు", exploreDemo: "డెమో చూడండి", signIn: "సైన్ ఇన్", language: "భాష" },
  ta: { challenge: "சவால்", howItWorks: "எப்படி செயல்படுகிறது", product: "தயாரிப்பு", employers: "வேலை வழங்குநர்கள்", exploreDemo: "டெமோ பார்க்க", signIn: "உள்நுழைக", language: "மொழி" },
  kn: { challenge: "ಸವಾಲು", howItWorks: "ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", product: "ಉತ್ಪನ್ನ", employers: "ಉದ್ಯೋಗದಾತರು", exploreDemo: "ಡೆಮೋ ನೋಡಿ", signIn: "ಸೈನ್ ಇನ್", language: "ಭಾಷೆ" },
  gu: { challenge: "પડકાર", howItWorks: "કેવી રીતે કામ કરે છે", product: "પ્રોડક્ટ", employers: "નિયોક્તાઓ", exploreDemo: "ડેમો જુઓ", signIn: "સાઇન ઇન", language: "ભાષા" },
  ml: { challenge: "വെല്ലുവിളി", howItWorks: "എങ്ങനെ പ്രവർത്തിക്കുന്നു", product: "ഉൽപ്പന്നം", employers: "തൊഴിലുടമകൾ", exploreDemo: "ഡെമോ കാണുക", signIn: "സൈൻ ഇൻ", language: "ഭാഷ" },
  pa: { challenge: "ਚੁਣੌਤੀ", howItWorks: "ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", product: "ਉਤਪਾਦ", employers: "ਨਿਯੋਗਕਰਤਾ", exploreDemo: "ਡੈਮੋ ਵੇਖੋ", signIn: "ਸਾਈਨ ਇਨ", language: "ਭਾਸ਼ਾ" }
};
const regionalLanguageChanged = {
  mr: "भाषा मराठीमध्ये बदलली आहे",
  bn: "ভাষা বাংলায় পরিবর্তন হয়েছে",
  te: "భాష తెలుగుకు మార్చబడింది",
  ta: "மொழி தமிழாக மாற்றப்பட்டது",
  kn: "ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಲಾಗಿದೆ",
  gu: "ભાષા ગુજરાતીમાં બદલાઈ ગઈ છે",
  ml: "ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി",
  pa: "ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੀ ਗਈ ਹੈ"
};

function deepMerge(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) return override ?? base;
  if (!base || typeof base !== "object" || !override || typeof override !== "object") return override ?? base;
  return Object.fromEntries(
    [...new Set([...Object.keys(base), ...Object.keys(override)])]
      .map((key) => [key, deepMerge(base[key], override[key])])
  );
}

function deepMergeNamespace(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) return override ?? base;
  if (base && typeof base === "object") {
    if (!override || typeof override !== "object") return base;
    return Object.fromEntries(
      [...new Set([...Object.keys(base), ...Object.keys(override)])]
        .map((key) => [key, deepMergeNamespace(base[key], override[key])])
    );
  }
  return override ?? base;
}

const workerWorkspaceTermMaps = {
  hi: {
    "Worker Workspace": "श्रमिक वर्कस्पेस", "Home": "होम", "Jobs": "नौकरियां", "Training": "प्रशिक्षण", "Resume": "बायोडाटा", "Interview Coach": "साक्षात्कार कोच", "Applications": "आवेदन", "Settings": "सेटिंग्स", "Overview": "ओवरव्यू", "Workers": "श्रमिक", "Employers": "नियोक्ता", "Documents": "दस्तावेज़", "Notifications": "सूचनाएं", "Profile": "प्रोफ़ाइल", "Skills": "कौशल", "Experience": "अनुभव", "Review": "समीक्षा", "Complete": "पूर्ण", "Create Worker Identity": "श्रमिक पहचान बनाएं", "Full Name": "पूरा नाम", "Phone Number": "फोन नंबर", "City": "शहर", "Primary Skill": "प्राथमिक कौशल", "Expected Monthly Wage": "अपेक्षित मासिक वेतन", "Languages Known": "ज्ञात भाषाएं", "Availability": "उपलब्धता", "Speak Now": "अभी बोलें", "Upload ID": "ID अपलोड करें", "Extract details": "विवरण निकालें", "Back to Dashboard": "डैशबोर्ड पर वापस", "Need help?": "मदद चाहिए?", "Log out": "लॉग आउट", "Save & Continue Later": "सहेजें और बाद में जारी रखें", "It takes less than 2 minutes": "२ मिनट से कम समय लगता है", "Create My Worker Profile": "मेरी श्रमिक प्रोफ़ाइल बनाएं"
  },
  mr: {
    "Worker Workspace": "कामगार वर्कस्पेस", "Home": "होम", "Jobs": "नोकऱ्या", "Training": "प्रशिक्षण", "Resume": "रिझ्युमे", "Interview Coach": "मुलाखत कोच", "Applications": "अर्ज", "Settings": "सेटिंग्ज", "Overview": "आढावा", "Workers": "कामगार", "Employers": "नियोक्ते", "Documents": "दस्तऐवज", "Notifications": "सूचना", "Profile": "प्रोफाइल", "Skills": "कौशल्ये", "Experience": "अनुभव", "Review": "तपासणी", "Complete": "पूर्ण", "Create Worker Identity": "कामगार ओळख तयार करा", "Full Name": "पूर्ण नाव", "Phone Number": "फोन नंबर", "City": "शहर", "Primary Skill": "प्राथमिक कौशल्य", "Expected Monthly Wage": "अपेक्षित मासिक वेतन", "Languages Known": "माहित असलेल्या भाषा", "Availability": "उपलब्धता", "Speak Now": "आता बोला", "Upload ID": "ID अपलोड करा", "Extract details": "माहिती काढा", "Back to Dashboard": "डॅशबोर्डवर परत", "Need help?": "मदत हवी आहे?", "Log out": "लॉग आउट", "Save & Continue Later": "जतन करा आणि नंतर सुरू ठेवा", "It takes less than 2 minutes": "२ मिनिटांपेक्षा कमी वेळ लागतो", "Create My Worker Profile": "माझी कामगार प्रोफाइल तयार करा", "Create your verified worker identity in just a few minutes.": "काही मिनिटांत तुमची सत्यापित कामगार ओळख तयार करा.", "Let's build your Worker Identity": "चला तुमची कामगार ओळख तयार करूया", "Tell RozgaarAI about the worker": "कामगाराबद्दल RozgaarAI ला सांगा", "AI Assisted Onboarding": "AI सहाय्यित ऑनबोर्डिंग", "Please fill in the basic details. You can edit these later.": "कृपया मूलभूत माहिती भरा. तुम्ही ती नंतर बदलू शकता.", "Select your city": "तुमचे शहर निवडा", "Select your primary skill": "तुमचे प्राथमिक कौशल्य निवडा", "Enter your full name": "तुमचे पूर्ण नाव लिहा", "Enter 10-digit mobile number": "१० अंकी मोबाइल नंबर लिहा", "Write or speak about your work history, skills, previous jobs and experience...": "तुमचा कामाचा इतिहास, कौशल्ये, आधीच्या नोकऱ्या आणि अनुभव लिहा किंवा बोला..."
  },
  bn: { "Worker": "কর্মী", "Workspace": "ওয়ার্কস্পেস", "Home": "হোম", "Jobs": "চাকরি", "Training": "প্রশিক্ষণ", "Resume": "রেজুমে", "Applications": "আবেদন", "Settings": "সেটিংস", "Overview": "ওভারভিউ", "Workers": "কর্মী", "Employers": "নিয়োগকর্তা", "Documents": "নথি", "Notifications": "বিজ্ঞপ্তি", "Skills": "দক্ষতা", "Experience": "অভিজ্ঞতা", "Review": "পর্যালোচনা", "Complete": "সম্পূর্ণ", "Create": "তৈরি করুন", "Save": "সংরক্ষণ করুন", "View": "দেখুন", "Download": "ডাউনলোড", "Share": "শেয়ার", "Profile": "প্রোফাইল" },
  te: { "Worker": "కార్మికుడు", "Workspace": "వర్క్‌స్పేస్", "Home": "హోమ్", "Jobs": "ఉద్యోగాలు", "Training": "శిక్షణ", "Resume": "రెజ్యూమ్", "Applications": "దరఖాస్తులు", "Settings": "సెట్టింగులు", "Overview": "అవలోకనం", "Workers": "కార్మికులు", "Employers": "ఉద్యోగదాతలు", "Documents": "పత్రాలు", "Notifications": "నోటిఫికేషన్లు", "Skills": "నైపుణ్యాలు", "Experience": "అనుభవం", "Review": "సమీక్ష", "Complete": "పూర్తి", "Create": "సృష్టించండి", "Save": "సేవ్", "View": "చూడండి", "Download": "డౌన్‌లోడ్", "Share": "షేర్", "Profile": "ప్రొఫైల్" },
  ta: { "Worker": "தொழிலாளர்", "Workspace": "பணிமையம்", "Home": "முகப்பு", "Jobs": "வேலைகள்", "Training": "பயிற்சி", "Resume": "ரெசுமே", "Applications": "விண்ணப்பங்கள்", "Settings": "அமைப்புகள்", "Overview": "மேலோட்டம்", "Workers": "தொழிலாளர்கள்", "Employers": "வேலை வழங்குநர்கள்", "Documents": "ஆவணங்கள்", "Notifications": "அறிவிப்புகள்", "Skills": "திறன்கள்", "Experience": "அனுபவம்", "Review": "பரிசீலனை", "Complete": "முழுமை", "Create": "உருவாக்கு", "Save": "சேமி", "View": "காண்க", "Download": "பதிவிறக்கு", "Share": "பகிர்", "Profile": "சுயவிவரம்" },
  kn: { "Worker": "ಕಾರ್ಮಿಕ", "Workspace": "ಕಾರ್ಯಕ್ಷೇತ್ರ", "Home": "ಹೋಮ್", "Jobs": "ಉದ್ಯೋಗಗಳು", "Training": "ತರಬೇತಿ", "Resume": "ರೆಜ್ಯೂಮ್", "Applications": "ಅರ್ಜಿಗಳು", "Settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", "Overview": "ಅವಲೋಕನ", "Workers": "ಕಾರ್ಮಿಕರು", "Employers": "ಉದ್ಯೋಗದಾತರು", "Documents": "ದಾಖಲೆಗಳು", "Notifications": "ಅಧಿಸೂಚನೆಗಳು", "Skills": "ಕೌಶಲ್ಯಗಳು", "Experience": "ಅನುಭವ", "Review": "ಪರಿಶೀಲನೆ", "Complete": "ಪೂರ್ಣ", "Create": "ರಚಿಸಿ", "Save": "ಉಳಿಸಿ", "View": "ನೋಡಿ", "Download": "ಡೌನ್‌ಲೋಡ್", "Share": "ಹಂಚಿಕೆ", "Profile": "ಪ್ರೊಫೈಲ್" },
  gu: { "Worker": "કામદાર", "Workspace": "કાર્યસ્થળ", "Home": "હોમ", "Jobs": "નોકરીઓ", "Training": "તાલીમ", "Resume": "રિઝ્યૂમે", "Applications": "અરજીઓ", "Settings": "સેટિંગ્સ", "Overview": "ઝાંખી", "Workers": "કામદારો", "Employers": "નિયોક્તાઓ", "Documents": "દસ્તાવેજો", "Notifications": "સૂચનાઓ", "Skills": "કૌશલ્ય", "Experience": "અનુભવ", "Review": "સમીક્ષા", "Complete": "પૂર્ણ", "Create": "બનાવો", "Save": "સાચવો", "View": "જુઓ", "Download": "ડાઉનલોડ", "Share": "શેર", "Profile": "પ્રોફાઇલ" },
  ml: { "Worker": "തൊഴിലാളി", "Workspace": "പ്രവർത്തനസ്ഥലം", "Home": "ഹോം", "Jobs": "ജോലികൾ", "Training": "പരിശീലനം", "Resume": "റെസ്യൂമെ", "Applications": "അപേക്ഷകൾ", "Settings": "സെറ്റിംഗ്സ്", "Overview": "അവലോകനം", "Workers": "തൊഴിലാളികൾ", "Employers": "തൊഴിലുടമകൾ", "Documents": "രേഖകൾ", "Notifications": "അറിയിപ്പുകൾ", "Skills": "കഴിവുകൾ", "Experience": "അനുഭവം", "Review": "പരിശോധന", "Complete": "പൂർണ്ണം", "Create": "സൃഷ്ടിക്കുക", "Save": "സംരക്ഷിക്കുക", "View": "കാണുക", "Download": "ഡൗൺലോഡ്", "Share": "പങ്കിടുക", "Profile": "പ്രൊഫൈൽ" },
  pa: { "Worker": "ਮਜ਼ਦੂਰ", "Workspace": "ਵਰਕਸਪੇਸ", "Home": "ਹੋਮ", "Jobs": "ਨੌਕਰੀਆਂ", "Training": "ਟ੍ਰੇਨਿੰਗ", "Resume": "ਰਿਜ਼ਿਊਮੇ", "Applications": "ਅਰਜ਼ੀਆਂ", "Settings": "ਸੈਟਿੰਗਾਂ", "Overview": "ਝਲਕ", "Workers": "ਮਜ਼ਦੂਰ", "Employers": "ਨਿਯੋਗਕਰਤਾ", "Documents": "ਦਸਤਾਵੇਜ਼", "Notifications": "ਸੂਚਨਾਵਾਂ", "Skills": "ਕੌਸ਼ਲ", "Experience": "ਤਜਰਬਾ", "Review": "ਸਮੀਖਿਆ", "Complete": "ਪੂਰਾ", "Create": "ਬਣਾਓ", "Save": "ਸੇਵ", "View": "ਵੇਖੋ", "Download": "ਡਾਊਨਲੋਡ", "Share": "ਸ਼ੇਅਰ", "Profile": "ਪ੍ਰੋਫਾਈਲ" }
};

const localeGenericWorkerCopy = {
  hi: "श्रमिक जानकारी", mr: "कामगार माहिती", bn: "কর্মী তথ্য", te: "కార్మిక సమాచారం", ta: "தொழிலாளர் தகவல்", kn: "ಕಾರ್ಮಿಕ ಮಾಹಿತಿ", gu: "કામદાર માહિતી", ml: "തൊഴിലാളി വിവരം", pa: "ਮਜ਼ਦੂਰ ਜਾਣਕਾਰੀ"
};

function autoLocalizeWorkerString(value, code) {
  if (typeof value !== "string") return value;
  if (!value.trim()) return value;
  let next = value;
  const terms = workerWorkspaceTermMaps[code] || {};
  Object.entries(terms)
    .sort(([a], [b]) => b.length - a.length)
    .forEach(([source, target]) => {
      next = next.replaceAll(source, target);
    });
  if (next !== value) return next;
  if (!/[A-Za-z]/.test(value)) return value;
  const tokens = [...value.matchAll(/\{[^}]+\}/g)].map(([token]) => token).join(" ");
  return `${localeGenericWorkerCopy[code] || value}${tokens ? ` ${tokens}` : ""}`;
}

function autoLocalizeWorkerWorkspace(value, code) {
  if (Array.isArray(value)) return value.map((item) => autoLocalizeWorkerWorkspace(item, code));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, autoLocalizeWorkerWorkspace(item, code)]));
  }
  return autoLocalizeWorkerString(value, code);
}

function completeWorkerWorkspace(code) {
  const localizedBase = code === "hi"
    ? autoLocalizeWorkerWorkspace(en.workerWorkspace, "hi")
    : autoLocalizeWorkerWorkspace(en.workerWorkspace, code);
  const existingLocale = code === "hi" ? hi.workerWorkspace : {};
  return deepMergeNamespace(deepMergeNamespace(localizedBase, existingLocale), workerWorkspaceLanguageOverrides[code] || {});
}

function flattenTranslationKeys(source, prefix = "") {
  if (!source || typeof source !== "object") return {};
  return Object.entries(source).reduce((result, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return { ...result, ...flattenTranslationKeys(value, fullKey) };
    }
    result[fullKey] = value;
    return result;
  }, {});
}

function validateWorkerWorkspaceCompleteness(reference, target, locale) {
  const referenceKeys = Object.keys(flattenTranslationKeys(reference));
  const targetKeys = new Set(Object.keys(flattenTranslationKeys(target)));
  const missingKeys = referenceKeys.filter((key) => !targetKeys.has(key));
  if (missingKeys.length > 0 && import.meta.env?.DEV) {
    console.warn(`Missing Worker Workspace translations for ${locale}:`, missingKeys);
  }
  return missingKeys;
}

const regionalCopy = {
  mr: {
    badge: "आवाज-आधारित AI रोजगार सहाय्यक",
    title: "भारताच्या अनौपचारिक कामगारांसाठी डिजिटल करिअर ओळख आणि उत्पन्न पासपोर्ट",
    subtitle: "RozgaarAI कामगारांचा प्रत्यक्ष अनुभव विश्वसनीय डिजिटल प्रमाणपत्रे, सत्यापित कौशल्ये, रोजगार इतिहास, उत्पन्न नोंदी आणि चांगल्या संधींमध्ये बदलते.",
    create: "करिअर ओळख तयार करा",
    employerDash: "नियोक्ता डॅशबोर्ड",
    demo: "डेमो पाहा",
    challengeEyebrow: "आव्हान",
    challengePrefix: "लाखो कुशल कामगार",
    challengeAccent: "अदृश्य राहतात",
    proofMissing: "विश्वसनीय पुरावा नाही.",
    how: "RozgaarAI कसे काम करते",
    howPrefix: "आवाजेपासून",
    howAccent: "सत्यापित रोजगारापर्यंत",
    howCopy: "बोललेला कामाचा अनुभव विश्वसनीय रोजगार संधींमध्ये बदलणारी सोपी AI यात्रा.",
    employersLabel: "नियोक्त्यांसाठी",
    hire1: "सत्यापित कामगारांची नियुक्ती करा",
    hire2: "पूर्ण आत्मविश्वासाने.",
    employerCopy: "प्रत्येक कामगार डिजिटल ओळख, कामाचा इतिहास आणि उत्पन्न नोंदींनी सत्यापित असतो.",
    footerCopy: "भारताच्या अनौपचारिक कामगारांचा अनुभव विश्वसनीय रोजगार ओळखीत बदलत आहे.",
    workers: "कामगार", employers: "नियोक्ते", impact: "परिणाम", about: "विषयी", docs: "दस्तऐवज", contact: "संपर्क"
  },
  bn: {
    badge: "ভয়েস-প্রথম AI কর্মসংস্থান সহায়ক",
    title: "ভারতের অনানুষ্ঠানিক কর্মীদের জন্য ডিজিটাল ক্যারিয়ার পরিচয় ও আয় পাসপোর্ট",
    subtitle: "RozgaarAI বাস্তব কাজের অভিজ্ঞতাকে বিশ্বস্ত ডিজিটাল পরিচয়, যাচাইকৃত দক্ষতা, কর্মইতিহাস, আয় রেকর্ড ও ভালো সুযোগে রূপান্তর করে।",
    create: "ক্যারিয়ার পরিচয় তৈরি করুন",
    employerDash: "নিয়োগকর্তা ড্যাশবোর্ড",
    demo: "ডেমো দেখুন",
    challengeEyebrow: "চ্যালেঞ্জ",
    challengePrefix: "লক্ষ লক্ষ দক্ষ কর্মী",
    challengeAccent: "অদৃশ্য থেকে যান",
    proofMissing: "বিশ্বস্ত প্রমাণ নেই।",
    how: "RozgaarAI কীভাবে কাজ করে",
    howPrefix: "ভয়েস থেকে",
    howAccent: "যাচাইকৃত কর্মসংস্থান",
    howCopy: "কথিত কাজের অভিজ্ঞতাকে বিশ্বস্ত কর্মসংস্থানের সুযোগে বদলে দেওয়ার সহজ AI যাত্রা।",
    employersLabel: "নিয়োগকর্তাদের জন্য",
    hire1: "যাচাইকৃত কর্মী নিয়োগ করুন",
    hire2: "আত্মবিশ্বাসের সঙ্গে।",
    employerCopy: "RozgaarAI-তে প্রতিটি কর্মী ডিজিটাল পরিচয়, কাজের ইতিহাস ও আয় রেকর্ড দিয়ে যাচাইকৃত।",
    footerCopy: "ভারতের অনানুষ্ঠানিক কর্মীদের অভিজ্ঞতাকে বিশ্বস্ত কর্মসংস্থান পরিচয়ে রূপান্তর করা।",
    workers: "কর্মী", employers: "নিয়োগকর্তা", impact: "প্রভাব", about: "সম্পর্কে", docs: "ডকুমেন্টেশন", contact: "যোগাযোগ"
  },
  te: {
    badge: "వాయిస్-ఫస్ట్ AI ఉపాధి సహాయకుడు",
    title: "భారత అసంఘటిత కార్మికుల కోసం డిజిటల్ కెరీర్ గుర్తింపు మరియు ఆదాయ పాస్‌పోర్ట్",
    subtitle: "RozgaarAI నిజమైన పని అనుభవాన్ని నమ్మకమైన డిజిటల్ గుర్తింపు, ధృవీకరించిన నైపుణ్యాలు, ఉపాధి చరిత్ర, ఆదాయ రికార్డులు మరియు మంచి అవకాశాలుగా మార్చుతుంది.",
    create: "కెరీర్ గుర్తింపును సృష్టించండి",
    employerDash: "ఉద్యోగదాత డ్యాష్‌బోర్డ్",
    demo: "డెమో చూడండి",
    challengeEyebrow: "సవాలు",
    challengePrefix: "లక్షలాది నైపుణ్య కార్మికులు",
    challengeAccent: "కనిపించకుండా మిగిలిపోతున్నారు",
    proofMissing: "నమ్మకమైన రుజువు లేదు.",
    how: "RozgaarAI ఎలా పనిచేస్తుంది",
    howPrefix: "వాయిస్ నుండి",
    howAccent: "ధృవీకరించిన ఉపాధి వరకు",
    howCopy: "మాటలలో చెప్పిన పని అనుభవాన్ని నమ్మకమైన ఉపాధి అవకాశాలుగా మార్చే సరళమైన AI ప్రయాణం.",
    employersLabel: "ఉద్యోగదాతల కోసం",
    hire1: "ధృవీకరించిన కార్మికులను నియమించండి",
    hire2: "నమ్మకంతో.",
    employerCopy: "ప్రతి కార్మికుడు డిజిటల్ గుర్తింపు, పని చరిత్ర మరియు ఆదాయ రికార్డుల ద్వారా ధృవీకరించబడతాడు.",
    footerCopy: "భారత అసంఘటిత కార్మికుల అనుభవాన్ని నమ్మకమైన ఉపాధి గుర్తింపుగా మార్చడం.",
    workers: "కార్మికులు", employers: "ఉద్యోగదాతలు", impact: "ప్రభావం", about: "గురించి", docs: "డాక్యుమెంటేషన్", contact: "సంప్రదించండి"
  },
  ta: {
    badge: "குரல்-முன்னுரிமை AI வேலைவாய்ப்பு உதவியாளர்",
    title: "இந்தியாவின் அமைப்புசாரா தொழிலாளர்களுக்கான டிஜிட்டல் தொழில் அடையாளம் மற்றும் வருமான பாஸ்போர்ட்",
    subtitle: "RozgaarAI உண்மையான வேலை அனுபவத்தை நம்பகமான டிஜிட்டல் சான்றுகள், சரிபார்க்கப்பட்ட திறன்கள், வேலை வரலாறு, வருமான பதிவுகள் மற்றும் நல்ல வாய்ப்புகளாக மாற்றுகிறது.",
    create: "தொழில் அடையாளம் உருவாக்கு",
    employerDash: "வேலை வழங்குநர் டாஷ்போர்டு",
    demo: "டெமோ பார்க்க",
    challengeEyebrow: "சவால்",
    challengePrefix: "லட்சக்கணக்கான திறமையான தொழிலாளர்கள்",
    challengeAccent: "காணப்படாமல் உள்ளனர்",
    proofMissing: "நம்பகமான ஆதாரம் இல்லை.",
    how: "RozgaarAI எப்படி செயல்படுகிறது",
    howPrefix: "குரலிலிருந்து",
    howAccent: "சரிபார்க்கப்பட்ட வேலைவாய்ப்பு வரை",
    howCopy: "பேசப்பட்ட வேலை அனுபவத்தை நம்பகமான வேலை வாய்ப்புகளாக மாற்றும் எளிய AI பயணம்.",
    employersLabel: "வேலை வழங்குநர்களுக்கு",
    hire1: "சரிபார்க்கப்பட்ட தொழிலாளர்களை பணியமர்த்துங்கள்",
    hire2: "நம்பிக்கையுடன்.",
    employerCopy: "ஒவ்வொரு தொழிலாளரும் டிஜிட்டல் அடையாளம், வேலை வரலாறு மற்றும் வருமான பதிவுகள் மூலம் சரிபார்க்கப்படுகிறார்.",
    footerCopy: "இந்தியாவின் அமைப்புசாரா தொழிலாளர்களின் அனுபவத்தை நம்பகமான வேலை அடையாளமாக மாற்றுதல்.",
    workers: "தொழிலாளர்கள்", employers: "வேலை வழங்குநர்கள்", impact: "தாக்கம்", about: "பற்றி", docs: "ஆவணங்கள்", contact: "தொடர்பு"
  },
  kn: {
    badge: "ಧ್ವನಿ-ಮೊದಲು AI ಉದ್ಯೋಗ ಸಹಾಯಕ",
    title: "ಭಾರತದ ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರಿಗೆ ಡಿಜಿಟಲ್ ಕರಿಯರ್ ಗುರುತು ಮತ್ತು ಆದಾಯ ಪಾಸ್‌ಪೋರ್ಟ್",
    subtitle: "RozgaarAI ನೈಜ ಕೆಲಸದ ಅನುಭವವನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ಪ್ರಮಾಣಪತ್ರಗಳು, ಪರಿಶೀಲಿತ ಕೌಶಲ್ಯಗಳು, ಉದ್ಯೋಗ ಇತಿಹಾಸ, ಆದಾಯ ದಾಖಲೆಗಳು ಮತ್ತು ಉತ್ತಮ ಅವಕಾಶಗಳಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.",
    create: "ಕರಿಯರ್ ಗುರುತನ್ನು ರಚಿಸಿ",
    employerDash: "ಉದ್ಯೋಗದಾತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    demo: "ಡೆಮೋ ನೋಡಿ",
    challengeEyebrow: "ಸವಾಲು",
    challengePrefix: "ಲಕ್ಷಾಂತರ ಕೌಶಲ್ಯ ಕಾರ್ಮಿಕರು",
    challengeAccent: "ಕಾಣಿಸದೇ ಉಳಿಯುತ್ತಾರೆ",
    proofMissing: "ವಿಶ್ವಾಸಾರ್ಹ ಸಾಕ್ಷ್ಯ ಇಲ್ಲ.",
    how: "RozgaarAI ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    howPrefix: "ಧ್ವನಿಯಿಂದ",
    howAccent: "ಪರಿಶೀಲಿತ ಉದ್ಯೋಗದವರೆಗೆ",
    howCopy: "ಮಾತನಾಡಿದ ಕೆಲಸದ ಅನುಭವವನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಉದ್ಯೋಗ ಅವಕಾಶಗಳಾಗಿ ಪರಿವರ್ತಿಸುವ ಸರಳ AI ಪ್ರಯಾಣ.",
    employersLabel: "ಉದ್ಯೋಗದಾತರಿಗಾಗಿ",
    hire1: "ಪರಿಶೀಲಿತ ಕಾರ್ಮಿಕರನ್ನು ನೇಮಿಸಿ",
    hire2: "ನಂಬಿಕೆಯಿಂದ.",
    employerCopy: "ಪ್ರತಿ ಕಾರ್ಮಿಕರನ್ನು ಡಿಜಿಟಲ್ ಗುರುತು, ಕೆಲಸದ ಇತಿಹಾಸ ಮತ್ತು ಆದಾಯ ದಾಖಲೆಗಳಿಂದ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.",
    footerCopy: "ಭಾರತದ ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರ ಅನುಭವವನ್ನು ವಿಶ್ವಾಸಾರ್ಹ ಉದ್ಯೋಗ ಗುರುತಾಗಿ ಪರಿವರ್ತಿಸುವುದು.",
    workers: "ಕಾರ್ಮಿಕರು", employers: "ಉದ್ಯೋಗದಾತರು", impact: "ಪ್ರಭಾವ", about: "ಬಗ್ಗೆ", docs: "ದಾಖಲೆಗಳು", contact: "ಸಂಪರ್ಕ"
  },
  gu: {
    badge: "વોઇસ-ફર્સ્ટ AI રોજગાર સહાયક",
    title: "ભારતના અનૌપચારિક કામદારો માટે ડિજિટલ કરિયર ઓળખ અને આવક પાસપોર્ટ",
    subtitle: "RozgaarAI વાસ્તવિક કામના અનુભવને વિશ્વસનીય ડિજિટલ પ્રમાણપત્રો, ચકાસાયેલ કુશળતા, રોજગાર ઇતિહાસ, આવક રેકોર્ડ અને સારી તકમાં બદલે છે.",
    create: "કરિયર ઓળખ બનાવો",
    employerDash: "નિયોક્તા ડેશબોર્ડ",
    demo: "ડેમો જુઓ",
    challengeEyebrow: "પડકાર",
    challengePrefix: "લાખો કુશળ કામદારો",
    challengeAccent: "અદૃશ્ય રહી જાય છે",
    proofMissing: "વિશ્વસનીય પુરાવો નથી.",
    how: "RozgaarAI કેવી રીતે કામ કરે છે",
    howPrefix: "અવાજથી",
    howAccent: "ચકાસાયેલ રોજગાર સુધી",
    howCopy: "બોલાયેલા કામના અનુભવને વિશ્વસનીય રોજગાર તકમાં બદલતી સરળ AI મુસાફરી.",
    employersLabel: "નિયોક્તાઓ માટે",
    hire1: "ચકાસાયેલ કામદારોને રાખો",
    hire2: "વિશ્વાસ સાથે.",
    employerCopy: "RozgaarAI પર દરેક કામદાર ડિજિટલ ઓળખ, કામનો ઇતિહાસ અને આવક રેકોર્ડથી ચકાસાયેલ છે.",
    footerCopy: "ભારતના અનૌપચારિક કામદારોના અનુભવને વિશ્વસનીય રોજગાર ઓળખમાં બદલવું.",
    workers: "કામદારો", employers: "નિયોક્તાઓ", impact: "અસર", about: "વિશે", docs: "દસ્તાવેજો", contact: "સંપર્ક"
  },
  ml: {
    badge: "വോയ്സ്-ഫസ്റ്റ് AI തൊഴിൽ സഹായി",
    title: "ഇന്ത്യയിലെ അനൗപചാരിക തൊഴിലാളികൾക്കായുള്ള ഡിജിറ്റൽ കരിയർ ഐഡന്റിറ്റിയും വരുമാന പാസ്‌പോർട്ടും",
    subtitle: "RozgaarAI യഥാർത്ഥ ജോലി പരിചയത്തെ വിശ്വസനീയമായ ഡിജിറ്റൽ രേഖകൾ, പരിശോധിച്ച കഴിവുകൾ, തൊഴിൽ ചരിത്രം, വരുമാന രേഖകൾ, മികച്ച അവസരങ്ങൾ എന്നിവയാക്കി മാറ്റുന്നു.",
    create: "കരിയർ ഐഡന്റിറ്റി സൃഷ്ടിക്കുക",
    employerDash: "തൊഴിലുടമ ഡാഷ്ബോർഡ്",
    demo: "ഡെമോ കാണുക",
    challengeEyebrow: "വെല്ലുവിളി",
    challengePrefix: "ലക്ഷക്കണക്കിന് കഴിവുള്ള തൊഴിലാളികൾ",
    challengeAccent: "അദൃശ്യരായി തുടരുന്നു",
    proofMissing: "വിശ്വസനീയ തെളിവില്ല.",
    how: "RozgaarAI എങ്ങനെ പ്രവർത്തിക്കുന്നു",
    howPrefix: "വോയ്സിൽ നിന്ന്",
    howAccent: "പരിശോധിച്ച തൊഴിൽ വരെ",
    howCopy: "പറഞ്ഞ ജോലി പരിചയത്തെ വിശ്വസനീയമായ തൊഴിൽ അവസരങ്ങളാക്കി മാറ്റുന്ന ലളിതമായ AI യാത്ര.",
    employersLabel: "തൊഴിലുടമകൾക്കായി",
    hire1: "പരിശോധിച്ച തൊഴിലാളികളെ നിയമിക്കുക",
    hire2: "ആത്മവിശ്വാസത്തോടെ.",
    employerCopy: "ഓരോ തൊഴിലാളിയും ഡിജിറ്റൽ ഐഡന്റിറ്റി, ജോലി ചരിത്രം, വരുമാന രേഖകൾ എന്നിവയിലൂടെ പരിശോധിക്കപ്പെടുന്നു.",
    footerCopy: "ഇന്ത്യയിലെ അനൗപചാരിക തൊഴിലാളികളുടെ പരിചയത്തെ വിശ്വസനീയ തൊഴിൽ ഐഡന്റിറ്റിയാക്കി മാറ്റുന്നു.",
    workers: "തൊഴിലാളികൾ", employers: "തൊഴിലുടമകൾ", impact: "പ്രഭാവം", about: "കുറിച്ച്", docs: "ഡോക്യുമെന്റേഷൻ", contact: "ബന്ധപ്പെടുക"
  },
  pa: {
    badge: "ਵੌਇਸ-ਫਸਟ AI ਰੋਜ਼ਗਾਰ ਸਹਾਇਕ",
    title: "ਭਾਰਤ ਦੇ ਗੈਰ-ਸੰਗਠਿਤ ਮਜ਼ਦੂਰਾਂ ਲਈ ਡਿਜ਼ਿਟਲ ਕਰੀਅਰ ਪਛਾਣ ਅਤੇ ਆਮਦਨ ਪਾਸਪੋਰਟ",
    subtitle: "RozgaarAI ਅਸਲ ਕੰਮ ਦੇ ਤਜਰਬੇ ਨੂੰ ਭਰੋਸੇਯੋਗ ਡਿਜ਼ਿਟਲ ਪ੍ਰਮਾਣ, ਤਸਦੀਕਸ਼ੁਦਾ ਹੁਨਰ, ਰੋਜ਼ਗਾਰ ਇਤਿਹਾਸ, ਆਮਦਨ ਰਿਕਾਰਡ ਅਤੇ ਵਧੀਆ ਮੌਕਿਆਂ ਵਿੱਚ ਬਦਲਦਾ ਹੈ.",
    create: "ਕਰੀਅਰ ਪਛਾਣ ਬਣਾਓ",
    employerDash: "ਨਿਯੋਗਕਰਤਾ ਡੈਸ਼ਬੋਰਡ",
    demo: "ਡੈਮੋ ਵੇਖੋ",
    challengeEyebrow: "ਚੁਣੌਤੀ",
    challengePrefix: "ਲੱਖਾਂ ਹੁਨਰਮੰਦ ਮਜ਼ਦੂਰ",
    challengeAccent: "ਅਦ੍ਰਿਸ਼ ਰਹਿ ਜਾਂਦੇ ਹਨ",
    proofMissing: "ਭਰੋਸੇਯੋਗ ਸਬੂਤ ਨਹੀਂ.",
    how: "RozgaarAI ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    howPrefix: "ਆਵਾਜ਼ ਤੋਂ",
    howAccent: "ਤਸਦੀਕਸ਼ੁਦਾ ਰੋਜ਼ਗਾਰ ਤੱਕ",
    howCopy: "ਬੋਲੇ ਗਏ ਕੰਮ ਦੇ ਤਜਰਬੇ ਨੂੰ ਭਰੋਸੇਯੋਗ ਰੋਜ਼ਗਾਰ ਮੌਕਿਆਂ ਵਿੱਚ ਬਦਲਣ ਵਾਲੀ ਸੌਖੀ AI ਯਾਤਰਾ.",
    employersLabel: "ਨਿਯੋਗਕਰਤਾਵਾਂ ਲਈ",
    hire1: "ਤਸਦੀਕਸ਼ੁਦਾ ਮਜ਼ਦੂਰ ਭਰਤੀ ਕਰੋ",
    hire2: "ਭਰੋਸੇ ਨਾਲ.",
    employerCopy: "ਹਰ ਮਜ਼ਦੂਰ ਡਿਜ਼ਿਟਲ ਪਛਾਣ, ਕੰਮ ਇਤਿਹਾਸ ਅਤੇ ਆਮਦਨ ਰਿਕਾਰਡ ਰਾਹੀਂ ਤਸਦੀਕ ਹੁੰਦਾ ਹੈ.",
    footerCopy: "ਭਾਰਤ ਦੇ ਗੈਰ-ਸੰਗਠਿਤ ਮਜ਼ਦੂਰਾਂ ਦੇ ਤਜਰਬੇ ਨੂੰ ਭਰੋਸੇਯੋਗ ਰੋਜ਼ਗਾਰ ਪਛਾਣ ਵਿੱਚ ਬਦਲਣਾ.",
    workers: "ਮਜ਼ਦੂਰ", employers: "ਨਿਯੋਗਕਰਤਾ", impact: "ਅਸਰ", about: "ਬਾਰੇ", docs: "ਦਸਤਾਵੇਜ਼", contact: "ਸੰਪਰਕ"
  }
};

const workerWorkspaceLanguageOverrides = {
  "mr": {
    "title": "कामगार वर्कस्पेस",
    "home": "होम",
    "identity": "माझी करिअर ओळख",
    "jobs": "नोकऱ्या",
    "income": "उत्पन्न पासपोर्ट",
    "training": "प्रशिक्षण",
    "resume": "रिझ्युमे",
    "coach": "मुलाखत कोच",
    "safety": "सुरक्षा आणि हक्क",
    "applications": "अर्ज",
    "settings": "सेटिंग्ज",
    "welcome": "RozgaarAI मध्ये स्वागत आहे",
    "createTitle": "काही मिनिटांत तुमची सत्यापित कामगार ओळख तयार करा.",
    "createMyWorkerIdentity": "माझी कामगार ओळख तयार करा",
    "exploreDemo": "डेमो वर्कस्पेस पाहा",
    "logOut": "लॉग आउट",
    "signOut": "साइन आउट",
    "demoMode": "डेमो मोड",
    "openJobs": "नोकऱ्या उघडा",
    "viewAll": "सर्व पाहा",
    "applyNow": "आता अर्ज करा",
    "save": "जतन करा",
    "details": "तपशील",
    "createIdentity": "कामगार ओळख तयार करा",
    "createWorkerProfile": "माझी कामगार प्रोफाइल तयार करा",
    "saveLater": "जतन करा आणि नंतर सुरू ठेवा",
    "lessThanTwoMinutes": "२ मिनिटांपेक्षा कमी वेळ लागतो",
    "actions": {
      "backToDashboard": "डॅशबोर्डवर परत",
      "needHelp": "मदत हवी आहे?",
      "uploadId": "ID अपलोड करा",
      "extractDetails": "माहिती काढा",
      "extracting": "माहिती काढत आहे...",
      "speakNow": "आता बोला",
      "generatingProfile": "कामगार प्रोफाइल तयार होत आहे..."
    },
    "onboarding": {
      "brandTagline": "आवाज-प्रथम AI रोजगार सहाय्यक",
      "securePrivate": "१००% सुरक्षित आणि खाजगी",
      "stepperLabel": "कामगार ओळख तयार करण्याची प्रगती",
      "steps": [
        "वैयक्तिक माहिती",
        "अनुभव",
        "कौशल्ये",
        "तपासणी",
        "पूर्ण"
      ],
      "aiAssisted": "AI सहाय्यित ऑनबोर्डिंग",
      "tell": "कामगाराबद्दल RozgaarAI ला सांगा",
      "tellCopy": "तुम्ही नैसर्गिकपणे टाइप किंवा बोलू शकता. RozgaarAI कामगाराची माहिती समजून प्रोफाइल भरते.",
      "imageAlt": "AI सहाय्यित ऑनबोर्डिंगसाठी स्मार्टफोनमध्ये बोलणारा भारतीय कामगार",
      "trySaying": "असे काहीतरी सांगून पाहा:",
      "examplePlaceholder": "\"मी रमेश पाटील मुंबईचा आहे. मला प्लंबिंगचा ५ वर्षांचा अनुभव आहे, ₹३०,०००/महिना अपेक्षित आहे, हिंदी बोलतो आणि पूर्णवेळ काम करू शकतो.\"",
      "exampleAria": "AI सहाय्यित माहिती काढण्यासाठी कामगाराच्या गोष्टीचे उदाहरण",
      "speakAria": "कामगाराची माहिती बोला",
      "voiceExample": "आवाज उदाहरण",
      "uploadIdMessage": "कामगार ओळख तयार केल्यानंतर ID अपलोड करता येईल.",
      "formTitle": "चला तुमची कामगार ओळख तयार करूया",
      "formCopy": "कृपया मूलभूत माहिती भरा. तुम्ही ती नंतर बदलू शकता.",
      "requiredHelp": "तुमची ओळख तयार करण्यासाठी नाव, फोन, शहर आणि प्राथमिक कौशल्य आवश्यक आहे.",
      "helpMessage": "मदत हवी आहे? RozgaarAI support तुम्हाला कामगार ओळख सेटअपमध्ये मार्गदर्शन करण्यासाठी तयार आहे."
    },
    "form": {
      "fullName": "पूर्ण नाव",
      "phone": "फोन नंबर",
      "city": "शहर",
      "primarySkill": "प्राथमिक कौशल्य",
      "experience": "अनुभव",
      "expectedWage": "अपेक्षित मासिक वेतन",
      "languages": "माहित असलेल्या भाषा",
      "availability": "उपलब्धता",
      "workAbout": "तुमच्या कामाबद्दल सांगा (कौशल्ये, अनुभव, आधीचे काम)",
      "fullNamePlaceholder": "तुमचे पूर्ण नाव लिहा",
      "phonePlaceholder": "१० अंकी मोबाइल नंबर लिहा",
      "cityPlaceholder": "तुमचे शहर निवडा",
      "skillPlaceholder": "तुमचे प्राथमिक कौशल्य निवडा",
      "experiencePlaceholder": "उदा. ३ वर्षे",
      "wagePlaceholder": "उदा. ₹१५,०००",
      "languagesPlaceholder": "उदा. हिंदी, मराठी",
      "availabilityPlaceholder": "उदा. पूर्णवेळ, अर्धवेळ",
      "notesPlaceholder": "तुमचा कामाचा इतिहास, कौशल्ये, आधीच्या नोकऱ्या आणि अनुभव लिहा किंवा बोला...",
      "characters": "{count} अक्षरे"
    }
  },
  "bn": {
    "title": "কর্মী ওয়ার্কস্পেস",
    "home": "হোম",
    "identity": "আমার ক্যারিয়ার পরিচয়",
    "jobs": "চাকরি",
    "income": "আয় পাসপোর্ট",
    "training": "প্রশিক্ষণ",
    "resume": "রেজুমে",
    "coach": "ইন্টারভিউ কোচ",
    "safety": "নিরাপত্তা ও অধিকার",
    "applications": "আবেদন",
    "settings": "সেটিংস",
    "welcome": "RozgaarAI-তে স্বাগতম",
    "createTitle": "কয়েক মিনিটে আপনার যাচাইকৃত কর্মী পরিচয় তৈরি করুন।",
    "createMyWorkerIdentity": "আমার কর্মী পরিচয় তৈরি করুন",
    "exploreDemo": "ডেমো ওয়ার্কস্পেস দেখুন",
    "logOut": "লগ আউট",
    "signOut": "সাইন আউট",
    "demoMode": "ডেমো মোড",
    "openJobs": "চাকরি খুলুন",
    "viewAll": "সব দেখুন",
    "applyNow": "এখন আবেদন করুন",
    "save": "সংরক্ষণ",
    "details": "বিস্তারিত"
  },
  "te": {
    "title": "కార్మిక వర్క్‌స్పేస్",
    "home": "హోమ్",
    "identity": "నా కెరీర్ గుర్తింపు",
    "jobs": "ఉద్యోగాలు",
    "income": "ఆదాయ పాస్‌పోర్ట్",
    "training": "శిక్షణ",
    "resume": "రెజ్యూమ్",
    "coach": "ఇంటర్వ్యూ కోచ్",
    "safety": "భద్రత & హక్కులు",
    "applications": "దరఖాస్తులు",
    "settings": "సెట్టింగ్స్",
    "welcome": "RozgaarAIకి స్వాగతం",
    "createTitle": "కొన్ని నిమిషాల్లో మీ ధృవీకరించిన కార్మిక గుర్తింపును సృష్టించండి.",
    "createMyWorkerIdentity": "నా కార్మిక గుర్తింపును సృష్టించండి",
    "exploreDemo": "డెమో వర్క్‌స్పేస్ చూడండి",
    "logOut": "లాగ్ అవుట్",
    "signOut": "సైన్ అవుట్",
    "demoMode": "డెమో మోడ్",
    "openJobs": "ఉద్యోగాలు తెరవండి",
    "viewAll": "అన్నీ చూడండి",
    "applyNow": "ఇప్పుడే దరఖాస్తు చేయండి",
    "save": "సేవ్",
    "details": "వివరాలు"
  },
  "ta": {
    "title": "தொழிலாளர் பணிமனை",
    "home": "முகப்பு",
    "identity": "என் தொழில் அடையாளம்",
    "jobs": "வேலைகள்",
    "income": "வருமான பாஸ்போர்ட்",
    "training": "பயிற்சி",
    "resume": "ரெஸ்யூமே",
    "coach": "நேர்காணல் பயிற்சியாளர்",
    "safety": "பாதுகாப்பு & உரிமைகள்",
    "applications": "விண்ணப்பங்கள்",
    "settings": "அமைப்புகள்",
    "welcome": "RozgaarAIக்கு வரவேற்கிறோம்",
    "createTitle": "சில நிமிடங்களில் உங்கள் சரிபார்க்கப்பட்ட தொழிலாளர் அடையாளத்தை உருவாக்குங்கள்.",
    "createMyWorkerIdentity": "என் தொழிலாளர் அடையாளத்தை உருவாக்கு",
    "exploreDemo": "டெமோ பணிமனை பார்க்க",
    "logOut": "வெளியேறு",
    "signOut": "சைன் அவுட்",
    "demoMode": "டெமோ முறை",
    "openJobs": "வேலைகளைத் திற",
    "viewAll": "அனைத்தையும் காண்க",
    "applyNow": "இப்போது விண்ணப்பிக்கவும்",
    "save": "சேமி",
    "details": "விவரங்கள்"
  },
  "kn": {
    "title": "ಕಾರ್ಮಿಕ ವರ್ಕ್‌ಸ್ಪೇಸ್",
    "home": "ಮುಖಪುಟ",
    "identity": "ನನ್ನ ಕರಿಯರ್ ಗುರುತು",
    "jobs": "ಉದ್ಯೋಗಗಳು",
    "income": "ಆದಾಯ ಪಾಸ್‌ಪೋರ್ಟ್",
    "training": "ತರಬೇತಿ",
    "resume": "ರೆಸ್ಯೂಮೆ",
    "coach": "ಸಂದರ್ಶನ ಕೋಚ್",
    "safety": "ಸುರಕ್ಷತೆ ಮತ್ತು ಹಕ್ಕುಗಳು",
    "applications": "ಅರ್ಜಿಗಳು",
    "settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "welcome": "RozgaarAIಗೆ ಸ್ವಾಗತ",
    "createTitle": "ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಪರಿಶೀಲಿತ ಕಾರ್ಮಿಕ ಗುರುತನ್ನು ರಚಿಸಿ.",
    "createMyWorkerIdentity": "ನನ್ನ ಕಾರ್ಮಿಕ ಗುರುತನ್ನು ರಚಿಸಿ",
    "exploreDemo": "ಡೆಮೋ ವರ್ಕ್‌ಸ್ಪೇಸ್ ನೋಡಿ",
    "logOut": "ಲಾಗ್ ಔಟ್",
    "signOut": "ಸೈನ್ ಔಟ್",
    "demoMode": "ಡೆಮೋ ಮೋಡ್",
    "openJobs": "ಉದ್ಯೋಗ ತೆರೆಯಿರಿ",
    "viewAll": "ಎಲ್ಲ ನೋಡಿ",
    "applyNow": "ಈಗ ಅರ್ಜಿ ಹಾಕಿ",
    "save": "ಉಳಿಸಿ",
    "details": "ವಿವರಗಳು"
  },
  "gu": {
    "title": "કામદાર વર્કસ્પેસ",
    "home": "હોમ",
    "identity": "મારી કરિયર ઓળખ",
    "jobs": "નોકરીઓ",
    "income": "આવક પાસપોર્ટ",
    "training": "તાલીમ",
    "resume": "રિઝ્યૂમે",
    "coach": "ઇન્ટરવ્યુ કોચ",
    "safety": "સુરક્ષા અને અધિકાર",
    "applications": "અરજીઓ",
    "settings": "સેટિંગ્સ",
    "welcome": "RozgaarAIમાં આપનું સ્વાગત છે",
    "createTitle": "થોડા મિનિટોમાં તમારી ચકાસેલી કામદાર ઓળખ બનાવો.",
    "createMyWorkerIdentity": "મારી કામદાર ઓળખ બનાવો",
    "exploreDemo": "ડેમો વર્કસ્પેસ જુઓ",
    "logOut": "લોગ આઉટ",
    "signOut": "સાઇન આઉટ",
    "demoMode": "ડેમો મોડ",
    "openJobs": "નોકરીઓ ખોલો",
    "viewAll": "બધું જુઓ",
    "applyNow": "હવે અરજી કરો",
    "save": "સાચવો",
    "details": "વિગતો"
  },
  "ml": {
    "title": "തൊഴിലാളി വർക്ക്‌സ്‌പേസ്",
    "home": "ഹോം",
    "identity": "എന്റെ കരിയർ ഐഡന്റിറ്റി",
    "jobs": "ജോലികൾ",
    "income": "വരുമാന പാസ്‌പോർട്ട്",
    "training": "പരിശീലനം",
    "resume": "റസ്യൂമെ",
    "coach": "ഇന്റർവ്യൂ കോച്ച്",
    "safety": "സുരക്ഷയും അവകാശങ്ങളും",
    "applications": "അപേക്ഷകൾ",
    "settings": "സെറ്റിംഗുകൾ",
    "welcome": "RozgaarAIയിലേക്ക് സ്വാഗതം",
    "createTitle": "കുറച്ച് മിനിറ്റുകൾക്കകം നിങ്ങളുടെ പരിശോധിച്ച തൊഴിലാളി ഐഡന്റിറ്റി സൃഷ്ടിക്കുക.",
    "createMyWorkerIdentity": "എന്റെ തൊഴിലാളി ഐഡന്റിറ്റി സൃഷ്ടിക്കുക",
    "exploreDemo": "ഡെമോ വർക്ക്‌സ്‌പേസ് കാണുക",
    "logOut": "ലോഗ് ഔട്ട്",
    "signOut": "സൈൻ ഔട്ട്",
    "demoMode": "ഡെമോ മോഡ്",
    "openJobs": "ജോലികൾ തുറക്കുക",
    "viewAll": "എല്ലാം കാണുക",
    "applyNow": "ഇപ്പോൾ അപേക്ഷിക്കുക",
    "save": "സംരക്ഷിക്കുക",
    "details": "വിശദാംശങ്ങൾ"
  },
  "pa": {
    "title": "ਮਜ਼ਦੂਰ ਵਰਕਸਪੇਸ",
    "home": "ਹੋਮ",
    "identity": "ਮੇਰੀ ਕਰੀਅਰ ਪਛਾਣ",
    "jobs": "ਨੌਕਰੀਆਂ",
    "income": "ਆਮਦਨ ਪਾਸਪੋਰਟ",
    "training": "ਟ੍ਰੇਨਿੰਗ",
    "resume": "ਰਿਜ਼ਿਊਮੇ",
    "coach": "ਇੰਟਰਵਿਊ ਕੋਚ",
    "safety": "ਸੁਰੱਖਿਆ ਅਤੇ ਹੱਕ",
    "applications": "ਅਰਜ਼ੀਆਂ",
    "settings": "ਸੈਟਿੰਗਾਂ",
    "welcome": "RozgaarAI ਵਿੱਚ ਸੁਆਗਤ ਹੈ",
    "createTitle": "ਕੁਝ ਮਿੰਟਾਂ ਵਿੱਚ ਆਪਣੀ ਤਸਦੀਕਸ਼ੁਦਾ ਮਜ਼ਦੂਰ ਪਛਾਣ ਬਣਾਓ।",
    "createMyWorkerIdentity": "ਮੇਰੀ ਮਜ਼ਦੂਰ ਪਛਾਣ ਬਣਾਓ",
    "exploreDemo": "ਡੇਮੋ ਵਰਕਸਪੇਸ ਵੇਖੋ",
    "logOut": "ਲੋਗ ਆਉਟ",
    "signOut": "ਸਾਈਨ ਆਉਟ",
    "demoMode": "ਡੇਮੋ ਮੋਡ",
    "openJobs": "ਨੌਕਰੀਆਂ ਖੋਲ੍ਹੋ",
    "viewAll": "ਸਭ ਵੇਖੋ",
    "applyNow": "ਹੁਣ ਅਰਜ਼ੀ ਦਿਓ",
    "save": "ਸੇਵ",
    "details": "ਵੇਰਵੇ"
  }
};

const regionalInsideProduct = {
  mr: {
    hero: { eyebrow: "प्रोडक्टच्या आत", headingPrefix: "रोजगाराला हवा", headingAccent: "विश्वासाचा पूल.", description: "कामगार आणि नियोक्ते जोडणे हा उपायाचा फक्त एक भाग आहे. कौशल्य-प्रशिक्षण NGO आणि फाउंडेशनकडे कामगार व नियोक्ता नेटवर्कशी आधीच विश्वासाचे नाते आहे. RozgaarAI त्यांना डिजिटल ओळख तयार करणे, कौशल्य तयारी पाहणे आणि संमती दिलेल्या कामगारांना योग्य रोजगार संधींशी जोडण्यासाठी समर्पित वर्कस्पेस देते." },
    approach: { eyebrow: "आमचा दृष्टिकोन", ngosPrefix: "NGO", ngosAccent: "केंद्रस्थानी.", workersPrefix: "कामगार", workersAccent: "सक्षम.", employersPrefix: "नियोक्ते", employersAccent: "जोडलेले.", description: "RozgaarAI कौशल्य-प्रशिक्षण संस्थांना कामगार onboarding, कौशल्य पडताळणी आणि कामगारांच्या संमती व नियंत्रणासह योग्य नियोक्त्यांशी जोडण्यास मदत करते." },
    ecosystem: { ariaLabel: "कामगार, NGO आणि नियोक्ता परिसंस्था", workers: { title: "कामगार", copy: "आपली ओळख स्वतःकडे ठेवतात आणि काय शेअर करायचे ते नियंत्रित करतात" }, ngo: { title: "NGO / फाउंडेशन", copy: "onboarding, प्रशिक्षण आणि placement मध्ये मदत करते" }, employers: { title: "नियोक्ते", copy: "संमती दिलेली profiles आणि सत्यापित credentials पाहतात" } },
    ngoWorkspace: { title: "NGO वर्कस्पेस", navigationAria: "NGO वर्कस्पेस preview navigation", navigation: { overview: "आढावा", workers: "कामगार", addWorker: "कामगार जोडा", training: "प्रशिक्षण आणि प्रमाणपत्रे", certificates: "प्रमाणपत्रे", placementPipeline: "प्लेसमेंट पाइपलाइन", employers: "नियोक्ते", jobOpportunities: "नोकरी संधी", reports: "अहवाल आणि विश्लेषण", settings: "सेटिंग्ज" }, securePrivate: "सुरक्षित. खाजगी.", workerFirst: "कामगार प्रथम.", workerConsent: "कामगारांचा डेटा त्यांचाच असतो. आपण त्यांच्या संमतीने काम करता.", verifiedNgo: "सत्यापित NGO", orgTagline: "उपजीविका घडवणे. संधी जोडणे.", notifications: "सूचना", admin: "प्रशासक" },
    dashboard: { todayAtGlance: "आजचा आढावा", demoData: "डेमो डेटा", metrics: { workersReady: "ओळखीसाठी तयार कामगार", trainingPending: "पडताळणीसाठी प्रलंबित प्रशिक्षण पूर्णता", openRequirements: "उघड्या नियोक्ता आवश्यकता", consentRequests: "कारवाईची वाट पाहणाऱ्या संमती विनंत्या" }, actions: { viewWorkers: "कामगार पाहा", reviewNow: "आता तपासा", viewJobs: "नोकऱ्या पाहा", viewRequests: "विनंत्या पाहा" } },
    pipeline: { title: "कामगार प्रवास पाइपलाइन", steps: { onboard: { title: "ऑनबोर्ड", copy: "डिजिटल ID तयार करा आणि तपशील घ्या" }, trainVerify: { title: "प्रशिक्षण व पडताळणी", copy: "प्रशिक्षण track करा आणि कौशल्य पडताळा" }, ready: { title: "तयार", copy: "नियोक्ता ओळखीसाठी तयार कामगार" }, introduced: { title: "ओळख करून दिली", copy: "नियोक्त्यांशी ओळख करून दिलेले कामगार" }, placed: { title: "नियुक्त", copy: "placement आणि support track करा" } } },
    jobs: { title: "सक्रिय नोकरी संधी", viewAll: "सर्व नोकऱ्या पाहा", matches: "{count} जुळणी", titles: { salesAssociate: "सेल्स असोसिएट", machineOperator: "मशीन ऑपरेटर", fieldTechnician: "फील्ड टेक्निशियन", deliveryExecutive: "डिलिव्हरी एक्झिक्युटिव्ह" } },
    activity: { title: "अलीकडील क्रिया", trainingCompleted: "45 कामगारांनी 'बेसिक इलेक्ट्रिकल्स' प्रशिक्षण पूर्ण केले", twoHoursAgo: "2 तासांपूर्वी" },
    features: { workerOwnedIdentity: { title: "कामगार-मालकीची ओळख", copy: "कामगार profile वर पूर्ण नियंत्रण ठेवतात आणि काय, कुणाशी आणि कधी शेअर करायचे ते ठरवतात." }, trustedAssistance: { title: "विश्वासू मदत", copy: "NGO मार्गदर्शन आणि support देऊन कामगार profiles पूर्ण, मजबूत आणि पडताळण्यास मदत करतात." }, consentBasedHiring: { title: "संमती-आधारित नियुक्ती", copy: "नियोक्त्यांना फक्त कामगारांनी स्पष्ट संमतीने शेअर केलेली माहिती दिसते." }, actions: { exploreWorkspace: "NGO वर्कस्पेस पाहा", seeEcosystem: "परिसंस्था कशी काम करते ते पाहा" }, workspaceActionHint: "वर्कस्पेस प्रत्यक्ष पाहा" }
  },
  bn: {
    hero: { eyebrow: "পণ্যের ভিতরে", headingPrefix: "কর্মসংস্থানের দরকার", headingAccent: "বিশ্বস্ত সেতু।", description: "কর্মী ও নিয়োগকর্তাকে যুক্ত করা সমাধানের শুধু একটি অংশ। দক্ষতা-প্রশিক্ষণ NGO ও ফাউন্ডেশনের কর্মী এবং নিয়োগকর্তা নেটওয়ার্কের সঙ্গে আগে থেকেই বিশ্বাসের সম্পর্ক আছে। RozgaarAI তাদের ডিজিটাল পরিচয় তৈরি, দক্ষতা প্রস্তুতি পর্যবেক্ষণ এবং সম্মতি দেওয়া কর্মীদের উপযুক্ত কর্মসংস্থানের সুযোগে যুক্ত করার জন্য একটি নিবেদিত workspace দেয়।" },
    approach: { eyebrow: "আমাদের পদ্ধতি", ngosPrefix: "NGO", ngosAccent: "কেন্দ্রে।", workersPrefix: "কর্মীরা", workersAccent: "ক্ষমতায়িত।", employersPrefix: "নিয়োগকর্তারা", employersAccent: "সংযুক্ত।", description: "RozgaarAI দক্ষতা-প্রশিক্ষণ সংস্থাগুলিকে কর্মী onboard করা, দক্ষতা যাচাই করা এবং কর্মীর সম্মতি ও নিয়ন্ত্রণের সঙ্গে সঠিক নিয়োগকর্তার কাছে যুক্ত করতে সাহায্য করে।" },
    ecosystem: { ariaLabel: "কর্মী, NGO ও নিয়োগকর্তা ecosystem", workers: { title: "কর্মী", copy: "নিজেদের পরিচয়ের মালিক এবং কী শেয়ার করবেন তা নিয়ন্ত্রণ করেন" }, ngo: { title: "NGO / ফাউন্ডেশন", copy: "onboarding, training ও placement সহায়তা করে" }, employers: { title: "নিয়োগকর্তা", copy: "সম্মত profiles ও যাচাইকৃত credentials দেখেন" } },
    ngoWorkspace: { title: "NGO वर्कस्पेस", navigationAria: "NGO वर्कस्पेस पूर्वावलोकन नेविगेशन", navigation: { overview: "ওভারভিউ", workers: "কর্মী", addWorker: "কর্মী যোগ করুন", training: "প্রশিক্ষণ ও সার্টিফিকেশন", certificates: "সার্টিফিকেট", placementPipeline: "প্লেসমেন্ট পাইপলাইন", employers: "নিয়োগকর্তা", jobOpportunities: "চাকরির সুযোগ", reports: "রিপোর্ট ও অ্যানালিটিক্স", settings: "সেটিংস" }, securePrivate: "নিরাপদ। ব্যক্তিগত।", workerFirst: "কর্মী আগে।", workerConsent: "কর্মীরা নিজেদের ডেটার মালিক। আপনি তাঁদের সম্মতিতে কাজ করেন।", verifiedNgo: "যাচাইকৃত NGO", orgTagline: "জীবিকা গড়া। সুযোগের সেতু তৈরি।", notifications: "বিজ্ঞপ্তি", admin: "অ্যাডমিন" },
    dashboard: { todayAtGlance: "আজকের এক নজর", demoData: "ডেমো ডেটা", metrics: { workersReady: "পরিচয়ের জন্য প্রস্তুত কর্মী", trainingPending: "যাচাইয়ের অপেক্ষায় প্রশিক্ষণ সম্পন্ন", openRequirements: "খোলা নিয়োগকর্তা চাহিদা", consentRequests: "কর্মপ্রয়োজনীয় সম্মতি অনুরোধ" }, actions: { viewWorkers: "কর্মী দেখুন", reviewNow: "এখন পর্যালোচনা করুন", viewJobs: "চাকরি দেখুন", viewRequests: "অনুরোধ দেখুন" } },
    pipeline: { title: "কর্মী যাত্রা পাইপলাইন", steps: { onboard: { title: "ऑनबोर्ड", copy: "ডিজিটাল ID তৈরি ও বিস্তারিত নিন" }, trainVerify: { title: "প্রশিক্ষণ ও যাচাই", copy: "প্রশিক্ষণ track করুন ও দক্ষতা যাচাই করুন" }, ready: { title: "প্রস্তুত", copy: "নিয়োগকর্তা পরিচয়ের জন্য প্রস্তুত কর্মী" }, introduced: { title: "পরিচয় করানো", copy: "নিয়োগকর্তাদের সঙ্গে পরিচয় করানো কর্মী" }, placed: { title: "नियुक्त", copy: "placement ও support track করুন" } } },
    jobs: { title: "সক্রিয় চাকরির সুযোগ", viewAll: "সব চাকরি দেখুন", matches: "{count} মিল", titles: { salesAssociate: "সেলস অ্যাসোসিয়েট", machineOperator: "মেশিন অপারেটর", fieldTechnician: "ফিল্ড টেকনিশিয়ান", deliveryExecutive: "ডেলিভারি এক্সিকিউটিভ" } },
    activity: { title: "সাম্প্রতিক কার্যকলাপ", trainingCompleted: "45 জন কর্মী 'বেসিক ইলেকট্রিক্যালস' প্রশিক্ষণ সম্পন্ন করেছেন", twoHoursAgo: "2 ঘন্টা আগে" },
    features: { workerOwnedIdentity: { title: "কর্মী-মালিকানাধীন পরিচয়", copy: "কর্মীরা profile-এর পূর্ণ নিয়ন্ত্রণ রাখেন এবং কী, কাকে ও কখন শেয়ার করবেন তা ঠিক করেন।" }, trustedAssistance: { title: "বিশ্বস্ত সহায়তা", copy: "NGO নির্দেশনা ও support দিয়ে কর্মীদের profiles সম্পূর্ণ, শক্তিশালী ও যাচাই করতে সাহায্য করে।" }, consentBasedHiring: { title: "সম্মতি-ভিত্তিক নিয়োগ", copy: "নিয়োগকর্তারা শুধু কর্মীরা স্পষ্ট সম্মতিতে শেয়ার করা তথ্য দেখেন।" }, actions: { exploreWorkspace: "NGO ওয়ার্কস্পেস দেখুন", seeEcosystem: "ইকোসিস্টেম কীভাবে কাজ করে দেখুন" }, workspaceActionHint: "Workspace কাজ করতে দেখুন" }
  },
  te: {
    hero: { eyebrow: "ప్రొడక్ట్ లోపల", headingPrefix: "ఉపాధికి అవసరం", headingAccent: "నమ్మకమైన వంతెన.", description: "కార్మికులు మరియు ఉద్యోగదాతలను కలపడం పరిష్కారంలో ఒక భాగం మాత్రమే. నైపుణ్య శిక్షణ NGOలు మరియు ఫౌండేషన్లకు కార్మికులు, ఉద్యోగదాత నెట్‌వర్క్‌లతో ఇప్పటికే నమ్మకమైన సంబంధాలు ఉన్నాయి. RozgaarAI వారికి డిజిటల్ గుర్తింపు సృష్టి, నైపుణ్య సిద్ధత పర్యవేక్షణ మరియు సమ్మతి ఇచ్చిన కార్మికులను సరైన ఉపాధి అవకాశాలతో కలపడానికి ప్రత్యేక workspace ఇస్తుంది." },
    approach: { eyebrow: "మా విధానం", ngosPrefix: "NGOలు", ngosAccent: "కేంద్రంలో.", workersPrefix: "కార్మికులు", workersAccent: "సశక్తం.", employersPrefix: "ఉద్యోగదాతలు", employersAccent: "కలుపబడ్డారు.", description: "RozgaarAI నైపుణ్య-శిక్షణ సంస్థలకు కార్మికులను onboard చేయడం, వారి నైపుణ్యాలను ధృవీకరించడం, కార్మికుల సమ్మతి మరియు నియంత్రణతో సరైన ఉద్యోగదాతలతో కలపడం సాధ్యం చేస్తుంది." },
    ecosystem: { ariaLabel: "కార్మికుడు, NGO మరియు ఉద్యోగదాత ecosystem", workers: { title: "కార్మికులు", copy: "తమ గుర్తింపును స్వంతంగా ఉంచి ఏమి పంచుకోవాలో నియంత్రిస్తారు" }, ngo: { title: "NGO / ఫౌండేషన్", copy: "onboarding, training మరియు placement కు మద్దతు ఇస్తుంది" }, employers: { title: "ఉద్యోగదాతలు", copy: "సమ్మతి ఉన్న profiles మరియు verified credentials చూస్తారు" } },
    ngoWorkspace: { title: "NGO वर्कस्पेस", navigationAria: "NGO वर्कस्पेस पूर्वावलोकन नेविगेशन", navigation: { overview: "అవలోకనం", workers: "కార్మికులు", addWorker: "కార్మికుడిని జోడించు", training: "శిక్షణ & సర్టిఫికేషన్లు", certificates: "సర్టిఫికెట్లు", placementPipeline: "ప్లేస్‌మెంట్ పైప్‌లైన్", employers: "ఉద్యోగదాతలు", jobOpportunities: "ఉద్యోగ అవకాశాలు", reports: "రిపోర్టులు & విశ్లేషణ", settings: "సెట్టింగులు" }, securePrivate: "సురక్షితం. ప్రైవేట్.", workerFirst: "కార్మికుడు ముందుగా.", workerConsent: "కార్మికులు తమ డేటాను స్వంతం చేసుకుంటారు. మీరు వారి సమ్మతితో పనిచేస్తారు.", verifiedNgo: "ధృవీకరించిన NGO", orgTagline: "జీవనోపాధులు నిర్మించడం. అవకాశాలను కలపడం.", notifications: "నోటిఫికేషన్లు", admin: "అడ్మిన్" },
    dashboard: { todayAtGlance: "ఈరోజు ఒక చూపు", demoData: "డెమో డేటా", metrics: { workersReady: "పరిచయానికి సిద్ధమైన కార్మికులు", trainingPending: "ధృవీకరణకు పెండింగ్‌లో ఉన్న శిక్షణ పూర్తి", openRequirements: "తెరిచి ఉన్న ఉద్యోగదాత అవసరాలు", consentRequests: "చర్య కోసం ఎదురుచూస్తున్న సమ్మతి అభ్యర్థనలు" }, actions: { viewWorkers: "కార్మికులను చూడండి", reviewNow: "ఇప్పుడే సమీక్షించండి", viewJobs: "ఉద్యోగాలు చూడండి", viewRequests: "అభ్యర్థనలు చూడండి" } },
    pipeline: { title: "కార్మిక ప్రయాణ పైప్‌లైన్", steps: { onboard: { title: "ऑनबोर्ड", copy: "డిజిటల్ ID సృష్టించి వివరాలు తీసుకోండి" }, trainVerify: { title: "శిక్షణ & ధృవీకరణ", copy: "శిక్షణను track చేసి నైపుణ్యాలను ధృవీకరించండి" }, ready: { title: "సిద్ధం", copy: "ఉద్యోగదాత పరిచయానికి సిద్ధమైన కార్మికులు" }, introduced: { title: "పరిచయం అయ్యారు", copy: "ఉద్యోగదాతలకు పరిచయం చేసిన కార్మికులు" }, placed: { title: "नियुक्त", copy: "placement మరియు support track చేయండి" } } },
    jobs: { title: "సక్రియ ఉద్యోగ అవకాశాలు", viewAll: "అన్ని ఉద్యోగాలు చూడండి", matches: "{count} సరిపోలికలు", titles: { salesAssociate: "సేల్స్ అసోసియేట్", machineOperator: "మెషిన్ ఆపరేటర్", fieldTechnician: "ఫీల్డ్ టెక్నీషియన్", deliveryExecutive: "డెలివరీ ఎగ్జిక్యూటివ్" } },
    activity: { title: "ఇటీవలి కార్యాచరణ", trainingCompleted: "45 మంది కార్మికులు 'బేసిక్ ఎలక్ట్రికల్స్' శిక్షణ పూర్తి చేశారు", twoHoursAgo: "2 గంటల క్రితం" },
    features: { workerOwnedIdentity: { title: "కార్మికుల స్వంత గుర్తింపు", copy: "కార్మికులు తమ profile పై పూర్తి నియంత్రణ ఉంచి ఏమి, ఎవరితో, ఎప్పుడు పంచుకోవాలో నిర్ణయిస్తారు." }, trustedAssistance: { title: "నమ్మకమైన సహాయం", copy: "NGOలు మార్గదర్శకత్వం మరియు support తో కార్మిక profiles పూర్తి, బలంగా, ధృవీకరించబడేలా సహాయం చేస్తాయి." }, consentBasedHiring: { title: "సమ్మతి-ఆధారిత hiring", copy: "ఉద్యోగదాతలు కార్మికులు స్పష్టమైన సమ్మతితో పంచుకున్న సమాచారమే చూస్తారు." }, actions: { exploreWorkspace: "NGO వర్క్‌స్పేస్ చూడండి", seeEcosystem: "ఎకోసిస్టమ్ ఎలా పనిచేస్తుందో చూడండి" }, workspaceActionHint: "వర్క్‌స్పేస్ చర్యలో చూడండి" }
  }
};

function cloneInsideProduct(base, overrides) {
  return deepMerge(base, overrides);
}

regionalInsideProduct.ta = cloneInsideProduct(regionalInsideProduct.te, {
  hero: { eyebrow: "தயாரிப்பின் உள்ளே", headingPrefix: "வேலைவாய்ப்புக்கு தேவை", headingAccent: "நம்பகமான பாலம்.", description: "தொழிலாளர்களையும் வேலை வழங்குநர்களையும் இணைப்பது தீர்வின் ஒரு பகுதி மட்டுமே. திறன் பயிற்சி NGOகள் மற்றும் foundations ஏற்கனவே தொழிலாளர்கள் மற்றும் வேலை வழங்குநர் networks உடன் நம்பகமான உறவுகளை கொண்டுள்ளன. RozgaarAI அவர்களுக்கு டிஜிட்டல் அடையாளம் உருவாக்க, திறன் தயார்நிலையை கண்காணிக்க மற்றும் சம்மதித்த தொழிலாளர்களை பொருத்தமான வேலை வாய்ப்புகளுடன் இணைக்க தனி workspace வழங்குகிறது." },
  approach: { eyebrow: "எங்கள் அணுகுமுறை", ngosPrefix: "NGOகள்", ngosAccent: "மையத்தில்.", workersPrefix: "தொழிலாளர்கள்", workersAccent: "சக்திவாய்ந்தவர்கள்.", employersPrefix: "வேலை வழங்குநர்கள்", employersAccent: "இணைக்கப்பட்டவர்கள்." },
  ngoWorkspace: { navigation: { overview: "மேலோட்டம்", workers: "தொழிலாளர்கள்", addWorker: "தொழிலாளர் சேர்க்க", training: "பயிற்சி & சான்றிதழ்கள்", certificates: "சான்றிதழ்கள்", placementPipeline: "பிளேஸ்மென்ட் வழித்தடம்", employers: "வேலை வழங்குநர்கள்", jobOpportunities: "வேலை வாய்ப்புகள்", reports: "அறிக்கைகள் & பகுப்பாய்வு", settings: "அமைப்புகள்" }, securePrivate: "பாதுகாப்பானது. தனிப்பட்டது.", workerFirst: "தொழிலாளர் முதலில்.", verifiedNgo: "சரிபார்க்கப்பட்ட NGO", notifications: "அறிவிப்புகள்", admin: "நிர்வாகி" },
  dashboard: { todayAtGlance: "இன்றைய ஒரு பார்வை", demoData: "டெமோ தரவு", actions: { viewWorkers: "தொழிலாளர்களைக் காண்க", reviewNow: "இப்போது பரிசீலிக்க", viewJobs: "வேலைகள் காண்க", viewRequests: "கோரிக்கைகள் காண்க" } },
  jobs: { viewAll: "அனைத்து வேலைகளைக் காண்க", matches: "{count} பொருத்தங்கள்", titles: { salesAssociate: "விற்பனை அசோசியேட்", machineOperator: "மெஷின் ஆபரேட்டர்", fieldTechnician: "புல தொழில்நுட்ப நிபுணர்", deliveryExecutive: "டெலிவரி எக்ஸிக்யூட்டிவ்" } },
  activity: { title: "சமீபத்திய செயல்பாடு", trainingCompleted: "45 தொழிலாளர்கள் 'Basic Electricals' பயிற்சியை முடித்தனர்", twoHoursAgo: "2 மணி நேரம் முன்பு" },
  features: { actions: { exploreWorkspace: "NGO பணிமையம் பார்க்க", seeEcosystem: "இக்கோசிஸ்டம் எப்படி செயல்படுகிறது பார்க்க" }, workspaceActionHint: "பணிமையம் செயல்பாட்டில் பார்க்க" }
});
regionalInsideProduct.kn = cloneInsideProduct(regionalInsideProduct.te, {
  hero: { eyebrow: "ಉತ್ಪನ್ನದ ಒಳಗೆ", headingPrefix: "ಉದ್ಯೋಗಕ್ಕೆ ಬೇಕು", headingAccent: "ವಿಶ್ವಾಸಾರ್ಹ ಸೇತುವೆ." },
  approach: { eyebrow: "ನಮ್ಮ ವಿಧಾನ", ngosPrefix: "NGOಗಳು", ngosAccent: "ಕೇಂದ್ರದಲ್ಲಿ.", workersPrefix: "ಕಾರ್ಮಿಕರು", workersAccent: "ಸಬಲರು.", employersPrefix: "ಉದ್ಯೋಗದಾತರು", employersAccent: "ಸಂಪರ್ಕಿತರು." },
  ngoWorkspace: { navigation: { overview: "ಅವಲೋಕನ", workers: "ಕಾರ್ಮಿಕರು", addWorker: "ಕಾರ್ಮಿಕ ಸೇರಿಸಿ", training: "ತರಬೇತಿ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರಗಳು", certificates: "ಪ್ರಮಾಣಪತ್ರಗಳು", placementPipeline: "ಪ್ಲೇಸ್ಮೆಂಟ್ ಪೈಪ್‌ಲೈನ್", employers: "ಉದ್ಯೋಗದಾತರು", jobOpportunities: "ಉದ್ಯೋಗ ಅವಕಾಶಗಳು", reports: "ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" }, securePrivate: "ಸುರಕ್ಷಿತ. ಖಾಸಗಿ.", workerFirst: "ಕಾರ್ಮಿಕ ಮೊದಲು.", verifiedNgo: "ಪರಿಶೀಲಿತ NGO", notifications: "ಅಧಿಸೂಚನೆಗಳು", admin: "ನಿರ್ವಾಹಕ" },
  dashboard: { todayAtGlance: "ಇಂದಿನ ನೋಟ", demoData: "ಡೆಮೋ ಡೇಟಾ", actions: { viewWorkers: "ಕಾರ್ಮಿಕರನ್ನು ನೋಡಿ", reviewNow: "ಈಗ ಪರಿಶೀಲಿಸಿ", viewJobs: "ಉದ್ಯೋಗಗಳನ್ನು ನೋಡಿ", viewRequests: "ವಿನಂತಿಗಳನ್ನು ನೋಡಿ" } },
  jobs: { viewAll: "ಎಲ್ಲ ಉದ್ಯೋಗಗಳನ್ನು ನೋಡಿ", matches: "{count} ಹೊಂದಾಣಿಕೆಗಳು", titles: { salesAssociate: "ಸೇಲ್ಸ್ ಅಸೋಸಿಯೇಟ್", machineOperator: "ಮೆಷಿನ್ ಆಪರೇಟರ್", fieldTechnician: "ಫೀಲ್ಡ್ ಟೆಕ್ನಿಷಿಯನ್", deliveryExecutive: "ಡೆಲಿವರಿ ಎಕ್ಸಿಕ್ಯೂಟಿವ್" } },
  activity: { title: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ", trainingCompleted: "45 ಕಾರ್ಮಿಕರು 'ಬೇಸಿಕ್ ಎಲೆಕ್ಟ್ರಿಕಲ್ಸ್' ತರಬೇತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದರು", twoHoursAgo: "2 ಗಂಟೆಗಳ ಹಿಂದೆ" },
  features: { actions: { exploreWorkspace: "NGO ಕಾರ್ಯಕ್ಷೇತ್ರ ನೋಡಿ", seeEcosystem: "ಪರಿಸರ ವ್ಯವಸ್ಥೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ನೋಡಿ" }, workspaceActionHint: "ಕಾರ್ಯಕ್ಷೇತ್ರ ಕಾರ್ಯದಲ್ಲಿ ನೋಡಿ" }
});
regionalInsideProduct.gu = cloneInsideProduct(regionalInsideProduct.mr, {
  hero: { eyebrow: "પ્રોડક્ટની અંદર", headingPrefix: "રોજગારને જોઈએ", headingAccent: "વિશ્વાસનો પુલ." },
  approach: { eyebrow: "અમારો અભિગમ", ngosPrefix: "NGO", ngosAccent: "કેન્દ્રમાં.", workersPrefix: "કામદારો", workersAccent: "સશક્ત.", employersPrefix: "નિયોક્તાઓ", employersAccent: "જોડાયેલા." },
  ngoWorkspace: { navigation: { overview: "ઝાંખી", workers: "કામદારો", addWorker: "કામદાર ઉમેરો", training: "તાલીમ અને પ્રમાણપત્રો", certificates: "પ્રમાણપત્રો", placementPipeline: "પ્લેસમેન્ટ પાઇપલાઇન", employers: "નિયોક્તાઓ", jobOpportunities: "નોકરી તકો", reports: "રિપોર્ટ અને વિશ્લેષણ", settings: "સેટિંગ્સ" }, securePrivate: "સુરક્ષિત. ખાનગી.", workerFirst: "કામદાર પહેલા.", verifiedNgo: "ચકાસાયેલ NGO", notifications: "સૂચનાઓ", admin: "એડમિન" },
  dashboard: { todayAtGlance: "આજની ઝાંખી", demoData: "ડેમો ડેટા", actions: { viewWorkers: "કામદારો જુઓ", reviewNow: "હમણાં સમીક્ષા કરો", viewJobs: "નોકરીઓ જુઓ", viewRequests: "વિનંતીઓ જુઓ" } },
  jobs: { viewAll: "બધી નોકરીઓ જુઓ", matches: "{count} મેળ", titles: { salesAssociate: "સેલ્સ એસોસિયેટ", machineOperator: "મશીન ઓપરેટર", fieldTechnician: "ફીલ્ડ ટેક્નિશિયન", deliveryExecutive: "ડિલિવરી એક્ઝિક્યુટિવ" } },
  activity: { title: "તાજેતરની પ્રવૃત્તિ", trainingCompleted: "45 કામદારોએ 'બેસિક ઇલેક્ટ્રિકલ્સ' તાલીમ પૂર્ણ કરી", twoHoursAgo: "2 કલાક પહેલાં" },
  features: { actions: { exploreWorkspace: "NGO કાર્યસ્થળ જુઓ", seeEcosystem: "ઇકોસિસ્ટમ કેવી રીતે કામ કરે છે જુઓ" }, workspaceActionHint: "કાર્યસ્થળ કાર્યમાં જુઓ" }
});
regionalInsideProduct.ml = cloneInsideProduct(regionalInsideProduct.te, {
  hero: { eyebrow: "ഉൽപ്പന്നത്തിനുള്ളിൽ", headingPrefix: "തൊഴിലിന് വേണം", headingAccent: "വിശ്വസ്ത പാലം." },
  approach: { eyebrow: "ഞങ്ങളുടെ സമീപനം", ngosPrefix: "NGOകൾ", ngosAccent: "കേന്ദ്രത്തിൽ.", workersPrefix: "തൊഴിലാളികൾ", workersAccent: "ശക്തരായി.", employersPrefix: "തൊഴിലുടമകൾ", employersAccent: "ബന്ധപ്പെട്ടു." },
  ngoWorkspace: { navigation: { overview: "അവലോകനം", workers: "തൊഴിലാളികൾ", addWorker: "തൊഴിലാളിയെ ചേർക്കുക", training: "പരിശീലനം & സർട്ടിഫിക്കേഷനുകൾ", certificates: "സർട്ടിഫിക്കറ്റുകൾ", placementPipeline: "പ്ലേസ്മെന്റ് പൈപ്പ്‌ലൈൻ", employers: "തൊഴിലുടമകൾ", jobOpportunities: "ജോലി അവസരങ്ങൾ", reports: "റിപ്പോർട്ടുകളും വിശകലനം", settings: "സെറ്റിംഗ്സ്" }, securePrivate: "സുരക്ഷിതം. സ്വകാര്യത.", workerFirst: "തൊഴിലാളി ആദ്യം.", verifiedNgo: "പരിശോധിച്ച NGO", notifications: "അറിയിപ്പുകൾ", admin: "അഡ്മിൻ" },
  dashboard: { todayAtGlance: "ഇന്നത്തെ ഒറ്റനോട്ടം", demoData: "ഡെമോ ഡാറ്റ", actions: { viewWorkers: "തൊഴിലാളികളെ കാണുക", reviewNow: "ഇപ്പോൾ പരിശോധിക്കുക", viewJobs: "ജോലികൾ കാണുക", viewRequests: "അഭ്യർത്ഥനകൾ കാണുക" } },
  jobs: { viewAll: "എല്ലാ ജോലികളും കാണുക", matches: "{count} പൊരുത്തങ്ങൾ", titles: { salesAssociate: "സെയിൽസ് അസോസിയേറ്റ്", machineOperator: "മെഷീൻ ഓപ്പറേറ്റർ", fieldTechnician: "ഫീൽഡ് ടെക്നീഷ്യൻ", deliveryExecutive: "ഡെലിവറി എക്സിക്യൂട്ടീവ്" } },
  activity: { title: "സമീപകാല പ്രവർത്തനം", trainingCompleted: "45 തൊഴിലാളികൾ 'ബേസിക് ഇലക്ട്രിക്കൽസ്' പരിശീലനം പൂർത്തിയാക്കി", twoHoursAgo: "2 മണിക്കൂർ മുമ്പ്" },
  features: { actions: { exploreWorkspace: "NGO പ്രവർത്തനസ്ഥലം കാണുക", seeEcosystem: "ഇക്കോസിസ്റ്റം എങ്ങനെ പ്രവർത്തിക്കുന്നു കാണുക" }, workspaceActionHint: "പ്രവർത്തനസ്ഥലം പ്രവർത്തനത്തിൽ കാണുക" }
});
regionalInsideProduct.pa = cloneInsideProduct(regionalInsideProduct.mr, {
  hero: { eyebrow: "ਉਤਪਾਦ ਦੇ ਅੰਦਰ", headingPrefix: "ਰੋਜ਼ਗਾਰ ਨੂੰ ਚਾਹੀਦਾ", headingAccent: "ਭਰੋਸੇਯੋਗ ਪੁਲ." },
  approach: { eyebrow: "ਸਾਡਾ ਢੰਗ", ngosPrefix: "NGO", ngosAccent: "ਕੇਂਦਰ ਵਿੱਚ.", workersPrefix: "ਮਜ਼ਦੂਰ", workersAccent: "ਸਸ਼ਕਤ.", employersPrefix: "ਨਿਯੋਗਕਰਤਾ", employersAccent: "ਜੁੜੇ ਹੋਏ." },
  ngoWorkspace: { navigation: { overview: "ਝਲਕ", workers: "ਮਜ਼ਦੂਰ", addWorker: "ਮਜ਼ਦੂਰ ਜੋੜੋ", training: "ਟ੍ਰੇਨਿੰਗ ਅਤੇ ਸਰਟੀਫਿਕੇਸ਼ਨ", certificates: "ਸਰਟੀਫਿਕੇਟ", placementPipeline: "ਪਲੇਸਮੈਂਟ ਪਾਈਪਲਾਈਨ", employers: "ਨਿਯੋਗਕਰਤਾ", jobOpportunities: "ਨੌਕਰੀ ਮੌਕੇ", reports: "ਰਿਪੋਰਟਾਂ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ", settings: "ਸੈਟਿੰਗਾਂ" }, securePrivate: "ਸੁਰੱਖਿਅਤ. ਨਿੱਜੀ.", workerFirst: "ਮਜ਼ਦੂਰ ਪਹਿਲਾਂ.", verifiedNgo: "ਤਸਦੀਕਸ਼ੁਦਾ NGO", notifications: "ਸੂਚਨਾਵਾਂ", admin: "ਐਡਮਿਨ" },
  dashboard: { todayAtGlance: "ਅੱਜ ਦੀ ਝਲਕ", demoData: "ਡੇਮੋ ਡਾਟਾ", actions: { viewWorkers: "ਮਜ਼ਦੂਰ ਵੇਖੋ", reviewNow: "ਹੁਣ ਸਮੀਖਿਆ ਕਰੋ", viewJobs: "ਨੌਕਰੀਆਂ ਵੇਖੋ", viewRequests: "ਬੇਨਤੀਆਂ ਵੇਖੋ" } },
  jobs: { viewAll: "ਸਾਰੀਆਂ ਨੌਕਰੀਆਂ ਵੇਖੋ", matches: "{count} ਮਿਲਾਣ", titles: { salesAssociate: "ਸੇਲਜ਼ ਐਸੋਸੀਏਟ", machineOperator: "ਮਸ਼ੀਨ ਓਪਰੇਟਰ", fieldTechnician: "ਫੀਲਡ ਟੈਕਨੀਸ਼ੀਅਨ", deliveryExecutive: "ਡਿਲਿਵਰੀ ਐਗਜ਼ਿਕਿਊਟਿਵ" } },
  activity: { title: "ਹਾਲੀਆ ਗਤੀਵਿਧੀ", trainingCompleted: "45 ਮਜ਼ਦੂਰਾਂ ਨੇ 'ਬੇਸਿਕ ਇਲੈਕਟ੍ਰਿਕਲਜ਼' ਟ੍ਰੇਨਿੰਗ ਪੂਰੀ ਕੀਤੀ", twoHoursAgo: "2 ਘੰਟੇ ਪਹਿਲਾਂ" },
  features: { actions: { exploreWorkspace: "NGO ਵਰਕਸਪੇਸ ਵੇਖੋ", seeEcosystem: "ਇਕੋਸਿਸਟਮ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ ਵੇਖੋ" }, workspaceActionHint: "ਵਰਕਸਪੇਸ ਕਾਰਵਾਈ ਵਿੱਚ ਵੇਖੋ" }
});

function buildRegionalOverride(code, label) {
  const copy = regionalCopy[code];
  if (!copy) return {};
  return {
    languageName: label,
    otherLanguage: "English",
    languageLabel: regionalNavMain[code]?.language || label,
    languageChanged: regionalLanguageChanged[code],
    workerWorkspace: completeWorkerWorkspace(code),
    insideProduct: deepMerge(en.insideProduct, regionalInsideProduct[code] || {}),
    navMain: { ...regionalNavMain[code] },
    heroBadge: copy.badge,
    heroTitle: copy.title,
    heroSubtitle: copy.subtitle,
    createCareerIdentity: copy.create,
    createIdentity: copy.create,
    heroEmployerDashboard: copy.employerDash,
    exploreDemo: copy.demo,
    startDemo: copy.demo,
    footer: {
      tagline: copy.title,
      copy: copy.footerCopy,
      workers: copy.workers,
      employers: copy.employers,
      impact: copy.impact,
      about: copy.about,
      documentation: copy.docs,
      contact: copy.contact
    },
    demoWorkersPage: {
      eyebrow: copy.demo,
      titlePrefix: copy.demo,
      titleAccent: "",
      titleSuffix: copy.workers,
      description: copy.subtitle,
      bannerTitlePrefix: copy.demo,
      bannerTitleAccent: "",
      bannerTitleSuffix: "",
      bannerCopy: copy.howCopy,
      bannerNote: "",
      searchPlaceholder: `${copy.workers} શોધો...`.replace("શોધો", code === "bn" ? "খুঁজুন" : code === "mr" ? "शोधा" : code === "ta" ? "தேடுங்கள்" : code === "te" ? "వెతకండి" : code === "kn" ? "ಹುಡುಕಿ" : code === "ml" ? "തിരയുക" : code === "pa" ? "ਲੱਭੋ" : "શોધો"),
      verified: code === "gu" ? "ચકાસાયેલ" : code === "bn" ? "যাচাইকৃত" : code === "mr" ? "सत्यापित" : code === "ta" ? "சரிபார்க்கப்பட்டது" : code === "te" ? "ధృవీకరించబడింది" : code === "kn" ? "ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : code === "ml" ? "പരിശോധിച്ചു" : code === "pa" ? "ਤਸਦੀਕਸ਼ੁਦਾ" : "Verified"
    },
    landingV2: {
      challengeEyebrow: copy.challengeEyebrow,
      challengeTitlePrefix: copy.challengePrefix,
      challengeTitleAccent: copy.challengeAccent,
      challengeCopyLine1: en.landingV2.challengeCopyLine1,
      challengeCopyLine2: copy.proofMissing,
      howEyebrow: copy.how,
      howTitlePrefix: copy.howPrefix,
      howTitleAccent: copy.howAccent,
      howCopy: copy.howCopy
    },
    employerPreview: {
      label: copy.employersLabel,
      titleLine1: copy.hire1,
      titleLine2: copy.hire2,
      description: copy.employerCopy,
      openDashboard: copy.employerDash,
      exploreHow: copy.how,
      note: copy.demo,
      digitalIdentity: copy.create,
      verified: code === "gu" ? "ચકાસાયેલ" : code === "bn" ? "যাচাইকৃত" : code === "mr" ? "सत्यापित" : code === "ta" ? "சரிபார்க்கப்பட்டது" : code === "te" ? "ధృవీకరించబడింది" : code === "kn" ? "ಪರಿಶೀಲಿಸಲಾಗಿದೆ" : code === "ml" ? "പരിശോധിച്ചു" : code === "pa" ? "ਤਸਦੀਕਸ਼ੁਦਾ" : "Verified"
    }
  };
}

const completedHi = {
  ...hi,
  workerWorkspace: completeWorkerWorkspace("hi")
};

const regionalLocales = Object.fromEntries(
  languageConfig
    .filter(({ code }) => !["en", "hi"].includes(code))
    .map(({ code, label }) => [code, deepMerge(en, buildRegionalOverride(code, label))])
);

const translationResources = { en, hi: completedHi, ...regionalLocales };

Object.entries(translationResources).forEach(([locale, resource]) => {
  validateWorkerWorkspaceCompleteness(en.workerWorkspace, resource.workerWorkspace, locale);
});

export const translations = translationResources;
export const supportedLanguages = languageConfig.map(({ code }) => code);
export const defaultLanguage = "en";
export const speechLocales = Object.fromEntries(languageConfig.map(({ code, speechLocale }) => [code, speechLocale]));
export const htmlLanguageCodes = Object.fromEntries(languageConfig.map(({ code, htmlLang }) => [code, htmlLang]));

export function isSupportedLanguage(language) {
  return supportedLanguages.includes(language);
}

export function normalizeLanguage(language) {
  if (!language) return defaultLanguage;
  const normalized = String(language).toLowerCase().split(/[-_]/)[0];
  return isSupportedLanguage(normalized) ? normalized : defaultLanguage;
}

export function getInitialLanguage() {
  if (typeof window === "undefined") return defaultLanguage;
  const stored = window.localStorage.getItem("rozgaarai-language");
  if (isSupportedLanguage(stored)) return stored;
  return normalizeLanguage(window.navigator?.language || defaultLanguage);
}

export function resolveInitialLanguage(account) {
  return normalizeLanguage(account?.preferredLanguage || account?.preferred_language || getInitialLanguage());
}

export function languageLabel(language) {
  return regionalLocaleNames[normalizeLanguage(language)] || "English";
}

export function translate(key, language = defaultLanguage, replacements = {}) {
  const parts = key.split(".");
  const read = (source) => parts.reduce((value, part) => value?.[part], source);
  let value = read(translations[language]) ?? read(translations[defaultLanguage]);

  if (value == null) {
    if (import.meta.env?.DEV) {
      console.warn(`Missing translation key: ${key}`);
    }
    value = "";
  }

  if (typeof value !== "string") return value;
  return Object.entries(replacements).reduce(
    (message, [token, replacement]) => message.replaceAll(`{${token}}`, String(replacement)),
    value
  );
}

export function translateOption(map, value, lang) {
  return translations[lang]?.[map]?.[value] || translations[defaultLanguage]?.[map]?.[value] || value;
}
