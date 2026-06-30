import json
import re
from pathlib import Path

from app.models import JobOffer, WorkerProfile


BASE_WAGES = {
    "Plumber": 23000,
    "Electrician": 24000,
    "Driver": 22000,
    "Construction Worker": 19000,
    "Domestic Worker": 16500,
    "Cook": 21000,
    "Delivery Worker": 20500,
    "Tailor": 18500,
    "Beautician": 20000,
    "Security Guard": 17800,
}

CITY_INDEX = {
    "Delhi": 1.05,
    "Mumbai": 1.22,
    "Bengaluru": 1.18,
    "Hyderabad": 1.08,
    "Pune": 1.1,
    "Chennai": 1.04,
    "Jaipur": 0.9,
    "Lucknow": 0.86,
    "Ahmedabad": 0.96,
    "Kolkata": 0.94,
}
ROLE_LABELS_HI = {
    "Plumber": "प्लंबर",
    "Electrician": "इलेक्ट्रीशियन",
    "Driver": "ड्राइवर",
    "Construction Worker": "निर्माण श्रमिक",
    "Domestic Worker": "घरेलू श्रमिक",
    "Cook": "रसोइया",
    "Delivery Worker": "डिलीवरी श्रमिक",
    "Tailor": "दर्जी",
    "Beautician": "ब्यूटीशियन",
    "Security Guard": "सुरक्षा गार्ड",
}

LANGUAGE_ALIASES = {
    "english": "english",
    "basic english": "english",
    "hindi": "hindi",
    "marathi": "marathi",
    "kannada": "kannada",
    "telugu": "telugu",
    "tamil": "tamil",
    "gujarati": "gujarati",
    "bengali": "bengali",
}

ROLE_QUESTIONS = {
    "Plumber": [
        ("How do you find the source of a bathroom leak?", "I shut off water if needed, check joints, taps, trap, flush tank, and seepage marks, then explain repair and cost before starting."),
        ("What tools do you carry for a normal plumbing visit?", "I carry pipe wrench, adjustable spanner, teflon tape, cutter, pliers, washers, basic fittings, and gloves."),
        ("How do you handle an emergency call?", "I confirm the problem, ask the customer to stop water flow, carry likely fittings, and share arrival time clearly."),
        ("How do you keep work clean in a home?", "I cover the work area, keep removed parts aside, clean after repair, and test the fitting before leaving."),
        ("What wage and timings do you prefer?", "I prefer verified jobs with clear payment, weekly rest, and fair overtime for late calls."),
    ],
    "Electrician": [
        ("How do you safely start an electrical repair?", "I switch off supply, test with a tester or multimeter, use insulated tools, and avoid unsafe live work."),
        ("What electrical tasks are you strongest in?", "I am strong in wiring, switchboard repair, MCB replacement, fan and light fitting, and fault finding."),
        ("How do you explain a fault to an employer?", "I explain the issue simply, mention safety risk, share repair options, and confirm cost before replacing parts."),
        ("What do you do if a circuit trips repeatedly?", "I isolate appliances or sections, check overload or short circuit, and recommend proper load distribution."),
        ("Why should an employer trust you?", "I follow safety steps, arrive with tools, avoid shortcuts, and test the repair before closing work."),
    ],
    "Driver": [
        ("How do you plan a city route?", "I check traffic, pickup time, fuel, parking rules, and update the employer if there is a delay."),
        ("What makes you a safe driver?", "I follow speed limits, avoid phone use while driving, maintain distance, and keep documents updated."),
        ("How do you handle difficult passengers?", "I stay calm, listen politely, avoid arguments, and focus on safe completion of the trip."),
        ("What vehicle documents do you check?", "I check license, RC, insurance, PUC, permit if needed, and emergency contacts."),
        ("What work timing suits you?", "I prefer clear duty hours, weekly rest, and overtime terms decided before joining."),
    ],
    "Construction Worker": [
        ("What site work have you done before?", "I have supported material movement, mixing, cleaning, masonry support, and finishing work."),
        ("How do you stay safe on site?", "I wear safety gear when provided, keep distance from risky areas, lift correctly, and report unsafe conditions."),
        ("How do you handle daily wage attendance?", "I reach on time, mark attendance clearly, confirm daily rate, and keep payout terms written or messaged."),
        ("What tools or tasks are you comfortable with?", "I can handle basic tools, material shifting, mixing, tile support, and cleanup depending on site needs."),
        ("What do you ask before joining a site?", "I ask for address, duty hours, wage rate, safety gear, weekly payout day, and contractor contact."),
    ],
    "Domestic Worker": [
        ("What household tasks are you strongest in?", "I am strong in cleaning, cooking support, laundry, kitchen organization, and elderly care routines."),
        ("How do you build trust with a family?", "I arrive on time, communicate clearly, respect privacy, follow house rules, and provide references when available."),
        ("How do you manage multiple tasks?", "I ask priority, make a routine, finish time-sensitive work first, and confirm special instructions."),
        ("What safety rules do you follow?", "I do not share household details outside, handle appliances carefully, and ask before using new products."),
        ("What work terms are important to you?", "I prefer clear salary, weekly off, duty hours, leave rules, and respectful communication."),
    ],
    "Cook": [
        ("What cuisines or meals can you cook confidently?", "I can prepare regular home meals, dal, sabzi, roti, rice, breakfast items, and adjust spice and oil as requested."),
        ("How do you maintain kitchen hygiene?", "I wash hands, separate raw and cooked food, clean counters, store ingredients properly, and check freshness."),
        ("How do you plan meals for a family?", "I ask preferences, diet restrictions, timing, and weekly menu needs before preparing."),
        ("How do you handle feedback on taste?", "I listen calmly, note the preference, and adjust salt, spice, oil, or cooking style from the next meal."),
        ("What makes you reliable as a cook?", "I come on time, keep the kitchen clean, avoid wastage, and communicate early if ingredients are missing."),
    ],
    "Delivery Worker": [
        ("How do you complete deliveries on time?", "I plan routes, check order details, call only when needed, and update delays quickly."),
        ("How do you handle cash or digital payment?", "I verify amount, collect or confirm payment carefully, and report mismatch immediately."),
        ("What safety steps do you follow on the road?", "I wear helmet, follow traffic rules, avoid speeding, and keep the phone mounted safely for navigation."),
        ("How do you handle customer complaints?", "I stay polite, check order details, call support or employer if needed, and avoid arguments."),
        ("What do you need before joining?", "I need clear payout terms, delivery area, incentive rules, fuel support, and verified office address."),
    ],
    "Tailor": [
        ("What stitching work are you best at?", "I am strong in alterations, measurements, finishing, machine stitching, and quality checking."),
        ("How do you avoid measurement mistakes?", "I measure twice, note details clearly, confirm fitting style, and keep the customer informed."),
        ("How do you manage urgent orders?", "I confirm realistic delivery time, prioritize cutting and stitching, and do not overpromise."),
        ("What machines can you use?", "I can use standard sewing machines and basic finishing tools carefully."),
        ("What makes your work high quality?", "Clean finishing, correct size, strong seams, timely delivery, and careful handling of customer fabric."),
    ],
    "Beautician": [
        ("Which beauty services can you provide?", "I can do threading, basic facial, waxing support, cleanup, hair setting assistance, and client preparation."),
        ("How do you maintain hygiene with clients?", "I sanitize tools, use clean towels, check skin sensitivity, and keep products organized."),
        ("How do you handle a nervous client?", "I explain steps, ask comfort level, work gently, and pause if the client is uncomfortable."),
        ("How do you prepare for home service?", "I confirm service list, address, timing, kit items, travel time, and payment before leaving."),
        ("What helps you get repeat customers?", "Polite behavior, clean work, punctuality, honest product use, and listening to customer preferences."),
    ],
    "Security Guard": [
        ("What are your main duties at a gate?", "I check visitors, maintain register, guide delivery people, patrol when required, and alert supervisors."),
        ("How do you handle an unknown visitor?", "I ask purpose, call the resident or office, record details, and do not allow entry without approval."),
        ("What do you do during night duty?", "I stay alert, patrol regularly, check entry points, and report unusual activity immediately."),
        ("How do you manage conflict?", "I speak calmly, avoid physical confrontation unless safety requires it, and call the supervisor or police if needed."),
        ("What records do you maintain?", "Visitor register, vehicle entry, delivery log, shift handover notes, and incident reports."),
    ],
}


def normalize(value: str | float | int | None) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def worker_languages(worker: WorkerProfile) -> list[str]:
    detected = []
    if "हिन्दी" in worker.languages or "हिंदी" in worker.languages:
        detected.append("hindi")
    return [LANGUAGE_ALIASES.get(item, item) for item in normalize(worker.languages).split() if item] + detected


def job_average_wage(job: dict) -> int:
    return round((job["wageRange"]["min"] + job["wageRange"]["max"]) / 2)


def wage_overlap_score(expected_wage: float, job: dict) -> int:
    if expected_wage <= 0:
        return 10
    if job["wageRange"]["period"] == "Daily":
        monthly_equivalent = job_average_wage(job) * 24
        if monthly_equivalent >= expected_wage * 0.9:
            return 15
        if monthly_equivalent >= expected_wage * 0.7:
            return 9
        return 3
    if job["wageRange"]["min"] <= expected_wage <= job["wageRange"]["max"]:
        return 15
    if job["wageRange"]["max"] >= expected_wage * 0.85:
        return 10
    return 3


def worker_id(worker: WorkerProfile) -> str:
    city_codes = {
        "Delhi": "DEL",
        "Mumbai": "MUM",
        "Bengaluru": "BLR",
        "Hyderabad": "HYD",
        "Pune": "PUN",
        "Chennai": "CHE",
        "Jaipur": "JAI",
        "Lucknow": "LKO",
        "Ahmedabad": "AMD",
        "Kolkata": "KOL",
    }
    skill_codes = {
        "Plumber": "PLM",
        "Electrician": "ELC",
        "Driver": "DRV",
        "Construction Worker": "CON",
        "Domestic Worker": "DOM",
        "Cook": "COK",
        "Delivery Worker": "DLV",
        "Tailor": "TLR",
        "Beautician": "BEA",
        "Security Guard": "SEC",
    }
    city = city_codes.get(worker.city, "IND")
    skill = skill_codes.get(worker.skill, "WRK")
    digits = "".join(ch for ch in worker.phone if ch.isdigit())
    suffix = digits[-4:] if digits else f"{sum(ord(ch) for ch in f'{worker.name}{worker.city}{worker.skill}') % 10000:04d}"
    return f"RZG-{city}-{skill}-{suffix}"


def generate_profile(worker: WorkerProfile) -> dict:
    if worker.uiLanguage == "hi":
        role = ROLE_LABELS_HI.get(worker.skill, worker.skill)
        return {
            "workerId": worker_id(worker),
            "headline": f"{worker.experience:g}+ साल {role}, {worker.city}",
            "summary": (
                f"{worker.name} {worker.city} के भरोसेमंद {role} हैं। "
                f"वे {worker.availability} काम के लिए उपलब्ध हैं। कौशल और अनुभव: {worker.notes}"
            ),
            "strengths": ["Punctual", "Reference-ready", "Mobile reachable", "Open to verified jobs"],
            "verifiedSignals": ["Phone available", "Skill self-declared", "City preference captured"],
            "nextSteps": ["नियोक्ता रेफरेंस जोड़ें", "मजदूरी रेंज पक्की करें", "इंटरव्यू से पहले अभ्यास करें"],
        }
    return {
        "workerId": worker_id(worker),
        "headline": f"{worker.experience:g}+ years {worker.skill} in {worker.city}",
        "summary": (
            f"{worker.name} is a reliable {worker.skill.lower()} based in {worker.city}, "
            f"available for {worker.availability.lower()} work. Skilled in {worker.notes}"
        ),
        "strengths": ["Punctual", "Reference-ready", "Mobile reachable", "Open to verified jobs"],
        "verifiedSignals": ["Phone available", "Skill self-declared", "City preference captured"],
        "nextSteps": ["Collect employer reference", "Confirm wage range", "Practice interview before employer call"],
    }


def generate_resume(worker: WorkerProfile) -> dict:
    profile = generate_profile(worker)
    if worker.uiLanguage == "hi":
        return {
            "title": f"{worker.name} - {ROLE_LABELS_HI.get(worker.skill, worker.skill)}",
            "sections": [
                {"heading": "प्रोफ़ाइल", "body": profile["summary"]},
                {"heading": "कौशल", "body": worker.notes},
                {"heading": "अनुभव", "body": f"{worker.city} में {worker.experience:g} साल का काम का अनुभव।"},
                {"heading": "उपलब्धता", "body": f"{worker.availability}. अपेक्षित मजदूरी: Rs {worker.expectedWage:,.0f}."},
                {"heading": "भाषाएँ", "body": worker.languages},
            ],
        }
    return {
        "title": f"{worker.name} - {worker.skill}",
        "sections": [
            {"heading": "Profile", "body": profile["summary"]},
            {"heading": "Skills", "body": worker.notes},
            {"heading": "Experience", "body": f"{worker.experience:g} years of practical work experience in {worker.city}."},
            {"heading": "Availability", "body": f"{worker.availability}. Expected wage: Rs {worker.expectedWage:,.0f}."},
            {"heading": "Languages", "body": worker.languages},
        ],
    }


def load_jobs() -> list[dict]:
    path = Path(__file__).resolve().parents[1] / "data" / "jobs.json"
    return json.loads(path.read_text())


def match_jobs(worker: WorkerProfile) -> list[dict]:
    worker_skill = normalize(worker.skill)
    languages = worker_languages(worker)
    scored = []
    for job in load_jobs():
        skill_score = 35 if normalize(job["skill"]) == worker_skill else 18 if worker_skill in normalize(job["title"]) else 4
        city_score = 20 if job["city"] == worker.city else 7
        experience_gap = job["requiredExperience"] - worker.experience
        experience_score = 15 if experience_gap <= 0 else max(0, round(15 - experience_gap * 5))
        wage_score = wage_overlap_score(worker.expectedWage, job)
        language_score = 10 if any(LANGUAGE_ALIASES.get(normalize(lang), normalize(lang)) in languages for lang in job["languagePreference"]) else 3
        trust_score = (5 if job["status"] == "Verified" else 0) + round(job["safetyScore"] / 20)
        score = min(98, skill_score + city_score + experience_score + wage_score + language_score + trust_score)
        scored.append(
            {
                **job,
                "wage": job_average_wage(job),
                "type": job["wageRange"]["period"],
                "trust": job["status"],
                "employer": job["employerName"],
                "score": score,
                "matchReasons": [
                    "Skill fit" if skill_score >= 30 else "Adjacent role",
                    "Same city" if city_score >= 20 else "Nearby opportunity",
                    "Experience eligible" if experience_score >= 15 else "May need training",
                    "Language match" if language_score >= 10 else "Language support needed",
                    "Verified employer" if job["status"] == "Verified" else "Needs verification",
                ],
            }
        )
    return sorted(scored, key=lambda item: item["score"], reverse=True)


def estimate_wage(worker: WorkerProfile) -> dict:
    base = BASE_WAGES.get(worker.skill, 17000)
    multiplier = CITY_INDEX.get(worker.city, 1)
    experience_boost = min(worker.experience * 0.04, 0.32)
    fair = round(base * multiplier * (1 + experience_boost))
    return {
        "low": round(fair * 0.88),
        "fair": fair,
        "high": round(fair * 1.18),
        "confidence": "Medium-high",
        "factors": ["Skill benchmark", "City cost index", "Experience premium", "Local job demand"],
    }


def detect_fake_job(offer: JobOffer) -> dict:
    text = (
        f"{offer.title} {offer.employerName} {offer.address} {offer.contactDetails} "
        f"{offer.description} {offer.deposit} {offer.documents}"
    ).lower()
    flags = []
    if offer.deposit > 0 or re.search(r"registration|deposit|joining fee|processing fee", text):
        flags.append("Asks for registration money before joining")
    if not offer.address.strip() or re.search(r"no address|address not shared|secret location|after payment", text):
        flags.append("No clear workplace address")
    if offer.salary > 75000:
        flags.append("Salary looks unrealistic for an informal role")
    if not offer.employerName.strip() or re.search(r"unknown|new company|private number|no company|whatsapp only", text):
        flags.append("Unknown employer identity")
    if re.search(r"original|aadhaar before interview|pan before interview|documents before interview", text):
        flags.append("Asks for documents before interview")
    if not offer.contactDetails.strip() or re.search(r"no phone|only whatsapp|telegram|dm only|poor contact", text):
        flags.append("Poor contact details")

    risk = "High" if len(flags) >= 4 else "Medium" if len(flags) >= 2 else "Low-Medium" if flags else "Low"
    return {
        "risk": risk,
        "flags": flags,
        "advice": (
            "Do not pay money or share original documents. Ask for employer address, GST/company proof, "
            "written wage terms, and an interview before sending documents."
            if flags
            else "Offer looks reasonable, but still verify employer address, payment terms, and identity before joining."
        ),
    }


def interview_coach(worker: WorkerProfile) -> dict:
    if worker.uiLanguage == "hi":
        role = ROLE_LABELS_HI.get(worker.skill, worker.skill)
        questions = [
            (f"{role} के रूप में अपना अनुभव बताएं।", "अपने काम का छोटा उदाहरण दें, कितने साल का अनुभव है और कौन से काम अच्छे से कर सकते हैं यह साफ़ बताएं।"),
            ("मुश्किल ग्राहक या नियोक्ता की बात कैसे संभालते हैं?", "शांत रहकर बात सुनता/सुनती हूं, समस्या समझता/समझती हूं और जरूरत हो तो साफ़ समाधान बताता/बताती हूं।"),
            ("आपको कैसी मजदूरी और समय चाहिए?", "मैं साफ़ वेतन, तय काम का समय, साप्ताहिक छुट्टी और ओवरटाइम की पहले से तय शर्तें चाहता/चाहती हूं।"),
            ("सुरक्षा और भरोसे के लिए क्या करते हैं?", "मैं समय पर पहुंचता/पहुंचती हूं, नियम मानता/मानती हूं, काम पूरा करके टेस्ट/जांच करता/करती हूं और जरूरत हो तो रेफरेंस देता/देती हूं।"),
            ("इस नौकरी के लिए आप सही क्यों हैं?", f"मेरे पास {role} का अनुभव है, मैं जिम्मेदारी से काम करता/करती हूं और नियोक्ता से साफ़ बातचीत रखता/रखती हूं।"),
        ]
        return {
            "questions": [question for question, _answer in questions],
            "answers": [{"question": question, "answer": answer} for question, answer in questions],
            "feedback": "छोटे और साफ़ जवाब दें। सुरक्षा, समय पर काम, मजदूरी अपेक्षा, रेफरेंस और अपने असली कौशल जरूर बताएं।",
            "score": 84,
        }
    questions = ROLE_QUESTIONS.get(worker.skill, ROLE_QUESTIONS["Domestic Worker"])
    return {
        "questions": [question for question, _answer in questions],
        "answers": [{"question": question, "answer": answer} for question, answer in questions],
        "feedback": (
            "Use short, specific examples. Mention safety, punctuality, wage expectations, "
            "references, and the exact tasks you can perform."
        ),
        "score": 84,
    }
