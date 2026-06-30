import { baseWages, cityIndex, mockJobs } from "../data/mockData";

const API_URL = import.meta.env.VITE_API_URL;

const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const languageAliases = {
  english: "english",
  "basic english": "english",
  hindi: "hindi",
  marathi: "marathi",
  kannada: "kannada",
  telugu: "telugu",
  tamil: "tamil",
  gujarati: "gujarati",
  bengali: "bengali"
};

const roleQuestions = {
  Plumber: [
    ["How do you find the source of a bathroom leak?", "I first shut off the water if needed, check visible joints, taps, trap, flush tank, and seepage marks, then explain the repair and cost before starting."],
    ["What tools do you carry for a normal plumbing visit?", "I carry pipe wrench, adjustable spanner, teflon tape, cutter, pliers, washers, basic fittings, and safety gloves."],
    ["How do you handle an emergency call?", "I confirm the problem on phone, ask the customer to stop water flow, carry likely fittings, and give a clear time estimate."],
    ["How do you keep work clean in a home?", "I cover the work area, keep removed parts aside, clean after repair, and test the fitting before leaving."],
    ["What wage and timings do you prefer?", "I prefer verified jobs with clear monthly or visit-based payment, weekly rest, and fair overtime for late calls."]
  ],
  Electrician: [
    ["How do you safely start an electrical repair?", "I switch off the supply, test with a tester or multimeter, use insulated tools, and avoid live work unless it is professionally required."],
    ["What electrical tasks are you strongest in?", "I am strong in wiring, switchboard repair, MCB replacement, fan and light fitting, and basic fault finding."],
    ["How do you explain a fault to an employer?", "I explain the issue in simple words, mention safety risk, share repair options, and confirm cost before replacing parts."],
    ["What do you do if a circuit trips repeatedly?", "I isolate appliances or sections one by one, check overload or short circuit, and recommend proper load distribution."],
    ["Why should an employer trust you?", "I follow safety steps, arrive with tools, avoid shortcuts, and test the repair before closing the work."]
  ],
  Driver: [
    ["How do you plan a city route?", "I check traffic, pickup time, fuel, parking rules, and keep the employer updated if there is a delay."],
    ["What makes you a safe driver?", "I follow speed limits, avoid phone use while driving, maintain distance, and keep documents and vehicle checks updated."],
    ["How do you handle difficult passengers?", "I stay calm, listen politely, avoid arguments, and focus on safe completion of the trip."],
    ["What vehicle documents do you check?", "I check license, RC, insurance, PUC, permit if needed, and emergency contacts."],
    ["What work timing suits you?", "I prefer clear duty hours, weekly rest, and overtime terms decided before joining."]
  ],
  "Construction Worker": [
    ["What site work have you done before?", "I have supported material movement, mixing, cleaning, masonry support, and finishing work while following supervisor instructions."],
    ["How do you stay safe on site?", "I wear helmet and shoes when provided, keep distance from risky areas, lift correctly, and report unsafe scaffolding or wiring."],
    ["How do you handle daily wage attendance?", "I reach on time, mark attendance clearly, confirm daily rate, and keep payout terms written or messaged."],
    ["What tools or tasks are you comfortable with?", "I can handle basic tools, material shifting, mixing, tile support, and cleanup depending on site needs."],
    ["What do you ask before joining a site?", "I ask for address, duty hours, wage rate, safety gear, weekly payout day, and contractor contact."]
  ],
  "Domestic Worker": [
    ["What household tasks are you strongest in?", "I am strong in cleaning, cooking support, laundry, kitchen organization, and elderly care routines."],
    ["How do you build trust with a family?", "I arrive on time, communicate clearly, respect privacy, follow house rules, and provide references when available."],
    ["How do you manage multiple tasks?", "I ask the priority, make a routine, finish time-sensitive work first, and confirm special instructions."],
    ["What safety rules do you follow?", "I do not share household details outside, handle appliances carefully, and ask before using new products or equipment."],
    ["What work terms are important to you?", "I prefer clear salary, weekly off, duty hours, leave rules, and respectful communication."]
  ],
  Cook: [
    ["What cuisines or meals can you cook confidently?", "I can prepare regular home meals, dal, sabzi, roti, rice, breakfast items, and adjust spice and oil as requested."],
    ["How do you maintain kitchen hygiene?", "I wash hands, keep raw and cooked food separate, clean counters, store ingredients properly, and check freshness."],
    ["How do you plan meals for a family?", "I ask preferences, diet restrictions, timing, and weekly menu needs before preparing."],
    ["How do you handle feedback on taste?", "I listen calmly, note the preference, and adjust salt, spice, oil, or cooking style from the next meal."],
    ["What makes you reliable as a cook?", "I come on time, keep the kitchen clean, avoid wastage, and communicate early if ingredients are missing."]
  ],
  "Delivery Worker": [
    ["How do you complete deliveries on time?", "I plan routes, check order details, call only when needed, and update delays quickly in the app or by phone."],
    ["How do you handle cash or digital payment?", "I verify amount, collect or confirm payment carefully, and report mismatch immediately."],
    ["What safety steps do you follow on the road?", "I wear helmet, follow traffic rules, avoid speeding, and keep the phone mounted safely for navigation."],
    ["How do you handle customer complaints?", "I stay polite, check order details, call support or employer if needed, and avoid arguments."],
    ["What do you need before joining?", "I need clear payout terms, delivery area, incentive rules, fuel support, and verified office address."]
  ],
  Tailor: [
    ["What stitching work are you best at?", "I am strong in alterations, measurements, finishing, machine stitching, and quality checking."],
    ["How do you avoid measurement mistakes?", "I measure twice, note details clearly, confirm fitting style, and keep the customer informed about changes."],
    ["How do you manage urgent orders?", "I confirm realistic delivery time, prioritize cutting and stitching, and do not overpromise."],
    ["What machines can you use?", "I can use standard sewing machine and basic finishing tools, and I maintain thread, needle, and fabric handling carefully."],
    ["What makes your work high quality?", "Clean finishing, correct size, strong seams, timely delivery, and careful handling of customer fabric."]
  ],
  Beautician: [
    ["Which beauty services can you provide?", "I can do threading, basic facial, waxing support, cleanup, hair setting assistance, and client preparation."],
    ["How do you maintain hygiene with clients?", "I sanitize tools, use clean towels, check skin sensitivity, and keep products organized."],
    ["How do you handle a nervous client?", "I explain the steps, ask comfort level, work gently, and pause if the client is uncomfortable."],
    ["How do you prepare for home service?", "I confirm service list, address, timing, kit items, travel time, and payment before leaving."],
    ["What helps you get repeat customers?", "Polite behavior, clean work, punctuality, honest product use, and listening to customer preferences."]
  ],
  "Security Guard": [
    ["What are your main duties at a gate?", "I check visitors, maintain register, guide delivery people, patrol when required, and alert residents or supervisors."],
    ["How do you handle an unknown visitor?", "I ask purpose, call the resident or office, record details, and do not allow entry without approval."],
    ["What do you do during night duty?", "I stay alert, patrol regularly, check entry points, and report unusual activity immediately."],
    ["How do you manage conflict?", "I speak calmly, avoid physical confrontation unless safety requires it, and call the supervisor or police if needed."],
    ["What records do you maintain?", "Visitor register, vehicle entry, delivery log, shift handover notes, and incident reports."]
  ]
};
const roleQuestionsHi = {
  Plumber: [
    ["बाथरूम में लीकेज कैसे ढूंढते हैं?", "मैं पहले जरूरत होने पर पानी बंद करता हूं, फिर जोड़, नल, ट्रैप, फ्लश टैंक और सीलन के निशान जांचता हूं। काम शुरू करने से पहले मरम्मत और खर्च साफ़ बताता हूं।"],
    ["सामान्य प्लंबिंग काम के लिए कौन से औजार रखते हैं?", "मैं पाइप रिंच, स्पैनर, टेफ्लॉन टेप, कटर, प्लायर, वॉशर, बेसिक फिटिंग और सुरक्षा दस्ताने रखता हूं।"],
    ["इमरजेंसी कॉल कैसे संभालते हैं?", "मैं फोन पर समस्या समझता हूं, ग्राहक से पानी रोकने को कहता हूं, जरूरी फिटिंग लेकर जाता हूं और पहुंचने का समय साफ़ बताता हूं।"],
    ["घर में काम करते समय सफाई कैसे रखते हैं?", "मैं काम की जगह ढकता हूं, निकाले हुए पार्ट अलग रखता हूं, मरम्मत के बाद सफाई करता हूं और फिटिंग टेस्ट करता हूं।"],
    ["आपको कैसी मजदूरी और समय चाहिए?", "मुझे साफ़ भुगतान, साप्ताहिक छुट्टी और देर की कॉल के लिए उचित ओवरटाइम वाली सत्यापित नौकरी चाहिए।"]
  ],
  Electrician: [
    ["इलेक्ट्रिकल मरम्मत सुरक्षित तरीके से कैसे शुरू करते हैं?", "मैं सप्लाई बंद करता हूं, टेस्टर या मल्टीमीटर से जांचता हूं, इंसुलेटेड औजार इस्तेमाल करता हूं और असुरक्षित लाइव काम से बचता हूं।"],
    ["आप किन इलेक्ट्रिकल कामों में मजबूत हैं?", "मैं वायरिंग, स्विचबोर्ड, MCB, पंखा-लाइट फिटिंग और बेसिक फॉल्ट खोजने में मजबूत हूं।"],
    ["नियोक्ता को खराबी कैसे समझाते हैं?", "मैं समस्या आसान भाषा में बताता हूं, सुरक्षा जोखिम समझाता हूं, विकल्प देता हूं और पार्ट बदलने से पहले खर्च पक्का करता हूं।"],
    ["सर्किट बार-बार ट्रिप हो तो क्या करते हैं?", "मैं एक-एक सेक्शन अलग करके ओवरलोड या शॉर्ट सर्किट जांचता हूं और सही लोड वितरण बताता हूं।"],
    ["नियोक्ता आप पर भरोसा क्यों करे?", "मैं सुरक्षा नियम मानता हूं, औजार के साथ आता हूं, शॉर्टकट नहीं लेता और काम बंद करने से पहले टेस्ट करता हूं।"]
  ],
  Driver: [
    ["शहर में रूट कैसे प्लान करते हैं?", "मैं ट्रैफिक, पिकअप समय, ईंधन और पार्किंग देखकर चलता हूं और देरी हो तो पहले से बता देता हूं।"],
    ["आपको सुरक्षित ड्राइवर क्या बनाता है?", "मैं स्पीड लिमिट मानता हूं, गाड़ी चलाते समय फोन से बचता हूं, दूरी रखता हूं और दस्तावेज अपडेट रखता हूं।"],
    ["मुश्किल यात्री को कैसे संभालते हैं?", "मैं शांत रहता हूं, विनम्रता से सुनता हूं, बहस से बचता हूं और सुरक्षित यात्रा पूरी करता हूं।"],
    ["गाड़ी के कौन से दस्तावेज देखते हैं?", "मैं लाइसेंस, RC, इंश्योरेंस, PUC, जरूरत हो तो परमिट और इमरजेंसी संपर्क देखता हूं।"],
    ["कौन सा काम का समय ठीक रहेगा?", "मुझे साफ़ ड्यूटी घंटे, साप्ताहिक छुट्टी और पहले से तय ओवरटाइम शर्तें चाहिए।"]
  ],
  "Construction Worker": [
    ["साइट पर आपने कौन-कौन सा काम किया है?", "मैंने माल उठाने, मिक्सिंग, सफाई, मिस्त्री सपोर्ट और फिनिशिंग में सुपरवाइजर के निर्देश से काम किया है।"],
    ["साइट पर सुरक्षित कैसे रहते हैं?", "मैं सुरक्षा सामान पहनता हूं, जोखिम वाली जगह से दूरी रखता हूं, सही तरीके से भार उठाता हूं और असुरक्षित चीज़ तुरंत बताता हूं।"],
    ["दैनिक मजदूरी की हाजिरी कैसे संभालते हैं?", "मैं समय पर पहुंचता हूं, हाजिरी साफ़ दर्ज करता हूं, रोज की दर पक्का करता हूं और भुगतान की बात लिखित/मैसेज में रखता हूं।"],
    ["किन औजारों या कामों में सहज हैं?", "मैं बेसिक औजार, माल शिफ्टिंग, मिक्सिंग, टाइल सपोर्ट और सफाई जैसे काम कर सकता हूं।"],
    ["साइट जॉइन करने से पहले क्या पूछते हैं?", "मैं पता, काम का समय, मजदूरी दर, सुरक्षा सामान, भुगतान दिन और ठेकेदार का संपर्क पूछता हूं।"]
  ],
  "Domestic Worker": [
    ["घर के किन कामों में आप सबसे मजबूत हैं?", "मैं सफाई, खाना बनाने में मदद, कपड़े, रसोई संभालना और बुजुर्गों की देखभाल में मजबूत हूं।"],
    ["परिवार का भरोसा कैसे बनाते हैं?", "मैं समय पर आती हूं, साफ़ बात करती हूं, घर की गोपनीयता रखती हूं, नियम मानती हूं और जरूरत हो तो रेफरेंस देती हूं।"],
    ["कई काम एक साथ कैसे संभालती हैं?", "मैं पहले जरूरी काम पूछती हूं, रोज का क्रम बनाती हूं और खास निर्देश पक्का करती हूं।"],
    ["आप कौन से सुरक्षा नियम मानती हैं?", "मैं घर की जानकारी बाहर साझा नहीं करती, उपकरण संभलकर इस्तेमाल करती हूं और नए सामान के लिए पहले पूछती हूं।"],
    ["आपके लिए काम की कौन सी शर्तें जरूरी हैं?", "साफ़ वेतन, साप्ताहिक छुट्टी, ड्यूटी घंटे, छुट्टी के नियम और सम्मानजनक व्यवहार जरूरी हैं।"]
  ]
};
const roleLabelHi = {
  Plumber: "प्लंबर",
  Electrician: "इलेक्ट्रीशियन",
  Driver: "ड्राइवर",
  "Construction Worker": "निर्माण श्रमिक",
  "Domestic Worker": "घरेलू श्रमिक",
  Cook: "रसोइया",
  "Delivery Worker": "डिलीवरी श्रमिक",
  Tailor: "दर्जी",
  Beautician: "ब्यूटीशियन",
  "Security Guard": "सुरक्षा गार्ड"
};

const cityAliases = {
  delhi: "Delhi",
  "दिल्ली": "Delhi",
  mumbai: "Mumbai",
  "मुंबई": "Mumbai",
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  "बेंगलुरु": "Bengaluru",
  hyderabad: "Hyderabad",
  "हैदराबाद": "Hyderabad",
  pune: "Pune",
  "पुणे": "Pune",
  chennai: "Chennai",
  "चेन्नई": "Chennai",
  jaipur: "Jaipur",
  "जयपुर": "Jaipur",
  lucknow: "Lucknow",
  "लखनऊ": "Lucknow",
  bhopal: "Bhopal",
  "भोपाल": "Bhopal",
  raipur: "Raipur",
  "रायपुर": "Raipur",
  nagpur: "Nagpur",
  "नागपुर": "Nagpur",
  ahmedabad: "Ahmedabad",
  "अहमदाबाद": "Ahmedabad",
  kolkata: "Kolkata",
  "कोलकाता": "Kolkata"
};

const skillAliases = [
  ["Domestic Worker", /domestic|housekeeping|maid|home work|घरेलू|घर का काम|सफाई|बाई|कामवाली/],
  ["Plumber", /plumber|plumbing|प्लंबर|प्लम्बिंग|नल|पाइप/],
  ["Electrician", /electrician|electrical|इलेक्ट्रीशियन|बिजली|वायरिंग/],
  ["Driver", /driver|driving|ड्राइवर|गाड़ी चल/],
  ["Construction Worker", /construction|mason|site|निर्माण|मजदूर|मिस्त्री|साइट/],
  ["Cook", /cook|cooking|chef|रसोइया|खाना बन/],
  ["Delivery Worker", /delivery|डिलीवरी/],
  ["Tailor", /tailor|stitch|दर्जी|सिलाई/],
  ["Beautician", /beautician|beauty|salon|ब्यूटी|पार्लर/],
  ["Security Guard", /security|guard|सुरक्षा|गार्ड/]
];

function parseNumber(value) {
  const words = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
  };
  const lower = String(value || "").toLowerCase().trim();
  if (words[lower]) return words[lower];
  const devanagari = "०१२३४५६७८९";
  const normalized = String(value || "").replace(/[०-९]/g, (digit) => devanagari.indexOf(digit));
  return Number(normalized.replace(/[^\d]/g, ""));
}

async function post(path, payload, fallback) {
  if (!API_URL) return fallback(payload);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
  } catch (error) {
    console.info(`Using local fallback for ${path}`, error);
    return fallback(payload);
  }
}

function workerLanguages(worker) {
  const original = String(worker.languages || "").toLowerCase();
  const detected = [];
  if (original.includes("हिन्दी") || original.includes("हिंदी")) detected.push("hindi");
  return normalize(worker.languages)
    .split(" ")
    .map((item) => languageAliases[item] || item)
    .filter(Boolean)
    .concat(detected);
}

function jobAverageWage(job) {
  return Math.round((job.wageRange.min + job.wageRange.max) / 2);
}

function wageOverlapScore(expectedWage, job) {
  const expected = Number(expectedWage || 0);
  if (!expected) return 10;
  if (job.wageRange.period === "Daily") {
    const monthlyEquivalent = jobAverageWage(job) * 24;
    return monthlyEquivalent >= expected * 0.9 ? 15 : monthlyEquivalent >= expected * 0.7 ? 9 : 3;
  }
  if (expected >= job.wageRange.min && expected <= job.wageRange.max) return 15;
  if (job.wageRange.max >= expected * 0.85) return 10;
  return 3;
}

export function parseWorkerInput(text, currentWorker = {}) {
  const raw = String(text || "").trim();
  const lower = raw.toLowerCase();
  const parsed = {};

  const nameMatch =
    raw.match(/(?:my name is|i am|name is)\s+([a-zA-Z ]{2,40})/i) ||
    raw.match(/(?:मेरा नाम|नाम)\s+([^।.,\n]+?)(?:\s+है|\.|।|,|$)/);
  if (nameMatch?.[1]) parsed.name = nameMatch[1].replace(/\s+(hai|है)$/i, "").trim();

  for (const [alias, city] of Object.entries(cityAliases)) {
    if (lower.includes(alias) || raw.includes(alias)) {
      parsed.city = city;
      break;
    }
  }

  const skill = skillAliases.find(([, pattern]) => pattern.test(lower) || pattern.test(raw));
  if (skill) parsed.skill = skill[0];

  const experienceMatch =
    raw.match(/(\d+|[०-९]+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:years|year|yrs|साल|वर्ष)/i) ||
    raw.match(/(?:experience|अनुभव)\D{0,12}(\d+|[०-९]+|one|two|three|four|five|six|seven|eight|nine|ten)/i);
  if (experienceMatch?.[1]) parsed.experience = parseNumber(experienceMatch[1]);

  const wageMatch = raw.match(/(?:₹|rs\.?|inr|रुपये|मजदूरी|वेतन|salary|wage)\D{0,12}(\d[\d,]*|[०-९][०-९,]*)/i);
  if (wageMatch?.[1]) parsed.expectedWage = parseNumber(wageMatch[1]);

  const languages = [];
  if (/hindi|हिंदी|हिन्दी/.test(lower) || /हिंदी|हिन्दी/.test(raw)) languages.push("Hindi");
  if (/english|इंग्लिश|अंग्रेज/.test(lower) || /English/.test(raw)) languages.push("Basic English");
  if (/marathi|मराठी/.test(lower) || /मराठी/.test(raw)) languages.push("Marathi");
  if (languages.length) parsed.languages = languages.join(", ");
  else if (!currentWorker.languages) parsed.languages = "Hindi";

  if (/immediate|तुरंत|अभी/.test(lower) || /तुरंत|अभी/.test(raw)) parsed.availability = currentWorker.uiLanguage === "hi" ? "तुरंत" : "Immediate";
  else if (/part[\s-]?time|आधा समय/.test(lower) || /आधा समय/.test(raw)) parsed.availability = currentWorker.uiLanguage === "hi" ? "आधा समय" : "Part-time";
  else if (/full[\s-]?time|पूर्णकालिक/.test(lower) || /पूर्णकालिक/.test(raw)) parsed.availability = currentWorker.uiLanguage === "hi" ? "पूर्णकालिक" : "Full-time";
  else if (!currentWorker.availability) parsed.availability = currentWorker.uiLanguage === "hi" ? "पूर्णकालिक" : "Full-time";

  parsed.notes = raw;
  return { ...parsed, confidence: Object.keys(parsed).length >= 5 ? 92 : 78 };
}

export function createWorkerId(worker) {
  const cityCodes = {
    Delhi: "DEL",
    Mumbai: "MUM",
    Bengaluru: "BLR",
    Hyderabad: "HYD",
    Pune: "PUN",
    Chennai: "CHE",
    Jaipur: "JAI",
    Lucknow: "LKO",
    Ahmedabad: "AMD",
    Kolkata: "KOL"
  };
  const skillCodes = {
    Plumber: "PLM",
    Electrician: "ELC",
    Driver: "DRV",
    "Construction Worker": "CON",
    "Domestic Worker": "DOM",
    Cook: "COK",
    "Delivery Worker": "DLV",
    Tailor: "TLR",
    Beautician: "BEA",
    "Security Guard": "SEC"
  };
  const city = cityCodes[worker.city] || "IND";
  const skill = skillCodes[worker.skill] || "WRK";
  const phoneSuffix = String(worker.phone || "").replace(/\D/g, "").slice(-4);
  const fallbackSuffix = String(Math.abs(`${worker.name || ""}${worker.city || ""}${worker.skill || ""}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % 10000).padStart(4, "0");
  return `RZG-${city}-${skill}-${phoneSuffix || fallbackSuffix}`;
}

export function localProfile(worker) {
  const isHindi = worker.uiLanguage === "hi";
  const workerId = createWorkerId(worker);
  if (isHindi) {
    const role = roleLabelHi[worker.skill] || worker.skill;
    return {
      workerId,
      headline: `${worker.experience}+ साल ${role}, ${worker.city}`,
      summary: `${worker.name} ${worker.city} के भरोसेमंद ${role} हैं। वे ${worker.availability} काम के लिए उपलब्ध हैं। कौशल और अनुभव: ${worker.notes}`,
      strengths: ["Punctual", "Reference-ready", "Mobile reachable", "Open to verified jobs"],
      verifiedSignals: ["Phone available", "Skill self-declared", "City preference captured"],
      nextSteps: ["नियोक्ता रेफरेंस जोड़ें", "मजदूरी रेंज पक्की करें", "इंटरव्यू से पहले अभ्यास करें"]
    };
  }
  return {
    workerId,
    headline: `${worker.experience}+ years ${worker.skill} in ${worker.city}`,
    summary:
      `${worker.name} is a reliable ${worker.skill.toLowerCase()} based in ${worker.city}, available for ${worker.availability.toLowerCase()} work. Skilled in ${worker.notes}`,
    strengths: ["Punctual", "Reference-ready", "Mobile reachable", "Open to verified jobs"],
    verifiedSignals: ["Phone available", "Skill self-declared", "City preference captured"],
    nextSteps: ["Collect employer reference", "Confirm wage range", "Practice interview before employer call"]
  };
}

export function localResume(worker) {
  const profile = localProfile(worker);
  if (worker.uiLanguage === "hi") {
    return {
      title: `${worker.name} - ${roleLabelHi[worker.skill] || worker.skill}`,
      sections: [
        { heading: "प्रोफ़ाइल", body: profile.summary },
        { heading: "कौशल", body: worker.notes },
        { heading: "अनुभव", body: `${worker.city} में ${worker.experience} साल का काम का अनुभव।` },
        { heading: "उपलब्धता", body: `${worker.availability}. अपेक्षित मजदूरी: Rs ${Number(worker.expectedWage).toLocaleString("en-IN")}.` },
        { heading: "भाषाएँ", body: worker.languages }
      ]
    };
  }
  return {
    title: `${worker.name} - ${worker.skill}`,
    sections: [
      { heading: "Profile", body: profile.summary },
      { heading: "Skills", body: worker.notes },
      {
        heading: "Experience",
        body: `${worker.experience} years of practical work experience in ${worker.city}.`
      },
      {
        heading: "Availability",
        body: `${worker.availability}. Expected wage: Rs ${Number(worker.expectedWage).toLocaleString("en-IN")}.`
      },
      { heading: "Languages", body: worker.languages }
    ]
  };
}

export function localMatches(worker) {
  const workerSkill = normalize(worker.skill);
  const workerLangs = workerLanguages(worker);
  const experience = Number(worker.experience || 0);

  return mockJobs
    .map((job) => {
      const skillScore = normalize(job.skill) === workerSkill ? 35 : normalize(job.title).includes(workerSkill) ? 18 : 4;
      const cityScore = job.city === worker.city ? 20 : 7;
      const experienceScore = experience >= job.requiredExperience ? 15 : Math.max(0, 15 - (job.requiredExperience - experience) * 5);
      const wageScore = wageOverlapScore(worker.expectedWage, job);
      const languageScore = job.languagePreference.some((language) => workerLangs.includes(languageAliases[normalize(language)] || normalize(language))) ? 10 : 3;
      const trustScore = (job.status === "Verified" ? 5 : 0) + Math.round(job.safetyScore / 20);
      const score = Math.min(98, skillScore + cityScore + experienceScore + wageScore + languageScore + trustScore);

      return {
        ...job,
        wage: jobAverageWage(job),
        type: job.wageRange.period,
        trust: job.status,
        employer: job.employerName,
        score,
        matchReasons: [
          skillScore >= 30 ? "Skill fit" : "Adjacent role",
          cityScore >= 20 ? "Same city" : "Nearby opportunity",
          experienceScore >= 15 ? "Experience eligible" : "May need training",
          languageScore >= 10 ? "Language match" : "Language support needed",
          job.status === "Verified" ? "Verified employer" : "Needs verification"
        ],
        matchBreakdown: {
          skill: skillScore >= 30 ? 100 : skillScore >= 18 ? 62 : 30,
          location: cityScore >= 20 ? 100 : 55,
          wage: wageScore >= 15 ? 100 : wageScore >= 10 ? 72 : 35,
          language: languageScore >= 10 ? 100 : 45,
          experience: experienceScore >= 15 ? 100 : experienceScore >= 10 ? 72 : 40,
          safety: job.safetyScore
        }
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function localWageEstimate(worker) {
  const base = baseWages[worker.skill] || 17000;
  const multiplier = cityIndex[worker.city] || 1;
  const experienceBoost = Math.min(Number(worker.experience || 0) * 0.04, 0.32);
  const fair = Math.round(base * multiplier * (1 + experienceBoost));
  return {
    low: Math.round(fair * 0.88),
    fair,
    high: Math.round(fair * 1.18),
    confidence: "Medium-high",
    factors: ["Skill benchmark", "City cost index", "Experience premium", "Local job demand"]
  };
}

export function localFakeCheck(offer) {
  const text = `${offer.title} ${offer.employerName || ""} ${offer.address || ""} ${offer.contactDetails || ""} ${offer.description} ${offer.deposit} ${offer.documents}`.toLowerCase();
  const salary = Number(offer.salary || 0);
  const deposit = Number(offer.deposit || 0);
  const flags = [
    deposit > 0 || /registration|deposit|joining fee|processing fee/.test(text) ? "Asks for registration money before joining" : null,
    !String(offer.address || "").trim() || /no address|address not shared|secret location|after payment/.test(text) ? "No clear workplace address" : null,
    salary > 75000 ? "Salary looks unrealistic for an informal role" : null,
    !String(offer.employerName || "").trim() || /unknown|new company|private number|no company|whatsapp only/.test(text) ? "Unknown employer identity" : null,
    /original|aadhaar before interview|pan before interview|documents before interview/.test(text) ? "Asks for documents before interview" : null,
    !String(offer.contactDetails || "").trim() || /no phone|only whatsapp|telegram|dm only|poor contact/.test(text) ? "Poor contact details" : null
  ].filter(Boolean);

  return {
    risk: flags.length >= 4 ? "High" : flags.length >= 2 ? "Medium" : flags.length === 1 ? "Low-Medium" : "Low",
    flags,
    advice:
      flags.length > 0
        ? "Do not pay money or share original documents. Ask for employer address, GST/company proof, written wage terms, and an interview before sending documents."
        : "Offer looks reasonable, but still verify employer address, payment terms, and identity before joining."
  };
}

export function localInterview(worker) {
  const questionBank = worker.uiLanguage === "hi" ? roleQuestionsHi : roleQuestions;
  const questions = questionBank[worker.skill] || (worker.uiLanguage === "hi"
    ? [
        [`${roleLabelHi[worker.skill] || worker.skill} के रूप में अपना अनुभव बताएं।`, "अपने काम का छोटा उदाहरण दें, कितने साल का अनुभव है और कौन से काम अच्छे से कर सकते हैं यह साफ़ बताएं।"],
        ["मुश्किल ग्राहक या नियोक्ता की बात कैसे संभालते हैं?", "शांत रहकर बात सुनता/सुनती हूं, समस्या समझता/समझती हूं और जरूरत हो तो साफ़ समाधान बताता/बताती हूं।"],
        ["आपको कैसी मजदूरी और समय चाहिए?", "मैं साफ़ वेतन, तय काम का समय, साप्ताहिक छुट्टी और ओवरटाइम की पहले से तय शर्तें चाहता/चाहती हूं।"],
        ["सुरक्षा और भरोसे के लिए क्या करते हैं?", "मैं समय पर पहुंचता/पहुंचती हूं, नियम मानता/मानती हूं, काम पूरा करके जांच करता/करती हूं और जरूरत हो तो रेफरेंस देता/देती हूं।"],
        ["इस नौकरी के लिए आप सही क्यों हैं?", `मेरे पास ${roleLabelHi[worker.skill] || worker.skill} का अनुभव है, मैं जिम्मेदारी से काम करता/करती हूं और नियोक्ता से साफ़ बातचीत रखता/रखती हूं।`]
      ]
    : roleQuestions["Domestic Worker"]);
  return {
    questions: questions.map(([question]) => question),
    answers: questions.map(([question, answer]) => ({ question, answer })),
    feedback: worker.uiLanguage === "hi"
      ? "छोटे और साफ़ जवाब दें। सुरक्षा, समय पर काम, मजदूरी अपेक्षा, रेफरेंस और अपने असली कौशल जरूर बताएं।"
      : "Use short, specific examples. Mention safety, punctuality, wage expectations, references, and the exact tasks you can perform.",
    score: 84
  };
}

export const api = {
  generateProfile: (worker) => post("/generate-profile", worker, localProfile),
  generateResume: (worker) => post("/generate-resume", worker, localResume),
  matchJobs: (worker) => post("/match-jobs", worker, localMatches),
  estimateWage: (worker) => post("/estimate-wage", worker, localWageEstimate),
  fakeCheck: (offer) => post("/detect-fake-job", offer, localFakeCheck),
  interviewCoach: (worker) => post("/interview-coach", worker, localInterview)
};
