from pydantic import BaseModel, Field


class WorkerProfile(BaseModel):
    name: str
    phone: str = ""
    city: str
    skill: str
    experience: float = Field(default=0, ge=0)
    languages: str = ""
    availability: str = "Full-time"
    expectedWage: float = Field(default=0, ge=0)
    notes: str = ""
    uiLanguage: str = "en"


class JobOffer(BaseModel):
    title: str = ""
    employerName: str = ""
    address: str = ""
    contactDetails: str = ""
    salary: float = 0
    deposit: float = 0
    documents: str = ""
    description: str = ""
    uiLanguage: str = "en"
