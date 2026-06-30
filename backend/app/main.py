import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import JobOffer, WorkerProfile
from app.services.ai import generate_json_or_fallback
from app.services import mock_engine

load_dotenv()

app = FastAPI(
    title="RozgaarAI API",
    description="Voice-first AI employment assistant for India's informal workers.",
    version="0.1.0",
)

origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "RozgaarAI"}


@app.get("/jobs")
def jobs() -> list[dict]:
    return mock_engine.load_jobs()


@app.post("/generate-profile")
async def generate_profile(worker: WorkerProfile) -> dict:
    fallback = lambda: mock_engine.generate_profile(worker)
    prompt = (
        f"Create a concise JSON worker profile in {'Hindi' if worker.uiLanguage == 'hi' else 'English'} "
        "for an Indian informal worker. "
        "Return only JSON with keys: workerId, headline, summary, strengths, "
        "verifiedSignals, nextSteps. Worker data: "
        f"{worker.model_dump_json()}"
    )
    return await generate_json_or_fallback(
        prompt,
        fallback,
        lambda data: isinstance(data, dict) and {"workerId", "headline", "summary", "strengths"}.issubset(data),
    )


@app.post("/generate-resume")
async def generate_resume(worker: WorkerProfile) -> dict:
    fallback = lambda: mock_engine.generate_resume(worker)
    prompt = (
        f"Create a practical resume JSON in {'Hindi' if worker.uiLanguage == 'hi' else 'English'} "
        "for an Indian informal worker. "
        "Return only JSON with keys: title and sections. sections must be an array "
        "of objects with heading and body. Worker data: "
        f"{worker.model_dump_json()}"
    )
    return await generate_json_or_fallback(
        prompt,
        fallback,
        lambda data: isinstance(data, dict) and isinstance(data.get("sections"), list),
    )


@app.post("/match-jobs")
def match_jobs(worker: WorkerProfile) -> list[dict]:
    return mock_engine.match_jobs(worker)


@app.post("/estimate-wage")
def estimate_wage(worker: WorkerProfile) -> dict:
    return mock_engine.estimate_wage(worker)


@app.post("/detect-fake-job")
async def detect_fake_job(offer: JobOffer) -> dict:
    fallback = lambda: mock_engine.detect_fake_job(offer)
    prompt = (
        f"Assess fake job risk in {'Hindi' if offer.uiLanguage == 'hi' else 'English'} "
        "for an informal worker job offer in India. "
        "Return only JSON with keys: risk, flags, advice. Risk must be Low, "
        "Low-Medium, Medium, or High. Check registration money, address, salary, "
        "employer identity, documents before interview, and contact quality. Offer: "
        f"{offer.model_dump_json()}"
    )
    return await generate_json_or_fallback(
        prompt,
        fallback,
        lambda data: isinstance(data, dict) and {"risk", "flags", "advice"}.issubset(data),
    )


@app.post("/interview-coach")
async def interview_coach(worker: WorkerProfile) -> dict:
    fallback = lambda: mock_engine.interview_coach(worker)
    prompt = (
        f"Generate interview coaching JSON in {'Hindi' if worker.uiLanguage == 'hi' else 'English'} "
        "for an Indian informal worker. "
        "Return only JSON with keys: questions, answers, feedback, score. "
        "questions must have exactly 5 role-specific questions. answers must be "
        "an array of objects with question and answer sample strong answers. Worker data: "
        f"{worker.model_dump_json()}"
    )
    return await generate_json_or_fallback(
        prompt,
        fallback,
        lambda data: isinstance(data, dict)
        and len(data.get("questions", [])) == 5
        and len(data.get("answers", [])) == 5,
    )
