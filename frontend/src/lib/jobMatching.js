function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function includesAny(values, targets) {
  const haystack = values.map(normalize).filter(Boolean);
  return targets.map(normalize).filter(Boolean).some((target) => haystack.some((value) => value.includes(target) || target.includes(value)));
}

function extractNumber(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function calculateWorkerJobMatch({ worker, job, certificates = [], enrollments = [] }) {
  const strengths = [];
  const reviews = [];
  let score = 45;

  const workerSkills = [worker?.primarySkill, ...(worker?.secondarySkills || [])].filter(Boolean);
  const requiredSkills = [job?.skillSector, ...(job?.requiredSkills || [])].filter(Boolean);
  const preferredSkills = job?.preferredSkills || [];

  if (includesAny(workerSkills, requiredSkills)) {
    score += 22;
    strengths.push(`Primary skill matches ${job.title}.`);
  } else if (includesAny(workerSkills, preferredSkills)) {
    score += 12;
    strengths.push("Preferred skill overlap found.");
  } else {
    reviews.push("Primary skill should be reviewed before recommending.");
  }

  const verifiedCertificate = certificates.some((certificate) => certificate.workerProfileId === worker.workerProfileId && ["verified", "issued"].includes(certificate.verificationStatus) && includesAny([certificate.skillName, certificate.certificateTitle], requiredSkills));
  if (verifiedCertificate) {
    score += 14;
    strengths.push("Verified certificate supports this role.");
  }

  const completedTraining = enrollments.some((enrollment) => enrollment.workerProfileId === worker.workerProfileId && enrollment.completionStatus === "completed");
  if (completedTraining) {
    score += 8;
    strengths.push("Training completion is recorded.");
  }

  const years = extractNumber(worker?.experience);
  if (!job.minimumExperienceYears || years >= job.minimumExperienceYears) {
    score += 8;
    strengths.push(`${years || "Some"} years of experience meets the requirement.`);
  } else {
    reviews.push(`Experience appears below the ${job.minimumExperienceYears} year requirement.`);
  }

  if (normalize(worker?.city) && normalize(worker.city) === normalize(job.locationCity)) {
    score += 8;
    strengths.push("Preferred city matches the job location.");
  } else if (worker?.city && job?.locationCity) {
    reviews.push(`Worker is in ${worker.city}; job is in ${job.locationCity}.`);
  }

  const expectedWage = extractNumber(worker?.expectedWage);
  if (expectedWage && job.salaryMax) {
    if (expectedWage <= job.salaryMax) {
      score += 6;
      strengths.push("Expected wage is aligned with the salary range.");
    } else {
      reviews.push("Expected wage is above the listed salary range.");
    }
  }

  if (/available|immediate|ready/i.test(worker?.availability || "")) {
    score += 7;
    strengths.push("Worker is available for opportunities.");
  }

  if (worker?.consentStatus === "granted" && worker?.associationStatus === "linked") {
    score += 5;
    strengths.push("Worker has active organization consent.");
  } else {
    reviews.push("Employer sharing consent must be confirmed first.");
  }

  const boundedScore = Math.max(0, Math.min(98, score));
  return {
    score: boundedScore,
    label: boundedScore >= 85 ? "Strong match" : boundedScore >= 70 ? "Good match" : "Needs review",
    strengths: strengths.slice(0, 4),
    reviews: reviews.slice(0, 3),
    explanation: `${boundedScore}% recommendation aid based on skills, consent, readiness, location, salary and verified records.`
  };
}
