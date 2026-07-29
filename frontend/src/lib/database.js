import { normalizeRole } from "./roles";
import { calculateWorkerJobMatch } from "./jobMatching";

const STORAGE_KEYS = {
  account: "rozgaarai-production-account-v1",
  workerProfiles: "rozgaarai-worker-profiles-v1",
  employerSavedWorkers: "rozgaarai-employer-saved-workers-v1",
  impact: "rozgaarai-impact-data-v1",
  organizations: "rozgaar_organizations",
  organizationMembers: "rozgaar_organization_members",
  workerOrganizationAssociations: "rozgaar_worker_organization_associations",
  organizationActivityLogs: "rozgaar_organization_activity_logs",
  workerOrganizationConsentEvents: "rozgaar_worker_organization_consent_events",
  assistedWorkerDrafts: "rozgaar_assisted_worker_drafts",
  organizationWorkerNotes: "rozgaar_organization_worker_notes",
  workerRequests: "rozgaar_worker_requests",
  workerProfileChangeRequests: "rozgaar_worker_profile_change_requests",
  trainingProgrammes: "rozgaar_training_programmes",
  programmeEnrollments: "rozgaar_programme_enrollments",
  trainingSessions: "rozgaar_training_sessions",
  attendanceRecords: "rozgaar_attendance_records",
  skillAssessments: "rozgaar_skill_assessments",
  workerCertificates: "rozgaar_worker_certificates",
  trainingActivityLogs: "rozgaar_training_activity_logs",
  employerJobOpportunities: "rozgaar_employer_job_opportunities",
  workerJobRecommendations: "rozgaar_worker_job_recommendations",
  placementRecords: "rozgaar_placement_records",
  placementStatusHistory: "rozgaar_placement_status_history",
  interviewRecords: "rozgaar_interview_records",
  placementFollowUps: "rozgaar_placement_follow_ups",
  employerOrganizationConnections: "rozgaar_employer_organization_connections",
  placementActivityLogs: "rozgaar_placement_activity_logs",
  offerRecords: "rozgaar_offer_records"
};

const hasDatabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function readJson(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function accountUserId(account) {
  return account?.uid || account?.id || account?.firebaseUid || "";
}

function workerProfilesKey(account) {
  const userId = accountUserId(account);
  return userId ? `${STORAGE_KEYS.workerProfiles}:${userId}` : "";
}

async function supabaseRequest(path, options = {}) {
  if (!hasDatabaseConfig) {
    throw new Error("Database credentials are not configured.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Database request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function tryDatabase(operation, fallback) {
  if (!hasDatabaseConfig) {
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    console.warn("RozgaarAI database fallback active:", error.message);
    return fallback();
  }
}

function createId(prefix) {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || `organization-${Date.now()}`;
}

function parseList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toOrganization(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || "",
    slug: row.slug || "",
    organizationType: row.organization_type || row.organizationType || "",
    registrationNumber: row.registration_number || row.registrationNumber || "",
    officialEmail: row.official_email || row.officialEmail || "",
    phone: row.phone || "",
    website: row.website || "",
    contactPersonName: row.contact_person_name || row.contactPersonName || "",
    description: row.description || "",
    logoUrl: row.logo_url || row.logoUrl || "",
    headquartersCity: row.headquarters_city || row.headquartersCity || "",
    headquartersState: row.headquarters_state || row.headquartersState || "",
    headquartersCountry: row.headquarters_country || row.headquartersCountry || "India",
    locationsServed: parseList(row.locations_served ?? row.locationsServed),
    skillSectors: parseList(row.skill_sectors ?? row.skillSectors),
    approximateWorkersTrained: Number(row.approximate_workers_trained ?? row.approximateWorkersTrained ?? 0),
    verificationStatus: row.verification_status || row.verificationStatus || "unverified",
    onboardingCompleted: Boolean(row.onboarding_completed ?? row.onboardingCompleted),
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function fromOrganization(payload, account) {
  const now = new Date().toISOString();
  return {
    id: payload.id || createId("org"),
    name: String(payload.name || "").trim(),
    slug: payload.slug || slugify(payload.name),
    organization_type: payload.organizationType || payload.organization_type || "NGO",
    registration_number: payload.registrationNumber || payload.registration_number || "",
    official_email: payload.officialEmail || payload.official_email || "",
    phone: payload.phone || "",
    website: payload.website || "",
    contact_person_name: payload.contactPersonName || payload.contact_person_name || "",
    description: payload.description || "",
    logo_url: payload.logoUrl || payload.logo_url || "",
    headquarters_city: payload.headquartersCity || payload.headquarters_city || "",
    headquarters_state: payload.headquartersState || payload.headquarters_state || "",
    headquarters_country: payload.headquartersCountry || payload.headquarters_country || "India",
    locations_served: parseList(payload.locationsServed ?? payload.locations_served),
    skill_sectors: parseList(payload.skillSectors ?? payload.skill_sectors),
    approximate_workers_trained: Number(payload.approximateWorkersTrained ?? payload.approximate_workers_trained ?? 0) || 0,
    verification_status: payload.verificationStatus || payload.verification_status || "unverified",
    onboarding_completed: Boolean(payload.onboardingCompleted ?? payload.onboarding_completed),
    created_by_account_id: payload.createdByAccountId || payload.created_by_account_id || accountUserId(account),
    created_at: payload.createdAt || payload.created_at || now,
    updated_at: now
  };
}

function toMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    accountId: row.account_id || row.accountId,
    role: row.role || "organization_admin",
    status: row.status || "active",
    joinedAt: row.joined_at || row.joinedAt || "",
    createdAt: row.created_at || row.createdAt || "",
    updatedAt: row.updated_at || row.updatedAt || ""
  };
}

function toAssociation(row) {
  if (!row) return null;
  const metadata = row.metadata || {};
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    associationStatus: row.association_status || row.associationStatus || "invited",
    consentStatus: row.consent_status || row.consentStatus || "not_requested",
    consentRequestedAt: row.consent_requested_at || row.consentRequestedAt || "",
    consentGrantedAt: row.consent_granted_at || row.consentGrantedAt || "",
    consentRevokedAt: row.consent_revoked_at || row.consentRevokedAt || "",
    linkedAt: row.linked_at || row.linkedAt || "",
    linkedByAccountId: row.linked_by_account_id || row.linkedByAccountId || "",
    organizationWorkerReference: row.organization_worker_reference || row.organizationWorkerReference || "",
    isCurrent: row.is_current ?? row.isCurrent ?? true,
    accessLevel: row.access_level || row.accessLevel || "limited",
    reason: row.reason || row.invitation_reason || row.reasonForInvitation || metadata.reason || "",
    intendedSupportType: row.intended_support_type || row.intendedSupportType || metadata.intendedSupportType || "",
    programmeName: row.programme_name || row.programmeName || metadata.programmeName || "",
    invitationMessage: row.invitation_message || row.invitationMessage || metadata.invitationMessage || "",
    supportStatus: row.support_status || row.supportStatus || metadata.supportStatus || "new",
    assignedCoordinator: row.assigned_coordinator || row.assignedCoordinator || metadata.assignedCoordinator || "",
    nextFollowUpAt: row.next_follow_up_at || row.nextFollowUpAt || metadata.nextFollowUpAt || "",
    organizationReadinessStatus: row.organization_readiness_status || row.organizationReadinessStatus || metadata.organizationReadinessStatus || "",
    availabilityOverride: row.availability_override || row.availabilityOverride || metadata.availabilityOverride || "",
    employmentStatus: row.employment_status || row.employmentStatus || metadata.employmentStatus || "not_employed",
    profileAssistanceNeeded: Boolean(row.profile_assistance_needed ?? row.profileAssistanceNeeded ?? metadata.profileAssistanceNeeded),
    invitationLastSentAt: row.invitation_last_sent_at || row.invitationLastSentAt || row.consent_requested_at || row.consentRequestedAt || "",
    metadata,
    createdAt: row.created_at || row.createdAt || "",
    updatedAt: row.updated_at || row.updatedAt || ""
  };
}

function toConsentEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    associationId: row.association_id || row.associationId,
    organizationId: row.organization_id || row.organizationId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    eventType: row.event_type || row.eventType,
    accessLevel: row.access_level || row.accessLevel || "basic_support",
    permissions: row.permissions || {},
    consentVersion: row.consent_version || row.consentVersion || "2026-07-ngo-worker-access-v1",
    actorAccountId: row.actor_account_id || row.actorAccountId || "",
    reason: row.reason || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

function toWorkerRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    organizationId: row.organization_id || row.organizationId,
    associationId: row.association_id || row.associationId,
    requestType: row.request_type || row.requestType || "organization_invitation",
    title: row.title || "",
    message: row.message || "",
    status: row.status || "pending",
    actionUrl: row.action_url || row.actionUrl || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    readAt: row.read_at || row.readAt || "",
    respondedAt: row.responded_at || row.respondedAt || ""
  };
}

function toAssistedDraft(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    assignedNgoMemberId: row.assigned_ngo_member_id || row.assignedNgoMemberId || "",
    workerName: row.worker_name || row.workerName || "",
    contactMethod: row.contact_method || row.contactMethod || "",
    contactValue: row.contact_value || row.contactValue || "",
    preferredLanguage: row.preferred_language || row.preferredLanguage || "en",
    city: row.city || "",
    primarySkill: row.primary_skill || row.primarySkill || "",
    experience: row.experience || "",
    employmentPreference: row.employment_preference || row.employmentPreference || "",
    availability: row.availability || "",
    expectedWage: row.expected_wage || row.expectedWage || "",
    draftStatus: row.draft_status || row.draftStatus || "draft",
    consentConfirmed: Boolean(row.consent_confirmed ?? row.consentConfirmed),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    expiryDate: row.expiry_date || row.expiryDate || "",
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toOrganizationWorkerNote(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    associationId: row.association_id || row.associationId,
    authorAccountId: row.author_account_id || row.authorAccountId || "",
    noteType: row.note_type || row.noteType || "general",
    content: row.content || "",
    visibility: row.visibility || "organization_only",
    followUpDate: row.follow_up_date || row.followUpDate || "",
    status: row.status || "open",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function consentPermissionSnapshot(accessLevel = "basic_support") {
  const common = [
    "View basic profile",
    "View skills and employment preferences",
    "Add organization follow-up notes"
  ];
  const byLevel = {
    basic_support: common,
    profile_assistance: [...common, "Assist with profile completion", "Submit worker-reviewed profile updates"],
    training_and_placement: [...common, "Assist with profile completion", "Add organization training records", "Recommend profile to employers with required sharing permission"]
  };
  return byLevel[accessLevel] || byLevel.basic_support;
}

function canViewPrivateAssociationData(association) {
  return association?.associationStatus === "linked" && association?.consentStatus === "granted" && association?.isCurrent !== false;
}

function maskPhone(value = "") {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 4) return "";
  return `••••••${digits.slice(-4)}`;
}

function maskEmail(value = "") {
  const [name, domain] = String(value).split("@");
  if (!name || !domain) return "";
  return `${name.slice(0, 2)}•••@${domain}`;
}

function profileCompletion(profile = {}) {
  const fields = ["name", "phone", "city", "skill", "experience", "languages", "availability", "expectedWage", "notes"];
  const completed = fields.filter((field) => String(profile[field] ?? "").trim()).length;
  return Math.round((completed / fields.length) * 100);
}

function profileNameMatches(profile, query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) return false;
  return [profile.workerId, profile.phone, profile.email, profile.name, profile.skill, profile.city]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
}

function readAllLocalWorkerProfiles() {
  const profiles = [];
  const seen = new Set();
  if (typeof window === "undefined") return profiles;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || (!key.startsWith(`${STORAGE_KEYS.workerProfiles}:`) && !key.startsWith("rozgaarai_user_profiles_"))) continue;
    const rows = readJson(key, []);
    if (!Array.isArray(rows)) continue;
    rows.forEach((profile) => {
      const id = profile?.workerId || profile?.id;
      if (!id || seen.has(id)) return;
      seen.add(id);
      profiles.push(profile);
    });
  }
  return profiles;
}

function managedWorkerFromAssociation(association, profile, organization) {
  const canViewPrivate = canViewPrivateAssociationData(association);
  const publicName = profile?.name || association.workerProfileId || "Worker";
  const [firstName, ...rest] = publicName.split(" ");
  return {
    association,
    organization,
    canViewPrivate,
    workerId: profile?.workerId || association.workerProfileId,
    workerProfileId: association.workerProfileId,
    name: canViewPrivate ? publicName : `${firstName || "Worker"}${rest.length ? " " : ""}${rest.length ? rest[0].slice(0, 1) + "." : ""}`,
    fullName: publicName,
    phone: canViewPrivate ? profile?.phone || "" : maskPhone(profile?.phone),
    email: canViewPrivate ? profile?.email || "" : maskEmail(profile?.email),
    photoUrl: profile?.photoUrl || "",
    avatar: profile?.avatar || (publicName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "WK"),
    primarySkill: profile?.skill || "Not available",
    secondarySkills: parseList(profile?.secondarySkills || profile?.skills || ""),
    city: profile?.city || "Not available",
    experience: profile?.experience || "",
    languages: profile?.languages || "",
    availability: association.availabilityOverride || profile?.availability || "Not set",
    expectedWage: canViewPrivate ? profile?.expectedWage || "" : "",
    employmentStatus: association.employmentStatus || "not_employed",
    profileCompletion: profileCompletion(profile),
    notes: canViewPrivate ? profile?.notes || "" : "",
    lastActivity: association.updatedAt || association.createdAt,
    associationStatus: association.associationStatus,
    consentStatus: association.consentStatus,
    supportStatus: association.supportStatus,
    accessLevel: association.accessLevel,
    profileAssistanceNeeded: association.profileAssistanceNeeded || profileCompletion(profile) < 75
  };
}

function toActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    actorAccountId: row.actor_account_id || row.actorAccountId || "",
    workerProfileId: row.worker_profile_id || row.workerProfileId || "",
    activityType: row.activity_type || row.activityType || "",
    description: row.description || "",
    metadata: row.metadata || {},
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

function toTrainingProgramme(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    title: row.title || "",
    programmeCode: row.programme_code || row.programmeCode || "",
    description: row.description || "",
    skillSector: row.skill_sector || row.skillSector || "",
    primarySkill: row.primary_skill || row.primarySkill || "",
    deliveryMode: row.delivery_mode || row.deliveryMode || "in_person",
    locationName: row.location_name || row.locationName || "",
    city: row.city || "",
    state: row.state || "",
    startDate: row.start_date || row.startDate || "",
    endDate: row.end_date || row.endDate || "",
    enrolmentStartDate: row.enrolment_start_date || row.enrolmentStartDate || "",
    enrolmentEndDate: row.enrolment_end_date || row.enrolmentEndDate || "",
    capacity: Number(row.capacity ?? 0) || "",
    trainerName: row.trainer_name || row.trainerName || "",
    trainerMemberId: row.trainer_member_id || row.trainerMemberId || "",
    status: row.status || "draft",
    durationHours: Number(row.duration_hours ?? row.durationHours ?? 0) || "",
    minimumAttendancePercentage: Number(row.minimum_attendance_percentage ?? row.minimumAttendancePercentage ?? 75),
    assessmentRequired: Boolean(row.assessment_required ?? row.assessmentRequired ?? true),
    certificateEnabled: Boolean(row.certificate_enabled ?? row.certificateEnabled ?? true),
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    archivedAt: row.archived_at || row.archivedAt || ""
  };
}

function fromTrainingProgramme(payload, account) {
  const now = new Date().toISOString();
  return {
    id: payload.id || createId("programme"),
    organization_id: payload.organizationId || payload.organization_id,
    title: String(payload.title || "").trim(),
    programme_code: String(payload.programmeCode || payload.programme_code || "").trim(),
    description: payload.description || "",
    skill_sector: payload.skillSector || payload.skill_sector || "",
    primary_skill: payload.primarySkill || payload.primary_skill || "",
    delivery_mode: payload.deliveryMode || payload.delivery_mode || "in_person",
    location_name: payload.locationName || payload.location_name || "",
    city: payload.city || "",
    state: payload.state || "",
    start_date: payload.startDate || payload.start_date || "",
    end_date: payload.endDate || payload.end_date || "",
    enrolment_start_date: payload.enrolmentStartDate || payload.enrolment_start_date || null,
    enrolment_end_date: payload.enrolmentEndDate || payload.enrolment_end_date || null,
    capacity: payload.capacity ? Number(payload.capacity) : null,
    trainer_name: payload.trainerName || payload.trainer_name || "",
    trainer_member_id: payload.trainerMemberId || payload.trainer_member_id || null,
    status: payload.status || "draft",
    duration_hours: payload.durationHours ? Number(payload.durationHours) : null,
    minimum_attendance_percentage: Number(payload.minimumAttendancePercentage ?? payload.minimum_attendance_percentage ?? 75),
    assessment_required: Boolean(payload.assessmentRequired ?? payload.assessment_required ?? true),
    certificate_enabled: Boolean(payload.certificateEnabled ?? payload.certificate_enabled ?? true),
    created_by_account_id: payload.createdByAccountId || payload.created_by_account_id || accountUserId(account),
    created_at: payload.createdAt || payload.created_at || now,
    updated_at: now,
    archived_at: payload.archivedAt || payload.archived_at || null
  };
}

function toProgrammeEnrollment(row) {
  if (!row) return null;
  return {
    id: row.id,
    programmeId: row.programme_id || row.programmeId,
    organizationId: row.organization_id || row.organizationId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    associationId: row.association_id || row.associationId || "",
    enrollmentStatus: row.enrollment_status || row.enrollmentStatus || "enrolled",
    enrolledAt: row.enrolled_at || row.enrolledAt || new Date().toISOString(),
    enrolledByAccountId: row.enrolled_by_account_id || row.enrolledByAccountId || "",
    completionStatus: row.completion_status || row.completionStatus || "not_started",
    completionPercentage: Number(row.completion_percentage ?? row.completionPercentage ?? 0),
    attendancePercentage: Number(row.attendance_percentage ?? row.attendancePercentage ?? 0),
    jobReadinessStatus: row.job_readiness_status || row.jobReadinessStatus || "not_assessed",
    withdrawalReason: row.withdrawal_reason || row.withdrawalReason || "",
    completedAt: row.completed_at || row.completedAt || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toTrainingSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    programmeId: row.programme_id || row.programmeId,
    organizationId: row.organization_id || row.organizationId,
    title: row.title || "",
    sessionDate: row.session_date || row.sessionDate || "",
    startTime: row.start_time || row.startTime || "",
    endTime: row.end_time || row.endTime || "",
    location: row.location || "",
    trainerName: row.trainer_name || row.trainerName || "",
    sessionType: row.session_type || row.sessionType || "classroom",
    status: row.status || "scheduled",
    notes: row.notes || "",
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toAttendanceRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id || row.sessionId,
    programmeId: row.programme_id || row.programmeId,
    organizationId: row.organization_id || row.organizationId,
    enrollmentId: row.enrollment_id || row.enrollmentId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    attendanceStatus: row.attendance_status || row.attendanceStatus || "not_marked",
    remarks: row.remarks || "",
    markedByAccountId: row.marked_by_account_id || row.markedByAccountId || "",
    markedAt: row.marked_at || row.markedAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toSkillAssessment(row) {
  if (!row) return null;
  return {
    id: row.id,
    programmeId: row.programme_id || row.programmeId,
    organizationId: row.organization_id || row.organizationId,
    enrollmentId: row.enrollment_id || row.enrollmentId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    assessmentTitle: row.assessment_title || row.assessmentTitle || "",
    assessmentType: row.assessment_type || row.assessmentType || "practical",
    skillName: row.skill_name || row.skillName || "",
    score: Number(row.score ?? 0),
    maximumScore: Number(row.maximum_score ?? row.maximumScore ?? 0),
    percentage: Number(row.percentage ?? 0),
    grade: row.grade || "",
    resultStatus: row.result_status || row.resultStatus || "pending",
    assessorName: row.assessor_name || row.assessorName || "",
    assessmentDate: row.assessment_date || row.assessmentDate || "",
    feedback: row.feedback || "",
    evidenceUrl: row.evidence_url || row.evidenceUrl || "",
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toWorkerCertificate(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    programmeId: row.programme_id || row.programmeId || "",
    enrollmentId: row.enrollment_id || row.enrollmentId || "",
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    certificateNumber: row.certificate_number || row.certificateNumber || "",
    certificateTitle: row.certificate_title || row.certificateTitle || "",
    skillName: row.skill_name || row.skillName || "",
    issueDate: row.issue_date || row.issueDate || "",
    expiryDate: row.expiry_date || row.expiryDate || "",
    credentialUrl: row.credential_url || row.credentialUrl || "",
    certificateFileUrl: row.certificate_file_url || row.certificateFileUrl || "",
    verificationStatus: row.verification_status || row.verificationStatus || "issued",
    verificationMethod: row.verification_method || row.verificationMethod || "organization_issued",
    shareWithEmployers: Boolean(row.share_with_employers ?? row.shareWithEmployers),
    verifiedByAccountId: row.verified_by_account_id || row.verifiedByAccountId || "",
    verifiedAt: row.verified_at || row.verifiedAt || "",
    revokedAt: row.revoked_at || row.revokedAt || "",
    revocationReason: row.revocation_reason || row.revocationReason || "",
    metadata: row.metadata || {},
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toTrainingActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    programmeId: row.programme_id || row.programmeId || "",
    enrollmentId: row.enrollment_id || row.enrollmentId || "",
    workerProfileId: row.worker_profile_id || row.workerProfileId || "",
    actorAccountId: row.actor_account_id || row.actorAccountId || "",
    activityType: row.activity_type || row.activityType || "",
    description: row.description || "",
    metadata: row.metadata || {},
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

function toJobOpportunity(row) {
  if (!row) return null;
  return {
    id: row.id,
    employerAccountId: row.employer_account_id || row.employerAccountId || "",
    employerProfileId: row.employer_profile_id || row.employerProfileId || "",
    employerName: row.employer_name || row.employerName || "Employer",
    title: row.title || "",
    jobCode: row.job_code || row.jobCode || "",
    description: row.description || "",
    skillSector: row.skill_sector || row.skillSector || "",
    requiredSkills: parseList(row.required_skills ?? row.requiredSkills),
    preferredSkills: parseList(row.preferred_skills ?? row.preferredSkills),
    locationCity: row.location_city || row.locationCity || "",
    locationState: row.location_state || row.locationState || "",
    workLocationType: row.work_location_type || row.workLocationType || "on_site",
    employmentType: row.employment_type || row.employmentType || "full_time",
    shiftType: row.shift_type || row.shiftType || "day",
    minimumExperienceYears: Number(row.minimum_experience_years ?? row.minimumExperienceYears ?? 0),
    maximumExperienceYears: Number(row.maximum_experience_years ?? row.maximumExperienceYears ?? 0),
    salaryMin: Number(row.salary_min ?? row.salaryMin ?? 0),
    salaryMax: Number(row.salary_max ?? row.salaryMax ?? 0),
    salaryPeriod: row.salary_period || row.salaryPeriod || "month",
    openPositions: Number(row.open_positions ?? row.openPositions ?? 1),
    filledPositions: Number(row.filled_positions ?? row.filledPositions ?? 0),
    applicationDeadline: row.application_deadline || row.applicationDeadline || "",
    joiningDate: row.joining_date || row.joiningDate || "",
    accommodationAvailable: Boolean(row.accommodation_available ?? row.accommodationAvailable),
    mealsAvailable: Boolean(row.meals_available ?? row.mealsAvailable),
    transportAvailable: Boolean(row.transport_available ?? row.transportAvailable),
    genderPreference: row.gender_preference || row.genderPreference || "",
    verificationStatus: row.verification_status || row.verificationStatus || "unverified",
    status: row.status || "open",
    publishedAt: row.published_at || row.publishedAt || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    closedAt: row.closed_at || row.closedAt || ""
  };
}

function toRecommendation(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    jobId: row.job_id || row.jobId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    associationId: row.association_id || row.associationId || "",
    recommendedByAccountId: row.recommended_by_account_id || row.recommendedByAccountId || "",
    recommendationStatus: row.recommendation_status || row.recommendationStatus || "draft",
    workerConsentStatus: row.worker_consent_status || row.workerConsentStatus || "pending",
    workerConsentRequestedAt: row.worker_consent_requested_at || row.workerConsentRequestedAt || "",
    workerConsentGrantedAt: row.worker_consent_granted_at || row.workerConsentGrantedAt || "",
    profileSnapshot: row.profile_snapshot || row.profileSnapshot || {},
    sharedFields: parseList(row.shared_fields ?? row.sharedFields),
    matchScore: Number(row.match_score ?? row.matchScore ?? 0),
    matchExplanation: row.match_explanation || row.matchExplanation || "",
    matchFactors: row.match_factors || row.matchFactors || [],
    organizationNote: row.organization_note || row.organizationNote || "",
    internalNote: row.internal_note || row.internalNote || "",
    workerNote: row.worker_note || row.workerNote || "",
    recommendedAt: row.recommended_at || row.recommendedAt || "",
    respondedAt: row.responded_at || row.respondedAt || "",
    withdrawnAt: row.withdrawn_at || row.withdrawnAt || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toPlacementRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    jobId: row.job_id || row.jobId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    recommendationId: row.recommendation_id || row.recommendationId || "",
    employerProfileId: row.employer_profile_id || row.employerProfileId || "",
    placementStatus: row.placement_status || row.placementStatus || "recommended",
    source: row.source || "ngo_recommendation",
    selectedAt: row.selected_at || row.selectedAt || "",
    offerDate: row.offer_date || row.offerDate || "",
    offeredSalary: Number(row.offered_salary ?? row.offeredSalary ?? 0),
    salaryPeriod: row.salary_period || row.salaryPeriod || "month",
    joiningDate: row.joining_date || row.joiningDate || "",
    actualJoiningDate: row.actual_joining_date || row.actualJoiningDate || "",
    employmentType: row.employment_type || row.employmentType || "",
    workLocation: row.work_location || row.workLocation || "",
    probationEndDate: row.probation_end_date || row.probationEndDate || "",
    employmentVerifiedByEmployer: Boolean(row.employment_verified_by_employer ?? row.employmentVerifiedByEmployer),
    employmentVerifiedAt: row.employment_verified_at || row.employmentVerifiedAt || "",
    endedAt: row.ended_at || row.endedAt || "",
    endReason: row.end_reason || row.endReason || "",
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toInterviewRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    jobId: row.job_id || row.jobId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    recommendationId: row.recommendation_id || row.recommendationId || "",
    placementId: row.placement_id || row.placementId || "",
    employerProfileId: row.employer_profile_id || row.employerProfileId || "",
    interviewType: row.interview_type || row.interviewType || "phone",
    scheduledDate: row.scheduled_date || row.scheduledDate || "",
    startTime: row.start_time || row.startTime || "",
    endTime: row.end_time || row.endTime || "",
    location: row.location || "",
    meetingLink: row.meeting_link || row.meetingLink || "",
    contactPerson: row.contact_person || row.contactPerson || "",
    status: row.status || "scheduled",
    workerConfirmed: Boolean(row.worker_confirmed ?? row.workerConfirmed),
    employerConfirmed: Boolean(row.employer_confirmed ?? row.employerConfirmed),
    outcome: row.outcome || "pending",
    feedbackSummary: row.feedback_summary || row.feedbackSummary || "",
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    completedAt: row.completed_at || row.completedAt || ""
  };
}

function toPlacementFollowUp(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    placementId: row.placement_id || row.placementId,
    workerProfileId: row.worker_profile_id || row.workerProfileId,
    employerProfileId: row.employer_profile_id || row.employerProfileId || "",
    followUpType: row.follow_up_type || row.followUpType || "custom",
    scheduledFor: row.scheduled_for || row.scheduledFor || "",
    completedAt: row.completed_at || row.completedAt || "",
    status: row.status || "scheduled",
    workerStatus: row.worker_status || row.workerStatus || "",
    employmentStatus: row.employment_status || row.employmentStatus || "",
    salaryConfirmed: Boolean(row.salary_confirmed ?? row.salaryConfirmed),
    salaryAmount: Number(row.salary_amount ?? row.salaryAmount ?? 0),
    salaryPeriod: row.salary_period || row.salaryPeriod || "month",
    workerSatisfaction: row.worker_satisfaction || row.workerSatisfaction || "",
    employerSatisfaction: row.employer_satisfaction || row.employerSatisfaction || "",
    issueCategory: row.issue_category || row.issueCategory || "none",
    notes: row.notes || "",
    nextAction: row.next_action || row.nextAction || "",
    createdByAccountId: row.created_by_account_id || row.createdByAccountId || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toEmployerConnection(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    employerProfileId: row.employer_profile_id || row.employerProfileId,
    employerName: row.employer_name || row.employerName || "Employer",
    industry: row.industry || "",
    locationCity: row.location_city || row.locationCity || "",
    verificationStatus: row.verification_status || row.verificationStatus || "unverified",
    connectionStatus: row.connection_status || row.connectionStatus || "prospect",
    firstContactedAt: row.first_contacted_at || row.firstContactedAt || "",
    connectedAt: row.connected_at || row.connectedAt || "",
    lastActivityAt: row.last_activity_at || row.lastActivityAt || "",
    relationshipOwnerAccountId: row.relationship_owner_account_id || row.relationshipOwnerAccountId || "",
    notes: row.notes || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

function toPlacementActivity(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id || row.organizationId,
    workerProfileId: row.worker_profile_id || row.workerProfileId || "",
    jobId: row.job_id || row.jobId || "",
    recommendationId: row.recommendation_id || row.recommendationId || "",
    placementId: row.placement_id || row.placementId || "",
    interviewId: row.interview_id || row.interviewId || "",
    actorAccountId: row.actor_account_id || row.actorAccountId || "",
    activityType: row.activity_type || row.activityType || "",
    description: row.description || "",
    metadata: row.metadata || {},
    createdAt: row.created_at || row.createdAt || new Date().toISOString()
  };
}

function assertOrganizationScope(record, organizationId) {
  if (!record || record.organizationId !== organizationId) throw new Error("This record is not available for your organization.");
}

function calculatePercentage(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function readLocalCollection(key) {
  const rows = readJson(key, []);
  return Array.isArray(rows) ? rows : [];
}

function upsertLocalCollection(key, item, matcher = (row) => row.id === item.id) {
  const rows = readLocalCollection(key);
  const existingIndex = rows.findIndex(matcher);
  const nextRows = existingIndex >= 0
    ? rows.map((row, index) => index === existingIndex ? item : row)
    : [item, ...rows];
  writeJson(key, nextRows);
  return item;
}

const placementTransitions = {
  worker_consent_pending: ["submitted", "withdrawn"],
  submitted: ["employer_viewed", "withdrawn", "not_selected"],
  employer_viewed: ["shortlisted", "not_selected", "withdrawn"],
  shortlisted: ["interview_requested", "not_selected", "withdrawn"],
  interview_requested: ["interview_scheduled", "not_selected", "withdrawn"],
  interview_scheduled: ["selected", "not_selected", "withdrawn"],
  selected: ["offer_made", "not_joined", "withdrawn"],
  offer_made: ["offer_accepted", "not_joined", "withdrawn"],
  offer_accepted: ["joined", "not_joined"],
  joined: ["employed", "follow_up", "left_job"],
  employed: ["follow_up", "left_job", "completed"],
  follow_up: ["employed", "completed", "left_job"],
  recommended: ["submitted", "employer_viewed", "shortlisted", "not_selected"],
  not_selected: [],
  withdrawn: [],
  not_joined: [],
  left_job: [],
  completed: []
};

export const database = {
  mode: hasDatabaseConfig ? "supabase" : "local-fallback",

  async signInOrCreateAccount(account) {
    const record = {
      id: account.uid || account.id || account.email || `local-${Date.now()}`,
      uid: account.uid || account.id,
      name: account.name,
      email: account.email,
      photoUrl: account.photoUrl,
      role: normalizeRole(account.role),
      roleLabel: account.roleLabel,
      organizationName: account.organizationName || account.companyName || "",
      employerType: account.employerType || "",
      organizationType: account.organizationType || "",
      phone: account.phone || "",
      onboardingCompleted: Boolean(account.onboardingCompleted),
      preferredLanguage: account.preferredLanguage || account.preferred_language || "en",
      provider: account.provider || (hasDatabaseConfig ? "supabase" : "local-fallback"),
      createdAt: account.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("rozgaar_accounts?on_conflict=id", {
          method: "POST",
          body: JSON.stringify({
            id: record.id,
            name: record.name,
            email: record.email,
            role: record.role,
            preferred_language: record.preferredLanguage,
            photo_url: record.photoUrl,
            provider: record.provider,
            created_at: record.createdAt,
            last_login: record.lastLogin
          })
        });
        writeJson(STORAGE_KEYS.account, record);
        return rows?.[0] ? { ...record, id: rows[0].id || record.id } : record;
      },
      () => writeJson(STORAGE_KEYS.account, record)
    );
  },

  async getCurrentAccount() {
    return readJson(STORAGE_KEYS.account, null);
  },

  async getAccountByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return null;
    const readLocalAccount = () => {
      const account = readJson(STORAGE_KEYS.account, null);
      return String(account?.email || "").trim().toLowerCase() === normalizedEmail
        ? { ...account, role: normalizeRole(account.role) }
        : null;
    };

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`rozgaar_accounts?email=eq.${encodeURIComponent(normalizedEmail)}&select=*&limit=1`, {
          method: "GET"
        });
        const row = rows?.[0];
        if (!row) return readLocalAccount();
        return {
          id: row.id,
          uid: row.id,
          name: row.name,
          email: row.email,
          role: normalizeRole(row.role),
          preferredLanguage: row.preferred_language || "en",
          photoUrl: row.photo_url,
          provider: row.provider,
          createdAt: row.created_at,
          lastLogin: row.last_login
        };
      },
      readLocalAccount
    );
  },

  async updateAccountLanguage(account, preferredLanguage) {
    if (!account) return null;
    const nextAccount = { ...account, preferredLanguage };
    const saveLocal = () => writeJson(STORAGE_KEYS.account, nextAccount);

    return tryDatabase(
      async () => {
        await supabaseRequest("rozgaar_accounts?on_conflict=id", {
          method: "POST",
          body: JSON.stringify({
            id: account.id,
            name: account.name,
            email: account.email,
            role: normalizeRole(account.role),
            preferred_language: preferredLanguage,
            photo_url: account.photoUrl,
            provider: account.provider,
            created_at: account.createdAt || new Date().toISOString(),
            last_login: new Date().toISOString()
          })
        });
        return saveLocal();
      },
      saveLocal
    );
  },

  async signOut() {
    window.localStorage.removeItem(STORAGE_KEYS.account);
    return true;
  },

  async getWorkerProfiles(account) {
    const userId = accountUserId(account);
    if (!userId) return [];

    const readLocalProfiles = () => {
      const scopedKey = workerProfilesKey(account);
      const scopedProfiles = readJson(scopedKey, []);
      return Array.isArray(scopedProfiles) ? scopedProfiles.filter((profile) => profile.userId === userId) : [];
    };

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`rozgaar_worker_profiles?user_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc`, {
          method: "GET"
        });
        const profiles = (rows || [])
          .map((row) => ({ ...(row.payload || {}), userId: row.user_id || row.payload?.userId }))
          .filter((profile) => profile.userId === userId);
        writeJson(workerProfilesKey(account), profiles);
        return profiles;
      },
      readLocalProfiles
    );
  },

  async saveWorkerProfile(profile, account) {
    const userId = profile.userId || accountUserId(account);
    if (!userId) {
      throw new Error("Cannot save worker profile without an authenticated user id.");
    }

    const ownedProfile = { ...profile, userId };
    const saveLocal = () => {
      const key = workerProfilesKey({ ...account, id: userId, uid: userId });
      const existingProfiles = readJson(key, []);
      const ownedProfiles = Array.isArray(existingProfiles)
        ? existingProfiles.filter((item) => item.userId === userId)
        : [];
      const nextProfiles = [
        ownedProfile,
        ...ownedProfiles.filter((item) => item.workerId !== ownedProfile.workerId)
      ];
      writeJson(key, nextProfiles);
      return ownedProfile;
    };

    return tryDatabase(
      async () => {
        await supabaseRequest("rozgaar_worker_profiles?on_conflict=user_id", {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
            worker_id: ownedProfile.workerId,
            payload: ownedProfile,
            updated_at: new Date().toISOString()
          })
        });
        return saveLocal();
      },
      saveLocal
    );
  },

  async saveEmployerWorker(workerId) {
    const saveLocal = () => {
      const savedWorkers = readJson(STORAGE_KEYS.employerSavedWorkers, []);
      const nextSavedWorkers = savedWorkers.includes(workerId) ? savedWorkers : [workerId, ...savedWorkers];
      writeJson(STORAGE_KEYS.employerSavedWorkers, nextSavedWorkers);
      return nextSavedWorkers;
    };

    return tryDatabase(
      async () => {
        await supabaseRequest("rozgaar_employer_saved_workers", {
          method: "POST",
          body: JSON.stringify({
            worker_id: workerId,
            saved_at: new Date().toISOString()
          })
        });
        return saveLocal();
      },
      saveLocal
    );
  },

  async createOrganization(payload, account) {
    const accountId = accountUserId(account);
    if (!accountId) throw new Error("Cannot create an organization without an authenticated account.");

    const readExistingLocal = () => readLocalCollection(STORAGE_KEYS.organizations)
      .map(toOrganization)
      .find((item) => item.createdByAccountId === accountId);

    const existing = readExistingLocal();
    if (existing) return existing;

    const row = fromOrganization({ ...payload, onboardingCompleted: true }, account);
    const saveLocal = () => {
      const saved = upsertLocalCollection(
        STORAGE_KEYS.organizations,
        row,
        (item) => item.created_by_account_id === accountId || item.slug === row.slug
      );
      return toOrganization(saved);
    };

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("organizations?on_conflict=slug", {
          method: "POST",
          body: JSON.stringify(row)
        });
        const organization = toOrganization(rows?.[0] || row);
        upsertLocalCollection(STORAGE_KEYS.organizations, fromOrganization(organization, account));
        return organization;
      },
      saveLocal
    );
  },

  async getOrganizationByAccount(account) {
    const accountId = accountUserId(account);
    if (!accountId) return null;

    const readLocalOrganization = () => {
      const membership = readLocalCollection(STORAGE_KEYS.organizationMembers)
        .map(toMember)
        .find((member) => member.accountId === accountId && member.status === "active");
      const organizations = readLocalCollection(STORAGE_KEYS.organizations).map(toOrganization);
      return organizations.find((organization) => organization.createdByAccountId === accountId || organization.id === membership?.organizationId) || null;
    };

    return tryDatabase(
      async () => {
        const memberRows = await supabaseRequest(`organization_members?account_id=eq.${encodeURIComponent(accountId)}&status=eq.active&select=*&limit=1`, { method: "GET" });
        const membership = toMember(memberRows?.[0]);
        if (!membership) return readLocalOrganization();
        const organizationRows = await supabaseRequest(`organizations?id=eq.${encodeURIComponent(membership.organizationId)}&select=*&limit=1`, { method: "GET" });
        const organization = toOrganization(organizationRows?.[0]);
        if (organization) upsertLocalCollection(STORAGE_KEYS.organizations, fromOrganization(organization, account));
        return organization;
      },
      readLocalOrganization
    );
  },

  async updateOrganization(organizationId, updates, account) {
    if (!organizationId) throw new Error("Organization id is required.");
    const existing = await this.getOrganizationByAccount(account);
    if (!existing || existing.id !== organizationId) {
      throw new Error("You can only update your own organization.");
    }

    const row = fromOrganization({ ...existing, ...updates, id: organizationId, createdAt: existing.createdAt }, account);
    const saveLocal = () => toOrganization(upsertLocalCollection(STORAGE_KEYS.organizations, row));

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`organizations?id=eq.${encodeURIComponent(organizationId)}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: row.name,
            slug: row.slug,
            organization_type: row.organization_type,
            registration_number: row.registration_number,
            official_email: row.official_email,
            phone: row.phone,
            website: row.website,
            contact_person_name: row.contact_person_name,
            description: row.description,
            logo_url: row.logo_url,
            headquarters_city: row.headquarters_city,
            headquarters_state: row.headquarters_state,
            headquarters_country: row.headquarters_country,
            locations_served: row.locations_served,
            skill_sectors: row.skill_sectors,
            approximate_workers_trained: row.approximate_workers_trained,
            verification_status: row.verification_status,
            onboarding_completed: row.onboarding_completed,
            updated_at: row.updated_at
          })
        });
        return toOrganization(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async createOrganizationMember({ organizationId, accountId, role = "organization_admin", status = "active" }) {
    if (!organizationId || !accountId) throw new Error("Organization and account are required for membership.");
    const now = new Date().toISOString();
    const row = {
      id: createId("org-member"),
      organization_id: organizationId,
      account_id: accountId,
      role,
      status,
      joined_at: status === "active" ? now : null,
      created_at: now,
      updated_at: now
    };
    const saveLocal = () => toMember(upsertLocalCollection(
      STORAGE_KEYS.organizationMembers,
      row,
      (item) => item.organization_id === organizationId && item.account_id === accountId
    ));

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("organization_members?on_conflict=organization_id,account_id", {
          method: "POST",
          body: JSON.stringify(row)
        });
        return toMember(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async getOrganizationMembers(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.organizationMembers)
      .map(toMember)
      .filter((member) => member.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  },

  async inviteOrganizationTeamMember({ organizationId, email, role = "viewer", invitedByAccountId = "" }) {
    if (!organizationId || !email?.trim()) throw new Error("Team invitation requires an email address.");
    const safeEmail = String(email).trim().toLowerCase();
    const member = await this.createOrganizationMember({
      organizationId,
      accountId: safeEmail,
      role,
      status: "invited"
    });
    await this.logOrganizationActivity({
      organizationId,
      actorAccountId: invitedByAccountId,
      activityType: "team_member_invited",
      description: `${safeEmail} was invited as ${role.replace(/_/g, " ")}.`,
      metadata: { email: safeEmail, role }
    });
    return member;
  },

  async updateOrganizationMember({ organizationId, memberId, updates = {}, account }) {
    if (!organizationId || !memberId) throw new Error("Organization member is required.");
    const rows = readLocalCollection(STORAGE_KEYS.organizationMembers);
    const existing = rows.find((member) => member.id === memberId && member.organization_id === organizationId);
    if (!existing) throw new Error("Team member not found.");
    const row = {
      ...existing,
      role: updates.role || existing.role,
      status: updates.status || existing.status,
      updated_at: new Date().toISOString()
    };
    const member = toMember(upsertLocalCollection(STORAGE_KEYS.organizationMembers, row));
    await this.logOrganizationActivity({
      organizationId,
      actorAccountId: accountUserId(account),
      activityType: "team_member_updated",
      description: `Team member ${member.accountId} was updated.`,
      metadata: { previous: { role: existing.role, status: existing.status }, next: { role: member.role, status: member.status } }
    });
    return member;
  },

  async getOrganizationMembership(account) {
    const accountId = accountUserId(account);
    if (!accountId) return null;

    const readLocalMembership = () => readLocalCollection(STORAGE_KEYS.organizationMembers)
      .map(toMember)
      .find((member) => member.accountId === accountId && member.status === "active") || null;

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`organization_members?account_id=eq.${encodeURIComponent(accountId)}&status=eq.active&select=*&limit=1`, { method: "GET" });
        return toMember(rows?.[0]) || readLocalMembership();
      },
      readLocalMembership
    );
  },

  async getOrganizationWorkerAssociations(organizationId) {
    if (!organizationId) return [];

    const readLocalAssociations = () => readLocalCollection(STORAGE_KEYS.workerOrganizationAssociations)
      .map(toAssociation)
      .filter((association) => association.organizationId === organizationId);

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`worker_organization_associations?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=updated_at.desc`, { method: "GET" });
        return (rows || []).map(toAssociation);
      },
      readLocalAssociations
    );
  },

  async getOrganizationActivityLogs(organizationId) {
    if (!organizationId) return [];

    const readLocalLogs = () => readLocalCollection(STORAGE_KEYS.organizationActivityLogs)
      .map(toActivity)
      .filter((activity) => activity.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`organization_activity_logs?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=created_at.desc`, { method: "GET" });
        return (rows || []).map(toActivity);
      },
      readLocalLogs
    );
  },

  async getOrganizationAuditLog(organizationId) {
    if (!organizationId) return [];
    const [organizationLogs, trainingLogs, placementLogs] = await Promise.all([
      this.getOrganizationActivityLogs(organizationId),
      this.getTrainingActivity({ organizationId }),
      this.getPlacementActivity({ organizationId })
    ]);
    return [
      ...organizationLogs.map((item) => ({ ...item, source: "organization", entity: item.workerProfileId ? "worker" : "organization" })),
      ...trainingLogs.map((item) => ({ ...item, source: "training", entity: item.programmeId ? "programme" : "training" })),
      ...placementLogs.map((item) => ({ ...item, source: "placement", entity: item.placementId ? "placement" : item.jobId ? "job" : "placement" }))
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async getOrganizationDashboardStats(organizationId) {
    const associations = await this.getOrganizationWorkerAssociations(organizationId);
    const linked = associations.filter((item) => item.associationStatus === "linked" && item.consentStatus === "granted").length;
    const consentPending = associations.filter((item) => item.consentStatus === "pending").length;
    const accessLimited = associations.filter((item) => item.associationStatus === "limited" || item.accessLevel === "limited").length;
    const accessRevoked = associations.filter((item) => item.consentStatus === "revoked" || item.associationStatus === "revoked").length;
    const trainingStats = await this.getTrainingDashboardStats(organizationId);
    const placementStats = await this.getPlacementDashboardStats(organizationId);
    return {
      totalWorkersLinked: linked,
      workersInTraining: trainingStats.workersInTraining,
      trainingCompleted: trainingStats.trainingCompleted,
      availableForEmployment: trainingStats.jobReadyWorkers,
      workersPlaced: placementStats.workersJoined,
      placementRate: placementStats.placementRate,
      activeEmployers: placementStats.activeEmployers,
      openOpportunities: placementStats.openOpportunities,
      recommendationsActive: placementStats.activeRecommendations,
      interviewsScheduled: placementStats.interviewsScheduled,
      workersSelected: placementStats.workersSelected,
      followUpsDue: placementStats.followUpsDue,
      placementStages: {
        linkedWorkers: linked,
        inTraining: trainingStats.workersInTraining,
        certified: trainingStats.certificatesVerified,
        available: trainingStats.jobReadyWorkers,
        shortlisted: placementStats.stageCounts.shortlisted || 0,
        placed: placementStats.workersJoined
      },
      workerStatus: {
        consentPending,
        linked,
        accessLimited,
        accessRevoked
      }
    };
  },

  async createWorkerOrganizationInvitation({ organizationId, workerProfileId, account, accessLevel = "limited" }) {
    const accountId = accountUserId(account);
    if (!organizationId || !workerProfileId || !accountId) throw new Error("Organization, worker, and account are required.");
    const now = new Date().toISOString();
    const row = {
      id: createId("worker-org"),
      organization_id: organizationId,
      worker_profile_id: workerProfileId,
      association_status: "invited",
      consent_status: "pending",
      consent_requested_at: now,
      consent_granted_at: null,
      consent_revoked_at: null,
      linked_at: null,
      linked_by_account_id: accountId,
      organization_worker_reference: "",
      is_current: true,
      access_level: accessLevel,
      created_at: now,
      updated_at: now
    };
    const saveLocal = () => toAssociation(upsertLocalCollection(
      STORAGE_KEYS.workerOrganizationAssociations,
      row,
      (item) => item.organization_id === organizationId && item.worker_profile_id === workerProfileId && item.is_current !== false
    ));

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("worker_organization_associations", {
          method: "POST",
          body: JSON.stringify(row)
        });
        return toAssociation(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async updateWorkerOrganizationConsent(associationId, consentStatus, account) {
    if (!associationId) throw new Error("Association id is required.");
    const now = new Date().toISOString();
    const updates = {
      consent_status: consentStatus,
      association_status: consentStatus === "granted" ? "linked" : consentStatus === "revoked" ? "revoked" : "pending",
      consent_granted_at: consentStatus === "granted" ? now : null,
      consent_revoked_at: consentStatus === "revoked" ? now : null,
      linked_at: consentStatus === "granted" ? now : null,
      linked_by_account_id: accountUserId(account),
      updated_at: now
    };
    const saveLocal = () => {
      const rows = readLocalCollection(STORAGE_KEYS.workerOrganizationAssociations);
      const existing = rows.find((row) => row.id === associationId);
      if (!existing) throw new Error("Association not found.");
      return toAssociation(upsertLocalCollection(STORAGE_KEYS.workerOrganizationAssociations, { ...existing, ...updates }));
    };

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`worker_organization_associations?id=eq.${encodeURIComponent(associationId)}`, {
          method: "PATCH",
          body: JSON.stringify(updates)
        });
        return toAssociation(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async revokeWorkerOrganizationAccess(associationId, account) {
    return this.updateWorkerOrganizationConsent(associationId, "revoked", account);
  },

  async logOrganizationActivity({ organizationId, actorAccountId, workerProfileId = "", activityType, description, metadata = {} }) {
    if (!organizationId || !activityType || !description) throw new Error("Organization, activity type, and description are required.");
    const row = {
      id: createId("org-activity"),
      organization_id: organizationId,
      actor_account_id: actorAccountId || "",
      worker_profile_id: workerProfileId,
      activity_type: activityType,
      description,
      metadata,
      created_at: new Date().toISOString()
    };
    const saveLocal = () => toActivity(upsertLocalCollection(STORAGE_KEYS.organizationActivityLogs, row));

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("organization_activity_logs", {
          method: "POST",
          body: JSON.stringify(row)
        });
        return toActivity(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async searchWorkerForOrganizationInvite(identifier, organizationId) {
    const query = String(identifier || "").trim();
    if (!query || query.length < 3) throw new Error("Enter a Worker ID, phone number, email, or public profile link.");
    if (!organizationId) throw new Error("Organization is required.");

    const localSearch = async () => {
      const allProfiles = readAllLocalWorkerProfiles();
      const matched = allProfiles.find((profile) => profileNameMatches(profile, query));
      if (!matched) return null;
      const existingAssociations = await this.getOrganizationWorkerAssociations(organizationId);
      const existingAssociation = existingAssociations.find((item) => item.workerProfileId === matched.workerId && item.isCurrent !== false);
      return {
        workerProfileId: matched.workerId,
        workerId: matched.workerId,
        name: matched.name?.split(" ").map((part, index) => index === 0 ? part : `${part.slice(0, 1)}.`).join(" ") || "Worker",
        primarySkill: matched.skill || "Not available",
        city: matched.city || "Not available",
        photoUrl: matched.photoUrl || "",
        existingAssociation: existingAssociation || null,
        privateFieldsHidden: true
      };
    };

    return tryDatabase(
      async () => {
        const safeQuery = encodeURIComponent(`*${query.replace(/^.*\/(worker|profile|public)\//, "")}*`);
        const rows = await supabaseRequest(`rozgaar_worker_profiles?or=(worker_id.ilike.${safeQuery},payload->>phone.ilike.${safeQuery},payload->>email.ilike.${safeQuery},payload->>name.ilike.${safeQuery})&select=*&limit=1`, { method: "GET" });
        const profile = rows?.[0] ? { ...(rows[0].payload || {}), workerId: rows[0].worker_id || rows[0].payload?.workerId } : null;
        if (!profile) return localSearch();
        const existingAssociations = await this.getOrganizationWorkerAssociations(organizationId);
        const existingAssociation = existingAssociations.find((item) => item.workerProfileId === profile.workerId && item.isCurrent !== false);
        return {
          workerProfileId: profile.workerId,
          workerId: profile.workerId,
          name: profile.name?.split(" ").map((part, index) => index === 0 ? part : `${part.slice(0, 1)}.`).join(" ") || "Worker",
          primarySkill: profile.skill || "Not available",
          city: profile.city || "Not available",
          photoUrl: profile.photoUrl || "",
          existingAssociation: existingAssociation || null,
          privateFieldsHidden: true
        };
      },
      localSearch
    );
  },

  async getOrganizationWorkers(organizationId) {
    if (!organizationId) return [];
    const [organization, associations] = await Promise.all([
      Promise.resolve(readLocalCollection(STORAGE_KEYS.organizations).map(toOrganization).find((item) => item.id === organizationId) || null),
      this.getOrganizationWorkerAssociations(organizationId)
    ]);
    const profiles = readAllLocalWorkerProfiles();
    const profileByWorkerId = new Map(profiles.map((profile) => [profile.workerId, profile]));
    return associations
      .filter((association) => association.isCurrent !== false)
      .map((association) => managedWorkerFromAssociation(association, profileByWorkerId.get(association.workerProfileId) || { workerId: association.workerProfileId }, organization))
      .sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0));
  },

  async getOrganizationWorkerById(organizationId, workerProfileId) {
    if (!organizationId || !workerProfileId) return null;
    const workers = await this.getOrganizationWorkers(organizationId);
    return workers.find((worker) => worker.workerProfileId === workerProfileId || worker.workerId === workerProfileId) || null;
  },

  async createConsentEvent({ associationId, organizationId, workerProfileId, eventType, accessLevel = "basic_support", actorAccountId = "", reason = "" }) {
    if (!associationId || !organizationId || !workerProfileId || !eventType) throw new Error("Consent event is incomplete.");
    const row = {
      id: createId("consent-event"),
      association_id: associationId,
      organization_id: organizationId,
      worker_profile_id: workerProfileId,
      event_type: eventType,
      access_level: accessLevel,
      permissions: consentPermissionSnapshot(accessLevel),
      consent_version: "2026-07-ngo-worker-access-v1",
      actor_account_id: actorAccountId,
      reason,
      created_at: new Date().toISOString()
    };
    const saveLocal = () => toConsentEvent(upsertLocalCollection(STORAGE_KEYS.workerOrganizationConsentEvents, row));
    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("worker_organization_consent_events", { method: "POST", body: JSON.stringify(row) });
        return toConsentEvent(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async inviteWorkerToOrganization({ organizationId, workerProfileId, account, organizationWorkerReference = "", reason = "", intendedSupportType = "profile_support", programmeName = "", invitationMessage = "", accessLevel = "basic_support" }) {
    const accountId = accountUserId(account);
    if (!organizationId || !workerProfileId || !accountId) throw new Error("Organization, worker, and account are required.");
    const existing = (await this.getOrganizationWorkerAssociations(organizationId)).find((item) => item.workerProfileId === workerProfileId && item.isCurrent !== false);
    const now = new Date().toISOString();
    const recentInvite = existing?.invitationLastSentAt && (Date.now() - new Date(existing.invitationLastSentAt).getTime()) < 60_000;
    if (recentInvite) throw new Error("Invitation was sent recently. Please wait before resending.");

    const baseRow = {
      id: existing?.id || createId("worker-org"),
      organization_id: organizationId,
      worker_profile_id: workerProfileId,
      association_status: existing?.associationStatus === "linked" ? "linked" : "invited",
      consent_status: existing?.consentStatus === "granted" ? "granted" : "pending",
      consent_requested_at: existing?.consentRequestedAt || now,
      consent_granted_at: existing?.consentGrantedAt || null,
      consent_revoked_at: existing?.consentRevokedAt || null,
      linked_at: existing?.linkedAt || null,
      linked_by_account_id: accountId,
      organization_worker_reference: organizationWorkerReference,
      is_current: true,
      access_level: accessLevel,
      reason,
      intended_support_type: intendedSupportType,
      programme_name: programmeName,
      invitation_message: invitationMessage,
      support_status: existing?.supportStatus || "new",
      employment_status: existing?.employmentStatus || "not_employed",
      profile_assistance_needed: existing?.profileAssistanceNeeded ?? true,
      invitation_last_sent_at: now,
      metadata: { reason, intendedSupportType, programmeName, invitationMessage },
      created_at: existing?.createdAt || now,
      updated_at: now
    };
    const saveLocal = () => toAssociation(upsertLocalCollection(
      STORAGE_KEYS.workerOrganizationAssociations,
      baseRow,
      (item) => item.organization_id === organizationId && item.worker_profile_id === workerProfileId && item.is_current !== false
    ));

    const association = await tryDatabase(
      async () => {
        const rows = existing
          ? await supabaseRequest(`worker_organization_associations?id=eq.${encodeURIComponent(existing.id)}`, { method: "PATCH", body: JSON.stringify(baseRow) })
          : await supabaseRequest("worker_organization_associations", { method: "POST", body: JSON.stringify(baseRow) });
        return toAssociation(rows?.[0] || saveLocal());
      },
      saveLocal
    );

    await this.createConsentEvent({ associationId: association.id, organizationId, workerProfileId, eventType: "requested", accessLevel, actorAccountId: accountId, reason });
    await this.createWorkerRequest({
      workerProfileId,
      organizationId,
      associationId: association.id,
      requestType: "organization_invitation",
      title: "Organization access request",
      message: invitationMessage || "An NGO/Foundation wants to support your RozgaarAI profile. Your account remains yours.",
      actionUrl: "/dashboard/organizations"
    });
    await this.logOrganizationActivity({
      organizationId,
      actorAccountId: accountId,
      workerProfileId,
      activityType: existing ? "worker_invitation_resent" : "worker_invitation_sent",
      description: existing ? "Worker organization invitation was resent." : "Worker organization invitation was sent.",
      metadata: { accessLevel, reason, intendedSupportType, programmeName }
    });
    return association;
  },

  async resendWorkerInvitation(associationId, account) {
    const rows = readLocalCollection(STORAGE_KEYS.workerOrganizationAssociations);
    const existing = rows.map(toAssociation).find((item) => item.id === associationId);
    if (!existing) throw new Error("Invitation not found.");
    return this.inviteWorkerToOrganization({
      organizationId: existing.organizationId,
      workerProfileId: existing.workerProfileId,
      account,
      organizationWorkerReference: existing.organizationWorkerReference,
      reason: existing.reason,
      intendedSupportType: existing.intendedSupportType,
      programmeName: existing.programmeName,
      invitationMessage: existing.invitationMessage,
      accessLevel: existing.accessLevel
    });
  },

  async createWorkerRequest({ workerProfileId, organizationId, associationId, requestType, title, message, actionUrl = "" }) {
    if (!workerProfileId || !organizationId || !associationId) throw new Error("Worker request is incomplete.");
    const now = new Date().toISOString();
    const row = {
      id: createId("worker-request"),
      worker_profile_id: workerProfileId,
      organization_id: organizationId,
      association_id: associationId,
      request_type: requestType,
      title,
      message,
      status: "pending",
      action_url: actionUrl,
      created_at: now,
      read_at: null,
      responded_at: null
    };
    const saveLocal = () => toWorkerRequest(upsertLocalCollection(
      STORAGE_KEYS.workerRequests,
      row,
      (item) => item.association_id === associationId && item.request_type === requestType && item.status === "pending"
    ));
    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("worker_requests", { method: "POST", body: JSON.stringify(row) });
        return toWorkerRequest(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async getWorkerOrganizationRequests(account) {
    const profiles = await this.getWorkerProfiles(account);
    const workerIds = new Set(profiles.map((profile) => profile.workerId));
    const requests = readLocalCollection(STORAGE_KEYS.workerRequests).map(toWorkerRequest).filter((request) => workerIds.has(request.workerProfileId));
    const organizations = readLocalCollection(STORAGE_KEYS.organizations).map(toOrganization);
    const associations = readLocalCollection(STORAGE_KEYS.workerOrganizationAssociations).map(toAssociation);
    return requests.map((request) => ({
      ...request,
      organization: organizations.find((item) => item.id === request.organizationId) || null,
      association: associations.find((item) => item.id === request.associationId) || null
    })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async respondToOrganizationInvitation(requestId, responseStatus, account) {
    const requests = readLocalCollection(STORAGE_KEYS.workerRequests);
    const request = requests.map(toWorkerRequest).find((item) => item.id === requestId);
    if (!request) throw new Error("Request not found.");
    const consentStatus = responseStatus === "accepted" ? "granted" : "declined";
    const association = await this.updateWorkerOrganizationConsent(request.associationId, consentStatus, account);
    const now = new Date().toISOString();
    upsertLocalCollection(STORAGE_KEYS.workerRequests, {
      ...requests.find((item) => item.id === requestId),
      status: responseStatus,
      responded_at: now,
      updated_at: now
    });
    await this.createConsentEvent({
      associationId: request.associationId,
      organizationId: request.organizationId,
      workerProfileId: request.workerProfileId,
      eventType: consentStatus,
      accessLevel: association.accessLevel,
      actorAccountId: accountUserId(account),
      reason: responseStatus === "accepted" ? "Worker accepted organization support request." : "Worker declined organization support request."
    });
    await this.logOrganizationActivity({
      organizationId: request.organizationId,
      actorAccountId: accountUserId(account),
      workerProfileId: request.workerProfileId,
      activityType: responseStatus === "accepted" ? "consent_granted" : "consent_declined",
      description: responseStatus === "accepted" ? "Worker granted organization access." : "Worker declined organization access."
    });
    return association;
  },

  async endWorkerOrganizationAssociation(associationId, account) {
    if (!associationId) throw new Error("Association id is required.");
    const now = new Date().toISOString();
    const rows = readLocalCollection(STORAGE_KEYS.workerOrganizationAssociations);
    const existing = rows.find((row) => row.id === associationId);
    if (!existing) throw new Error("Association not found.");
    const updatedRow = { ...existing, association_status: "former", is_current: false, updated_at: now };
    const saveLocal = () => toAssociation(upsertLocalCollection(STORAGE_KEYS.workerOrganizationAssociations, updatedRow));
    const association = await tryDatabase(
      async () => {
        const result = await supabaseRequest(`worker_organization_associations?id=eq.${encodeURIComponent(associationId)}`, { method: "PATCH", body: JSON.stringify({ association_status: "former", is_current: false, updated_at: now }) });
        return toAssociation(result?.[0] || saveLocal());
      },
      saveLocal
    );
    await this.logOrganizationActivity({
      organizationId: association.organizationId,
      actorAccountId: accountUserId(account),
      workerProfileId: association.workerProfileId,
      activityType: "association_ended",
      description: "Organization marked the worker relationship as former."
    });
    return association;
  },

  async createAssistedWorkerDraft(payload, account) {
    const now = new Date().toISOString();
    if (!payload.organizationId) throw new Error("Organization is required.");
    if (!payload.workerName || !payload.contactValue || !payload.primarySkill || !payload.city) throw new Error("Worker name, contact, skill and city are required.");
    const row = {
      id: createId("worker-draft"),
      organization_id: payload.organizationId,
      assigned_ngo_member_id: accountUserId(account),
      worker_name: payload.workerName,
      contact_method: payload.contactMethod || "phone",
      contact_value: payload.contactValue,
      preferred_language: payload.preferredLanguage || "en",
      city: payload.city,
      primary_skill: payload.primarySkill,
      experience: payload.experience || "",
      employment_preference: payload.employmentPreference || "",
      availability: payload.availability || "",
      expected_wage: payload.expectedWage || "",
      draft_status: payload.consentConfirmed ? "worker_verification_pending" : "draft",
      consent_confirmed: Boolean(payload.consentConfirmed),
      created_at: now,
      expiry_date: payload.expiryDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      updated_at: now
    };
    const saveLocal = () => toAssistedDraft(upsertLocalCollection(STORAGE_KEYS.assistedWorkerDrafts, row));
    const draft = await tryDatabase(
      async () => {
        const rows = await supabaseRequest("assisted_worker_drafts", { method: "POST", body: JSON.stringify(row) });
        return toAssistedDraft(rows?.[0] || saveLocal());
      },
      saveLocal
    );
    await this.logOrganizationActivity({
      organizationId: payload.organizationId,
      actorAccountId: accountUserId(account),
      activityType: "assisted_worker_draft_created",
      description: "Assisted worker onboarding draft was created.",
      metadata: { draftId: draft.id, primarySkill: draft.primarySkill }
    });
    return draft;
  },

  async getOrganizationAssistedDrafts(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.assistedWorkerDrafts)
      .map(toAssistedDraft)
      .filter((draft) => draft.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  },

  async getOrganizationWorkerNotes({ organizationId, workerProfileId }) {
    if (!organizationId || !workerProfileId) return [];
    return readLocalCollection(STORAGE_KEYS.organizationWorkerNotes)
      .map(toOrganizationWorkerNote)
      .filter((note) => note.organizationId === organizationId && note.workerProfileId === workerProfileId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async createOrganizationWorkerNote({ organizationId, workerProfileId, associationId, account, noteType = "general", content, visibility = "organization_only", followUpDate = "", status = "open" }) {
    if (!organizationId || !workerProfileId || !associationId || !content) throw new Error("Note content and worker association are required.");
    const now = new Date().toISOString();
    const row = {
      id: createId("org-worker-note"),
      organization_id: organizationId,
      worker_profile_id: workerProfileId,
      association_id: associationId,
      author_account_id: accountUserId(account),
      note_type: noteType,
      content,
      visibility,
      follow_up_date: followUpDate || null,
      status,
      created_at: now,
      updated_at: now
    };
    const note = toOrganizationWorkerNote(upsertLocalCollection(STORAGE_KEYS.organizationWorkerNotes, row));
    await this.logOrganizationActivity({
      organizationId,
      actorAccountId: accountUserId(account),
      workerProfileId,
      activityType: "worker_note_added",
      description: "Organization follow-up note was added.",
      metadata: { noteType, visibility }
    });
    return note;
  },

  async getOrganizationWorkerActivity({ organizationId, workerProfileId }) {
    if (!organizationId || !workerProfileId) return [];
    const [logs, notes, consentEvents] = await Promise.all([
      this.getOrganizationActivityLogs(organizationId),
      this.getOrganizationWorkerNotes({ organizationId, workerProfileId }),
      Promise.resolve(readLocalCollection(STORAGE_KEYS.workerOrganizationConsentEvents).map(toConsentEvent).filter((event) => event.organizationId === organizationId && event.workerProfileId === workerProfileId))
    ]);
    return [
      ...logs.filter((log) => log.workerProfileId === workerProfileId).map((log) => ({ ...log, kind: "activity" })),
      ...notes.map((note) => ({ id: note.id, kind: "note", activityType: "note", description: note.content, createdAt: note.createdAt, metadata: { noteType: note.noteType, visibility: note.visibility } })),
      ...consentEvents.map((event) => ({ id: event.id, kind: "consent", activityType: `consent_${event.eventType}`, description: `Consent ${event.eventType.replace(/_/g, " ")} for ${event.accessLevel.replace(/_/g, " ")}.`, createdAt: event.createdAt, metadata: { permissions: event.permissions } }))
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async updateOrganizationSupportStatus({ organizationId, associationId, account, supportStatus, availabilityOverride, employmentStatus, assignedCoordinator, nextFollowUpAt, profileAssistanceNeeded }) {
    if (!organizationId || !associationId) throw new Error("Organization and association are required.");
    const rows = readLocalCollection(STORAGE_KEYS.workerOrganizationAssociations);
    const existing = rows.find((row) => row.id === associationId && row.organization_id === organizationId);
    if (!existing) throw new Error("Worker association not found for this organization.");
    const updates = {
      support_status: supportStatus ?? existing.support_status,
      availability_override: availabilityOverride ?? existing.availability_override,
      employment_status: employmentStatus ?? existing.employment_status,
      assigned_coordinator: assignedCoordinator ?? existing.assigned_coordinator,
      next_follow_up_at: nextFollowUpAt ?? existing.next_follow_up_at,
      profile_assistance_needed: profileAssistanceNeeded ?? existing.profile_assistance_needed,
      updated_at: new Date().toISOString()
    };
    const association = toAssociation(upsertLocalCollection(STORAGE_KEYS.workerOrganizationAssociations, { ...existing, ...updates }));
    await this.logOrganizationActivity({
      organizationId,
      actorAccountId: accountUserId(account),
      workerProfileId: association.workerProfileId,
      activityType: "worker_support_updated",
      description: "Organization support status was updated.",
      metadata: updates
    });
    return association;
  },

  async updateWorkerWithOrganizationAssistance({ organizationId, workerProfileId, account, changes, reason = "" }) {
    const worker = await this.getOrganizationWorkerById(organizationId, workerProfileId);
    if (!worker?.canViewPrivate) throw new Error("Granted worker consent is required before profile assistance.");
    await this.logOrganizationActivity({
      organizationId,
      actorAccountId: accountUserId(account),
      workerProfileId,
      activityType: "profile_assistance_proposed",
      description: "Profile assistance change was recorded for worker review.",
      metadata: { changes, reason }
    });
    return { status: "review_required", changes, reason };
  },

  async logTrainingActivity({ organizationId, programmeId = "", enrollmentId = "", workerProfileId = "", actorAccountId = "", activityType, description, metadata = {} }) {
    if (!organizationId || !activityType || !description) throw new Error("Training activity is incomplete.");
    const row = {
      id: createId("training-activity"),
      organization_id: organizationId,
      programme_id: programmeId || null,
      enrollment_id: enrollmentId || null,
      worker_profile_id: workerProfileId || "",
      actor_account_id: actorAccountId || "",
      activity_type: activityType,
      description,
      metadata,
      created_at: new Date().toISOString()
    };
    const saveLocal = () => toTrainingActivity(upsertLocalCollection(STORAGE_KEYS.trainingActivityLogs, row));
    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("training_activity_logs", { method: "POST", body: JSON.stringify(row) });
        return toTrainingActivity(rows?.[0] || saveLocal());
      },
      saveLocal
    );
  },

  async getTrainingActivity({ organizationId, programmeId = "", workerProfileId = "" }) {
    if (!organizationId) return [];
    const readLocal = () => readLocalCollection(STORAGE_KEYS.trainingActivityLogs)
      .map(toTrainingActivity)
      .filter((activity) => activity.organizationId === organizationId)
      .filter((activity) => !programmeId || activity.programmeId === programmeId)
      .filter((activity) => !workerProfileId || activity.workerProfileId === workerProfileId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return tryDatabase(
      async () => {
        const filters = [`organization_id=eq.${encodeURIComponent(organizationId)}`];
        if (programmeId) filters.push(`programme_id=eq.${encodeURIComponent(programmeId)}`);
        if (workerProfileId) filters.push(`worker_profile_id=eq.${encodeURIComponent(workerProfileId)}`);
        const rows = await supabaseRequest(`training_activity_logs?${filters.join("&")}&select=*&order=created_at.desc`, { method: "GET" });
        return (rows || []).map(toTrainingActivity);
      },
      readLocal
    );
  },

  async createTrainingProgramme(payload, account) {
    if (!payload.organizationId) throw new Error("Organization is required.");
    if (!payload.title?.trim()) throw new Error("Programme title is required.");
    if (!payload.primarySkill) throw new Error("Primary skill is required.");
    if (!payload.deliveryMode) throw new Error("Delivery mode is required.");
    if (!payload.startDate || !payload.endDate) throw new Error("Start and end dates are required.");
    if (new Date(payload.endDate) < new Date(payload.startDate)) throw new Error("End date cannot be before start date.");
    if (payload.capacity && Number(payload.capacity) <= 0) throw new Error("Capacity must be a positive number.");
    const existing = await this.getOrganizationTrainingProgrammes(payload.organizationId, { includeArchived: true });
    if (existing.some((item) => item.programmeCode.toLowerCase() === String(payload.programmeCode || "").toLowerCase())) {
      throw new Error("Programme code already exists for this organization.");
    }
    const row = fromTrainingProgramme(payload, account);
    const programme = await tryDatabase(
      async () => {
        const rows = await supabaseRequest("training_programmes", { method: "POST", body: JSON.stringify(row) });
        return toTrainingProgramme(rows?.[0] || upsertLocalCollection(STORAGE_KEYS.trainingProgrammes, row));
      },
      () => toTrainingProgramme(upsertLocalCollection(STORAGE_KEYS.trainingProgrammes, row))
    );
    await this.logTrainingActivity({
      organizationId: programme.organizationId,
      programmeId: programme.id,
      actorAccountId: accountUserId(account),
      activityType: "programme_created",
      description: `Training programme "${programme.title}" was created.`
    });
    return programme;
  },

  async updateTrainingProgramme(programmeId, updates, account) {
    const existing = await this.getTrainingProgrammeById(programmeId, updates.organizationId);
    if (!existing) throw new Error("Programme not found.");
    if (updates.endDate && (updates.startDate || existing.startDate) && new Date(updates.endDate) < new Date(updates.startDate || existing.startDate)) {
      throw new Error("End date cannot be before start date.");
    }
    if (updates.capacity && Number(updates.capacity) <= 0) throw new Error("Capacity must be a positive number.");
    const row = fromTrainingProgramme({ ...existing, ...updates, id: programmeId, organizationId: existing.organizationId, createdAt: existing.createdAt }, account);
    const saveLocal = () => toTrainingProgramme(upsertLocalCollection(STORAGE_KEYS.trainingProgrammes, row));
    const programme = await tryDatabase(
      async () => {
        const rows = await supabaseRequest(`training_programmes?id=eq.${encodeURIComponent(programmeId)}&organization_id=eq.${encodeURIComponent(existing.organizationId)}`, { method: "PATCH", body: JSON.stringify(row) });
        return toTrainingProgramme(rows?.[0] || saveLocal());
      },
      saveLocal
    );
    await this.logTrainingActivity({
      organizationId: programme.organizationId,
      programmeId: programme.id,
      actorAccountId: accountUserId(account),
      activityType: "programme_updated",
      description: `Training programme "${programme.title}" was updated.`
    });
    return programme;
  },

  async getOrganizationTrainingProgrammes(organizationId, { includeArchived = false } = {}) {
    if (!organizationId) return [];
    const readLocal = () => readLocalCollection(STORAGE_KEYS.trainingProgrammes)
      .map(toTrainingProgramme)
      .filter((programme) => programme.organizationId === organizationId)
      .filter((programme) => includeArchived || !["archived", "cancelled"].includes(programme.status))
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return tryDatabase(
      async () => {
        const rows = await supabaseRequest(`training_programmes?organization_id=eq.${encodeURIComponent(organizationId)}&select=*&order=updated_at.desc`, { method: "GET" });
        return (rows || []).map(toTrainingProgramme).filter((programme) => includeArchived || !["archived", "cancelled"].includes(programme.status));
      },
      readLocal
    );
  },

  async getTrainingProgrammeById(programmeId, organizationId) {
    if (!programmeId) return null;
    const readLocal = () => {
      const programme = readLocalCollection(STORAGE_KEYS.trainingProgrammes).map(toTrainingProgramme).find((item) => item.id === programmeId) || null;
      if (programme && organizationId) assertOrganizationScope(programme, organizationId);
      return programme;
    };
    return tryDatabase(
      async () => {
        const filters = [`id=eq.${encodeURIComponent(programmeId)}`];
        if (organizationId) filters.push(`organization_id=eq.${encodeURIComponent(organizationId)}`);
        const rows = await supabaseRequest(`training_programmes?${filters.join("&")}&select=*&limit=1`, { method: "GET" });
        return toTrainingProgramme(rows?.[0]) || readLocal();
      },
      readLocal
    );
  },

  async archiveTrainingProgramme(programmeId, organizationId, account) {
    return this.updateTrainingProgramme(programmeId, { organizationId, status: "archived", archivedAt: new Date().toISOString() }, account);
  },

  async getEligibleWorkersForProgramme({ organizationId, programmeId }) {
    const [workers, enrollments] = await Promise.all([
      this.getOrganizationWorkers(organizationId),
      this.getProgrammeEnrollments(programmeId, organizationId)
    ]);
    const activeWorkerIds = new Set(enrollments.filter((item) => !["withdrawn", "failed", "cancelled"].includes(item.enrollmentStatus)).map((item) => item.workerProfileId));
    return workers.map((worker) => {
      const eligible = worker.associationStatus === "linked" && worker.consentStatus === "granted" && worker.association?.isCurrent !== false && !activeWorkerIds.has(worker.workerProfileId);
      return {
        ...worker,
        eligible,
        eligibilityReason: eligible
          ? "Eligible for enrolment"
          : activeWorkerIds.has(worker.workerProfileId)
            ? "Already enrolled"
            : worker.consentStatus !== "granted"
              ? "Worker consent is required"
              : "Worker is not currently linked"
      };
    });
  },

  async enrolWorkersInProgramme({ organizationId, programmeId, workerProfileIds, account }) {
    if (!organizationId || !programmeId || !workerProfileIds?.length) throw new Error("Select at least one eligible worker.");
    const programme = await this.getTrainingProgrammeById(programmeId, organizationId);
    if (!programme) throw new Error("Programme not found.");
    const eligibleWorkers = await this.getEligibleWorkersForProgramme({ organizationId, programmeId });
    const eligibleById = new Map(eligibleWorkers.filter((worker) => worker.eligible).map((worker) => [worker.workerProfileId, worker]));
    const invalid = workerProfileIds.find((workerId) => !eligibleById.has(workerId));
    if (invalid) throw new Error("One or more selected workers are not eligible for this programme.");
    const now = new Date().toISOString();
    const created = [];
    for (const workerProfileId of workerProfileIds) {
      const worker = eligibleById.get(workerProfileId);
      const row = {
        id: createId("enrollment"),
        programme_id: programmeId,
        organization_id: organizationId,
        worker_profile_id: workerProfileId,
        association_id: worker.association?.id || null,
        enrollment_status: "enrolled",
        enrolled_at: now,
        enrolled_by_account_id: accountUserId(account),
        completion_status: "not_started",
        completion_percentage: 0,
        attendance_percentage: 0,
        job_readiness_status: "not_assessed",
        withdrawal_reason: "",
        completed_at: null,
        created_at: now,
        updated_at: now
      };
      const enrollment = await tryDatabase(
        async () => {
          const rows = await supabaseRequest("programme_enrollments", { method: "POST", body: JSON.stringify(row) });
          return toProgrammeEnrollment(rows?.[0] || upsertLocalCollection(STORAGE_KEYS.programmeEnrollments, row));
        },
        () => toProgrammeEnrollment(upsertLocalCollection(STORAGE_KEYS.programmeEnrollments, row))
      );
      created.push(enrollment);
      await this.logTrainingActivity({
        organizationId,
        programmeId,
        enrollmentId: enrollment.id,
        workerProfileId,
        actorAccountId: accountUserId(account),
        activityType: "worker_enrolled",
        description: `${worker.name || "Worker"} was enrolled in ${programme.title}.`
      });
    }
    return created;
  },

  async getProgrammeEnrollments(programmeId, organizationId) {
    if (!programmeId) return [];
    const readLocal = () => readLocalCollection(STORAGE_KEYS.programmeEnrollments)
      .map(toProgrammeEnrollment)
      .filter((enrollment) => enrollment.programmeId === programmeId)
      .filter((enrollment) => !organizationId || enrollment.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return tryDatabase(
      async () => {
        const filters = [`programme_id=eq.${encodeURIComponent(programmeId)}`];
        if (organizationId) filters.push(`organization_id=eq.${encodeURIComponent(organizationId)}`);
        const rows = await supabaseRequest(`programme_enrollments?${filters.join("&")}&select=*&order=updated_at.desc`, { method: "GET" });
        return (rows || []).map(toProgrammeEnrollment);
      },
      readLocal
    );
  },

  async updateProgrammeEnrollment(enrollmentId, updates, account) {
    const existing = readLocalCollection(STORAGE_KEYS.programmeEnrollments).map(toProgrammeEnrollment).find((item) => item.id === enrollmentId);
    if (!existing) throw new Error("Enrollment not found.");
    const row = {
      id: existing.id,
      programme_id: existing.programmeId,
      organization_id: existing.organizationId,
      worker_profile_id: existing.workerProfileId,
      association_id: existing.associationId || null,
      enrollment_status: updates.enrollmentStatus || existing.enrollmentStatus,
      enrolled_at: existing.enrolledAt,
      enrolled_by_account_id: existing.enrolledByAccountId,
      completion_status: updates.completionStatus || existing.completionStatus,
      completion_percentage: Number(updates.completionPercentage ?? existing.completionPercentage),
      attendance_percentage: Number(updates.attendancePercentage ?? existing.attendancePercentage),
      job_readiness_status: updates.jobReadinessStatus || existing.jobReadinessStatus,
      withdrawal_reason: updates.withdrawalReason || existing.withdrawalReason || "",
      completed_at: updates.completedAt ?? (existing.completedAt || null),
      created_at: existing.createdAt,
      updated_at: new Date().toISOString()
    };
    const saveLocal = () => toProgrammeEnrollment(upsertLocalCollection(STORAGE_KEYS.programmeEnrollments, row));
    const enrollment = await tryDatabase(
      async () => {
        const rows = await supabaseRequest(`programme_enrollments?id=eq.${encodeURIComponent(enrollmentId)}&organization_id=eq.${encodeURIComponent(existing.organizationId)}`, { method: "PATCH", body: JSON.stringify(row) });
        return toProgrammeEnrollment(rows?.[0] || saveLocal());
      },
      saveLocal
    );
    await this.logTrainingActivity({
      organizationId: enrollment.organizationId,
      programmeId: enrollment.programmeId,
      enrollmentId,
      workerProfileId: enrollment.workerProfileId,
      actorAccountId: accountUserId(account),
      activityType: "enrollment_updated",
      description: "Training enrollment was updated.",
      metadata: updates
    });
    return enrollment;
  },

  async withdrawProgrammeEnrollment(enrollmentId, reason, account) {
    if (!reason?.trim()) throw new Error("Withdrawal reason is required.");
    return this.updateProgrammeEnrollment(enrollmentId, { enrollmentStatus: "withdrawn", withdrawalReason: reason }, account);
  },

  async createTrainingSession(payload, account) {
    if (!payload.programmeId || !payload.organizationId || !payload.title || !payload.sessionDate) throw new Error("Session title and date are required.");
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("session"),
      programme_id: payload.programmeId,
      organization_id: payload.organizationId,
      title: payload.title,
      session_date: payload.sessionDate,
      start_time: payload.startTime || null,
      end_time: payload.endTime || null,
      location: payload.location || "",
      trainer_name: payload.trainerName || "",
      session_type: payload.sessionType || "classroom",
      status: payload.status || "scheduled",
      notes: payload.notes || "",
      created_by_account_id: accountUserId(account),
      created_at: payload.createdAt || now,
      updated_at: now
    };
    const session = toTrainingSession(upsertLocalCollection(STORAGE_KEYS.trainingSessions, row));
    await this.logTrainingActivity({
      organizationId: session.organizationId,
      programmeId: session.programmeId,
      actorAccountId: accountUserId(account),
      activityType: "session_created",
      description: `Training session "${session.title}" was scheduled.`
    });
    return session;
  },

  async updateTrainingSession(sessionId, updates, account) {
    const existing = readLocalCollection(STORAGE_KEYS.trainingSessions).find((item) => item.id === sessionId);
    if (!existing) throw new Error("Session not found.");
    const row = { ...existing, ...updates, updated_at: new Date().toISOString() };
    const session = toTrainingSession(upsertLocalCollection(STORAGE_KEYS.trainingSessions, row));
    await this.logTrainingActivity({ organizationId: session.organizationId, programmeId: session.programmeId, actorAccountId: accountUserId(account), activityType: "session_updated", description: `Training session "${session.title}" was updated.` });
    return session;
  },

  async getTrainingSessions(programmeId, organizationId) {
    if (!programmeId) return [];
    return readLocalCollection(STORAGE_KEYS.trainingSessions)
      .map(toTrainingSession)
      .filter((session) => session.programmeId === programmeId && (!organizationId || session.organizationId === organizationId))
      .sort((a, b) => new Date(a.sessionDate || 0) - new Date(b.sessionDate || 0));
  },

  async saveAttendanceRecords({ organizationId, programmeId, sessionId, records, account }) {
    if (!organizationId || !programmeId || !sessionId) throw new Error("Session is required for attendance.");
    const now = new Date().toISOString();
    const saved = records.map((record) => {
      const row = {
        id: record.id || createId("attendance"),
        session_id: sessionId,
        programme_id: programmeId,
        organization_id: organizationId,
        enrollment_id: record.enrollmentId,
        worker_profile_id: record.workerProfileId,
        attendance_status: record.attendanceStatus || "not_marked",
        remarks: record.remarks || "",
        marked_by_account_id: accountUserId(account),
        marked_at: now,
        updated_at: now
      };
      return toAttendanceRecord(upsertLocalCollection(
        STORAGE_KEYS.attendanceRecords,
        row,
        (item) => item.session_id === sessionId && item.enrollment_id === record.enrollmentId
      ));
    });
    const enrollments = await this.getProgrammeEnrollments(programmeId, organizationId);
    const attendance = await this.getProgrammeAttendance(programmeId, organizationId);
    for (const enrollment of enrollments) {
      const workerRows = attendance.filter((item) => item.enrollmentId === enrollment.id && item.attendanceStatus !== "not_marked");
      const attended = workerRows.filter((item) => ["present", "late", "excused"].includes(item.attendanceStatus)).length;
      await this.updateProgrammeEnrollment(enrollment.id, { attendancePercentage: calculatePercentage(attended, workerRows.length) }, account);
    }
    await this.logTrainingActivity({ organizationId, programmeId, actorAccountId: accountUserId(account), activityType: "attendance_marked", description: "Training attendance was marked.", metadata: { sessionId, count: saved.length } });
    return saved;
  },

  async getProgrammeAttendance(programmeId, organizationId) {
    if (!programmeId) return [];
    return readLocalCollection(STORAGE_KEYS.attendanceRecords)
      .map(toAttendanceRecord)
      .filter((record) => record.programmeId === programmeId && (!organizationId || record.organizationId === organizationId))
      .sort((a, b) => new Date(b.markedAt || 0) - new Date(a.markedAt || 0));
  },

  async getWorkerTrainingAttendance(workerProfileId) {
    if (!workerProfileId) return [];
    return readLocalCollection(STORAGE_KEYS.attendanceRecords).map(toAttendanceRecord).filter((record) => record.workerProfileId === workerProfileId);
  },

  async createSkillAssessment(payload, account) {
    if (!payload.enrollmentId || !payload.programmeId || !payload.organizationId || !payload.workerProfileId) throw new Error("Assessment requires a worker enrollment.");
    if (Number(payload.maximumScore) <= 0 || Number(payload.score) < 0 || Number(payload.score) > Number(payload.maximumScore)) throw new Error("Assessment score must be between 0 and the maximum score.");
    const percentage = Math.round((Number(payload.score) / Number(payload.maximumScore)) * 100);
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("assessment"),
      programme_id: payload.programmeId,
      organization_id: payload.organizationId,
      enrollment_id: payload.enrollmentId,
      worker_profile_id: payload.workerProfileId,
      assessment_title: payload.assessmentTitle || "Skill assessment",
      assessment_type: payload.assessmentType || "practical",
      skill_name: payload.skillName || "",
      score: Number(payload.score),
      maximum_score: Number(payload.maximumScore),
      percentage,
      grade: payload.grade || (percentage >= 80 ? "A" : percentage >= 60 ? "B" : "Needs support"),
      result_status: payload.resultStatus || (percentage >= 60 ? "passed" : "needs_improvement"),
      assessor_name: payload.assessorName || "",
      assessment_date: payload.assessmentDate || new Date().toISOString().slice(0, 10),
      feedback: payload.feedback || "",
      evidence_url: payload.evidenceUrl || "",
      created_by_account_id: accountUserId(account),
      created_at: payload.createdAt || now,
      updated_at: now
    };
    const assessment = toSkillAssessment(upsertLocalCollection(STORAGE_KEYS.skillAssessments, row));
    await this.logTrainingActivity({ organizationId: assessment.organizationId, programmeId: assessment.programmeId, enrollmentId: assessment.enrollmentId, workerProfileId: assessment.workerProfileId, actorAccountId: accountUserId(account), activityType: "assessment_recorded", description: `${assessment.assessmentTitle} was recorded.`, metadata: { percentage: assessment.percentage, resultStatus: assessment.resultStatus } });
    return assessment;
  },

  async updateSkillAssessment(assessmentId, updates, account) {
    const existing = readLocalCollection(STORAGE_KEYS.skillAssessments).find((item) => item.id === assessmentId);
    if (!existing) throw new Error("Assessment not found.");
    return this.createSkillAssessment({ ...toSkillAssessment(existing), ...updates, id: assessmentId, createdAt: existing.created_at }, account);
  },

  async getProgrammeAssessments(programmeId, organizationId) {
    if (!programmeId) return [];
    return readLocalCollection(STORAGE_KEYS.skillAssessments).map(toSkillAssessment).filter((item) => item.programmeId === programmeId && (!organizationId || item.organizationId === organizationId)).sort((a, b) => new Date(b.assessmentDate || 0) - new Date(a.assessmentDate || 0));
  },

  async getWorkerAssessments(workerProfileId) {
    if (!workerProfileId) return [];
    return readLocalCollection(STORAGE_KEYS.skillAssessments).map(toSkillAssessment).filter((item) => item.workerProfileId === workerProfileId);
  },

  async reviewTrainingCompletion(enrollmentId) {
    const enrollment = readLocalCollection(STORAGE_KEYS.programmeEnrollments).map(toProgrammeEnrollment).find((item) => item.id === enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found.");
    const programme = await this.getTrainingProgrammeById(enrollment.programmeId, enrollment.organizationId);
    const assessments = await this.getProgrammeAssessments(enrollment.programmeId, enrollment.organizationId);
    const workerAssessments = assessments.filter((item) => item.enrollmentId === enrollmentId);
    const assessmentPassed = !programme.assessmentRequired || workerAssessments.some((item) => ["passed", "exempted"].includes(item.resultStatus));
    const attendancePassed = enrollment.attendancePercentage >= programme.minimumAttendancePercentage;
    return {
      enrollment,
      programme,
      attendancePassed,
      assessmentPassed,
      eligible: attendancePassed && assessmentPassed,
      outstanding: [
        !attendancePassed && `Attendance is below ${programme.minimumAttendancePercentage}%.`,
        !assessmentPassed && "Required assessment is not passed."
      ].filter(Boolean)
    };
  },

  async markTrainingComplete(enrollmentId, { overrideReason = "", jobReadinessStatus = "developing" } = {}, account) {
    const review = await this.reviewTrainingCompletion(enrollmentId);
    if (!review.eligible && !overrideReason.trim()) throw new Error("Completion requirements are missing. Add an override reason.");
    const enrollment = await this.updateProgrammeEnrollment(enrollmentId, { enrollmentStatus: "completed", completionStatus: "completed", completionPercentage: 100, jobReadinessStatus, completedAt: new Date().toISOString() }, account);
    await this.logTrainingActivity({ organizationId: enrollment.organizationId, programmeId: enrollment.programmeId, enrollmentId, workerProfileId: enrollment.workerProfileId, actorAccountId: accountUserId(account), activityType: "training_completed", description: "Worker training was marked complete.", metadata: { overrideReason, jobReadinessStatus } });
    return enrollment;
  },

  async updateJobReadiness(enrollmentId, jobReadinessStatus, reason, account) {
    if (["job_ready", "highly_ready"].includes(jobReadinessStatus) && !reason?.trim()) throw new Error("A reason is required when marking a worker job-ready.");
    const enrollment = await this.updateProgrammeEnrollment(enrollmentId, { jobReadinessStatus }, account);
    await this.logTrainingActivity({ organizationId: enrollment.organizationId, programmeId: enrollment.programmeId, enrollmentId, workerProfileId: enrollment.workerProfileId, actorAccountId: accountUserId(account), activityType: "job_readiness_updated", description: "Worker job-readiness status was updated.", metadata: { jobReadinessStatus, reason } });
    return enrollment;
  },

  async issueWorkerCertificate(payload, account) {
    if (!payload.organizationId || !payload.workerProfileId || !payload.certificateTitle || !payload.certificateNumber) throw new Error("Certificate details are required.");
    const existing = readLocalCollection(STORAGE_KEYS.workerCertificates).map(toWorkerCertificate).find((item) => item.certificateNumber === payload.certificateNumber);
    if (existing && existing.id !== payload.id) throw new Error("Certificate number already exists.");
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("certificate"),
      organization_id: payload.organizationId,
      programme_id: payload.programmeId || null,
      enrollment_id: payload.enrollmentId || null,
      worker_profile_id: payload.workerProfileId,
      certificate_number: payload.certificateNumber,
      certificate_title: payload.certificateTitle,
      skill_name: payload.skillName || "",
      issue_date: payload.issueDate || new Date().toISOString().slice(0, 10),
      expiry_date: payload.expiryDate || null,
      credential_url: payload.credentialUrl || "",
      certificate_file_url: payload.certificateFileUrl || "",
      verification_status: payload.verificationStatus || "issued",
      verification_method: payload.verificationMethod || "organization_issued",
      share_with_employers: Boolean(payload.shareWithEmployers),
      verified_by_account_id: null,
      verified_at: null,
      revoked_at: null,
      revocation_reason: "",
      metadata: payload.metadata || {},
      created_at: payload.createdAt || now,
      updated_at: now
    };
    const certificate = toWorkerCertificate(upsertLocalCollection(STORAGE_KEYS.workerCertificates, row));
    await this.logTrainingActivity({ organizationId: certificate.organizationId, programmeId: certificate.programmeId, enrollmentId: certificate.enrollmentId, workerProfileId: certificate.workerProfileId, actorAccountId: accountUserId(account), activityType: "certificate_issued", description: `Certificate "${certificate.certificateTitle}" was issued.`, metadata: { certificateId: certificate.id, verificationStatus: certificate.verificationStatus } });
    return certificate;
  },

  async getOrganizationCertificates(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.workerCertificates).map(toWorkerCertificate).filter((item) => item.organizationId === organizationId).sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0));
  },

  async getWorkerCertificates(workerProfileId) {
    if (!workerProfileId) return [];
    return readLocalCollection(STORAGE_KEYS.workerCertificates).map(toWorkerCertificate).filter((item) => item.workerProfileId === workerProfileId);
  },

  async getCertificateById(certificateId, organizationId = "") {
    const certificate = readLocalCollection(STORAGE_KEYS.workerCertificates).map(toWorkerCertificate).find((item) => item.id === certificateId) || null;
    if (certificate && organizationId) assertOrganizationScope(certificate, organizationId);
    return certificate;
  },

  async verifyWorkerCertificate(certificateId, account, method = "organization_issued") {
    const rows = readLocalCollection(STORAGE_KEYS.workerCertificates);
    const existing = rows.find((item) => item.id === certificateId);
    if (!existing) throw new Error("Certificate not found.");
    const row = { ...existing, verification_status: "verified", verification_method: method, verified_by_account_id: accountUserId(account), verified_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    const certificate = toWorkerCertificate(upsertLocalCollection(STORAGE_KEYS.workerCertificates, row));
    await this.logTrainingActivity({ organizationId: certificate.organizationId, programmeId: certificate.programmeId, enrollmentId: certificate.enrollmentId, workerProfileId: certificate.workerProfileId, actorAccountId: accountUserId(account), activityType: "certificate_verified", description: `Certificate "${certificate.certificateTitle}" was verified.`, metadata: { certificateId } });
    return certificate;
  },

  async rejectWorkerCertificate(certificateId, reason, account) {
    if (!reason?.trim()) throw new Error("Rejection reason is required.");
    const rows = readLocalCollection(STORAGE_KEYS.workerCertificates);
    const existing = rows.find((item) => item.id === certificateId);
    if (!existing) throw new Error("Certificate not found.");
    const certificate = toWorkerCertificate(upsertLocalCollection(STORAGE_KEYS.workerCertificates, { ...existing, verification_status: "rejected", metadata: { ...(existing.metadata || {}), rejectionReason: reason }, updated_at: new Date().toISOString() }));
    await this.logTrainingActivity({ organizationId: certificate.organizationId, programmeId: certificate.programmeId, enrollmentId: certificate.enrollmentId, workerProfileId: certificate.workerProfileId, actorAccountId: accountUserId(account), activityType: "certificate_rejected", description: `Certificate "${certificate.certificateTitle}" was rejected.`, metadata: { reason } });
    return certificate;
  },

  async revokeWorkerCertificate(certificateId, reason, account) {
    if (!reason?.trim()) throw new Error("Revocation reason is required.");
    const rows = readLocalCollection(STORAGE_KEYS.workerCertificates);
    const existing = rows.find((item) => item.id === certificateId);
    if (!existing) throw new Error("Certificate not found.");
    const certificate = toWorkerCertificate(upsertLocalCollection(STORAGE_KEYS.workerCertificates, { ...existing, verification_status: "revoked", revoked_at: new Date().toISOString(), revocation_reason: reason, updated_at: new Date().toISOString() }));
    await this.logTrainingActivity({ organizationId: certificate.organizationId, programmeId: certificate.programmeId, enrollmentId: certificate.enrollmentId, workerProfileId: certificate.workerProfileId, actorAccountId: accountUserId(account), activityType: "certificate_revoked", description: `Certificate "${certificate.certificateTitle}" was revoked.`, metadata: { reason } });
    return certificate;
  },

  async getTrainingDashboardStats(organizationId) {
    const [programmes, certificates] = await Promise.all([
      this.getOrganizationTrainingProgrammes(organizationId, { includeArchived: true }),
      this.getOrganizationCertificates(organizationId)
    ]);
    const enrollmentLists = await Promise.all(programmes.map((programme) => this.getProgrammeEnrollments(programme.id, organizationId)));
    const enrollments = enrollmentLists.flat();
    const activeProgrammes = programmes.filter((item) => ["upcoming", "active"].includes(item.status)).length;
    const activeEnrollments = enrollments.filter((item) => ["enrolled", "in_progress"].includes(item.enrollmentStatus)).length;
    const completedEnrollments = enrollments.filter((item) => item.completionStatus === "completed").length;
    const attendanceAverage = enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + Number(item.attendancePercentage || 0), 0) / enrollments.length) : 0;
    const assessments = (await Promise.all(programmes.map((programme) => this.getProgrammeAssessments(programme.id, organizationId)))).flat();
    const assessed = assessments.filter((item) => item.resultStatus !== "pending");
    return {
      totalProgrammes: programmes.length,
      activeProgrammes,
      workersInTraining: activeEnrollments,
      trainingCompleted: completedEnrollments,
      completionRate: calculatePercentage(completedEnrollments, enrollments.length),
      averageAttendance: attendanceAverage,
      assessmentPassRate: calculatePercentage(assessed.filter((item) => item.resultStatus === "passed").length, assessed.length),
      jobReadyWorkers: enrollments.filter((item) => ["job_ready", "highly_ready"].includes(item.jobReadinessStatus)).length,
      certificatesIssued: certificates.length,
      certificatesVerified: certificates.filter((item) => item.verificationStatus === "verified").length,
      certificatesPendingVerification: certificates.filter((item) => ["issued", "pending_verification"].includes(item.verificationStatus)).length
    };
  },

  async logPlacementActivity({ organizationId, workerProfileId = "", jobId = "", recommendationId = "", placementId = "", interviewId = "", actorAccountId = "", activityType, description, metadata = {} }) {
    if (!organizationId || !activityType || !description) throw new Error("Placement activity is incomplete.");
    const row = {
      id: createId("placement-activity"),
      organization_id: organizationId,
      worker_profile_id: workerProfileId,
      job_id: jobId,
      recommendation_id: recommendationId,
      placement_id: placementId,
      interview_id: interviewId,
      actor_account_id: actorAccountId,
      activity_type: activityType,
      description,
      metadata,
      created_at: new Date().toISOString()
    };
    return toPlacementActivity(upsertLocalCollection(STORAGE_KEYS.placementActivityLogs, row));
  },

  async getPlacementActivity({ organizationId, placementId = "", workerProfileId = "" }) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.placementActivityLogs)
      .map(toPlacementActivity)
      .filter((activity) => activity.organizationId === organizationId)
      .filter((activity) => !placementId || activity.placementId === placementId)
      .filter((activity) => !workerProfileId || activity.workerProfileId === workerProfileId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  async createNgoJobOpportunity(payload, account) {
    if (!payload.title?.trim()) throw new Error("Job title is required.");
    if (!payload.employerProfileId) throw new Error("Employer is required.");
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("job"),
      employer_account_id: payload.employerAccountId || "",
      employer_profile_id: payload.employerProfileId,
      employer_name: payload.employerName || "Employer",
      title: payload.title,
      job_code: payload.jobCode || `JOB-${Date.now().toString().slice(-5)}`,
      description: payload.description || "",
      skill_sector: payload.skillSector || payload.primarySkill || "",
      required_skills: parseList(payload.requiredSkills || payload.skillSector || payload.primarySkill),
      preferred_skills: parseList(payload.preferredSkills),
      location_city: payload.locationCity || "",
      location_state: payload.locationState || "",
      work_location_type: payload.workLocationType || "on_site",
      employment_type: payload.employmentType || "full_time",
      shift_type: payload.shiftType || "day",
      minimum_experience_years: Number(payload.minimumExperienceYears || 0),
      maximum_experience_years: Number(payload.maximumExperienceYears || 0),
      salary_min: Number(payload.salaryMin || 0),
      salary_max: Number(payload.salaryMax || 0),
      salary_period: payload.salaryPeriod || "month",
      open_positions: Number(payload.openPositions || 1),
      filled_positions: Number(payload.filledPositions || 0),
      application_deadline: payload.applicationDeadline || "",
      joining_date: payload.joiningDate || "",
      accommodation_available: Boolean(payload.accommodationAvailable),
      meals_available: Boolean(payload.mealsAvailable),
      transport_available: Boolean(payload.transportAvailable),
      gender_preference: payload.genderPreference || "",
      verification_status: payload.verificationStatus || "pending",
      status: payload.status || "open",
      published_at: payload.publishedAt || now,
      created_at: payload.createdAt || now,
      updated_at: now,
      closed_at: payload.closedAt || null
    };
    const job = toJobOpportunity(upsertLocalCollection(STORAGE_KEYS.employerJobOpportunities, row));
    await this.updateEmployerOrganizationConnection({
      organizationId: payload.organizationId,
      employerProfileId: job.employerProfileId,
      employerName: job.employerName,
      industry: job.skillSector,
      locationCity: job.locationCity,
      verificationStatus: job.verificationStatus,
      connectionStatus: "active"
    }, account);
    return job;
  },

  async getNgoJobOpportunities(organizationId, filters = {}) {
    const jobs = readLocalCollection(STORAGE_KEYS.employerJobOpportunities).map(toJobOpportunity);
    const recommendations = await this.getOrganizationRecommendations(organizationId);
    const recommendationJobIds = new Set(recommendations.map((item) => item.jobId));
    return jobs
      .filter((job) => !filters.status || job.status === filters.status)
      .filter((job) => !filters.skill || [job.skillSector, ...job.requiredSkills, ...job.preferredSkills].join(" ").toLowerCase().includes(String(filters.skill).toLowerCase()))
      .filter((job) => !filters.location || job.locationCity === filters.location)
      .filter((job) => !filters.employmentType || job.employmentType === filters.employmentType)
      .map((job) => ({ ...job, recommendationsSent: recommendations.filter((item) => item.jobId === job.id).length, hasOrganizationActivity: recommendationJobIds.has(job.id) }))
      .sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
  },

  async getNgoJobById(jobId) {
    if (!jobId) return null;
    return readLocalCollection(STORAGE_KEYS.employerJobOpportunities).map(toJobOpportunity).find((job) => job.id === jobId) || null;
  },

  async getMatchingWorkersForJob({ organizationId, jobId }) {
    const [job, workers, certificates, programmes] = await Promise.all([
      this.getNgoJobById(jobId),
      this.getOrganizationWorkers(organizationId),
      this.getOrganizationCertificates(organizationId),
      this.getOrganizationTrainingProgrammes(organizationId, { includeArchived: true })
    ]);
    if (!job) return [];
    const enrollmentLists = await Promise.all(programmes.map((programme) => this.getProgrammeEnrollments(programme.id, organizationId)));
    const enrollments = enrollmentLists.flat();
    const recommendations = await this.getOrganizationRecommendations(organizationId);
    const activeWorkerIds = new Set(recommendations.filter((item) => item.jobId === jobId && !["not_selected", "withdrawn", "expired", "closed"].includes(item.recommendationStatus)).map((item) => item.workerProfileId));
    return workers
      .map((worker) => {
        const match = calculateWorkerJobMatch({ worker, job, certificates, enrollments });
        const eligible = worker.associationStatus === "linked" && worker.consentStatus === "granted" && worker.profileCompletion >= 55 && !activeWorkerIds.has(worker.workerProfileId);
        return {
          ...worker,
          match,
          eligible,
          eligibilityReason: eligible
            ? "Eligible to recommend"
            : activeWorkerIds.has(worker.workerProfileId)
              ? "Already actively recommended for this job"
              : worker.consentStatus !== "granted"
                ? "Worker sharing consent is required"
                : "Profile needs review before sharing"
        };
      })
      .sort((a, b) => b.match.score - a.match.score);
  },

  async createWorkerJobRecommendation({ organizationId, jobId, workerProfileId, organizationNote = "", internalNote = "", account }) {
    if (!organizationId || !jobId || !workerProfileId) throw new Error("Organization, job and worker are required.");
    const [job, worker] = await Promise.all([
      this.getNgoJobById(jobId),
      this.getOrganizationWorkerById(organizationId, workerProfileId)
    ]);
    if (!job || job.status !== "open") throw new Error("Only open jobs can receive recommendations.");
    if (!worker || worker.associationStatus !== "linked") throw new Error("Only linked organization workers can be recommended.");
    const existing = (await this.getOrganizationRecommendations(organizationId)).find((item) => item.jobId === jobId && item.workerProfileId === workerProfileId && !["not_selected", "withdrawn", "expired", "closed"].includes(item.recommendationStatus));
    if (existing) throw new Error("This worker already has an active recommendation for this job.");
    const match = (await this.getMatchingWorkersForJob({ organizationId, jobId })).find((item) => item.workerProfileId === workerProfileId)?.match || calculateWorkerJobMatch({ worker, job });
    const now = new Date().toISOString();
    const sharedFields = ["name", "workerId", "primarySkill", "city", "experience", "availability", "verifiedCredentials", "matchExplanation"];
    const row = {
      id: createId("recommendation"),
      organization_id: organizationId,
      job_id: jobId,
      worker_profile_id: workerProfileId,
      association_id: worker.association?.id || "",
      recommended_by_account_id: accountUserId(account),
      recommendation_status: worker.consentStatus === "granted" ? "submitted" : "worker_consent_pending",
      worker_consent_status: worker.consentStatus === "granted" ? "granted" : "pending",
      worker_consent_requested_at: now,
      worker_consent_granted_at: worker.consentStatus === "granted" ? now : null,
      profile_snapshot: {
        name: worker.name,
        workerId: worker.workerId,
        primarySkill: worker.primarySkill,
        city: worker.city,
        experience: worker.experience,
        availability: worker.availability,
        photoUrl: worker.photoUrl
      },
      shared_fields: sharedFields,
      match_score: match.score,
      match_explanation: match.explanation,
      match_factors: match,
      organization_note: organizationNote,
      internal_note: internalNote,
      worker_note: "",
      recommended_at: now,
      responded_at: null,
      withdrawn_at: null,
      created_at: now,
      updated_at: now
    };
    const recommendation = toRecommendation(upsertLocalCollection(STORAGE_KEYS.workerJobRecommendations, row));
    const placement = await this.createPlacementRecord({
      organizationId,
      jobId,
      workerProfileId,
      recommendationId: recommendation.id,
      employerProfileId: job.employerProfileId,
      placementStatus: recommendation.recommendationStatus,
      source: "ngo_recommendation"
    }, account);
    await this.logPlacementActivity({
      organizationId,
      workerProfileId,
      jobId,
      recommendationId: recommendation.id,
      placementId: placement.id,
      actorAccountId: accountUserId(account),
      activityType: "recommendation_created",
      description: `${worker.name || "Worker"} was recommended for ${job.title}.`,
      metadata: { sharedFields, matchScore: match.score }
    });
    return recommendation;
  },

  async getOrganizationRecommendations(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.workerJobRecommendations)
      .map(toRecommendation)
      .filter((recommendation) => recommendation.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  },

  async getWorkerOpportunityRequests(workerProfileId) {
    if (!workerProfileId) return [];
    return readLocalCollection(STORAGE_KEYS.workerJobRecommendations)
      .map(toRecommendation)
      .filter((recommendation) => recommendation.workerProfileId === workerProfileId)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  },

  async acceptJobRecommendationConsent(recommendationId, account) {
    const rows = readLocalCollection(STORAGE_KEYS.workerJobRecommendations);
    const existing = rows.find((item) => item.id === recommendationId);
    if (!existing) throw new Error("Recommendation not found.");
    const now = new Date().toISOString();
    const recommendation = toRecommendation(upsertLocalCollection(STORAGE_KEYS.workerJobRecommendations, {
      ...existing,
      recommendation_status: "submitted",
      worker_consent_status: "granted",
      worker_consent_granted_at: now,
      responded_at: now,
      updated_at: now
    }));
    await this.logPlacementActivity({ organizationId: recommendation.organizationId, workerProfileId: recommendation.workerProfileId, jobId: recommendation.jobId, recommendationId, actorAccountId: accountUserId(account), activityType: "worker_consent_granted", description: "Worker granted profile sharing consent for this opportunity." });
    return recommendation;
  },

  async declineJobRecommendationConsent(recommendationId, account) {
    const rows = readLocalCollection(STORAGE_KEYS.workerJobRecommendations);
    const existing = rows.find((item) => item.id === recommendationId);
    if (!existing) throw new Error("Recommendation not found.");
    const now = new Date().toISOString();
    const recommendation = toRecommendation(upsertLocalCollection(STORAGE_KEYS.workerJobRecommendations, {
      ...existing,
      recommendation_status: "withdrawn",
      worker_consent_status: "declined",
      responded_at: now,
      withdrawn_at: now,
      updated_at: now
    }));
    await this.logPlacementActivity({ organizationId: recommendation.organizationId, workerProfileId: recommendation.workerProfileId, jobId: recommendation.jobId, recommendationId, actorAccountId: accountUserId(account), activityType: "worker_consent_declined", description: "Worker declined sharing consent for this opportunity." });
    return recommendation;
  },

  async createPlacementRecord(payload, account) {
    if (!payload.organizationId || !payload.jobId || !payload.workerProfileId) throw new Error("Placement record is incomplete.");
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("placement"),
      organization_id: payload.organizationId,
      job_id: payload.jobId,
      worker_profile_id: payload.workerProfileId,
      recommendation_id: payload.recommendationId || "",
      employer_profile_id: payload.employerProfileId || "",
      placement_status: payload.placementStatus || "recommended",
      source: payload.source || "ngo_recommendation",
      selected_at: payload.selectedAt || null,
      offer_date: payload.offerDate || null,
      offered_salary: Number(payload.offeredSalary || 0),
      salary_period: payload.salaryPeriod || "month",
      joining_date: payload.joiningDate || null,
      actual_joining_date: payload.actualJoiningDate || null,
      employment_type: payload.employmentType || "",
      work_location: payload.workLocation || "",
      probation_end_date: payload.probationEndDate || null,
      employment_verified_by_employer: Boolean(payload.employmentVerifiedByEmployer),
      employment_verified_at: payload.employmentVerifiedAt || null,
      ended_at: payload.endedAt || null,
      end_reason: payload.endReason || "",
      created_by_account_id: accountUserId(account),
      created_at: payload.createdAt || now,
      updated_at: now
    };
    return toPlacementRecord(upsertLocalCollection(
      STORAGE_KEYS.placementRecords,
      row,
      (item) => item.recommendation_id === row.recommendation_id && row.recommendation_id
    ));
  },

  async getOrganizationPlacements(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.placementRecords)
      .map(toPlacementRecord)
      .filter((placement) => placement.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  },

  async getPlacementById(placementId, organizationId = "") {
    const placement = readLocalCollection(STORAGE_KEYS.placementRecords).map(toPlacementRecord).find((item) => item.id === placementId) || null;
    if (placement && organizationId) assertOrganizationScope(placement, organizationId);
    return placement;
  },

  async updatePlacementStatus({ placementId, organizationId, newStatus, reason = "", account }) {
    const rows = readLocalCollection(STORAGE_KEYS.placementRecords);
    const existing = rows.find((item) => item.id === placementId);
    if (!existing) throw new Error("Placement not found.");
    const placement = toPlacementRecord(existing);
    assertOrganizationScope(placement, organizationId);
    const allowed = placementTransitions[placement.placementStatus] || [];
    if (!allowed.includes(newStatus) && newStatus !== placement.placementStatus) throw new Error(`Cannot move from ${placement.placementStatus} to ${newStatus}.`);
    if (["not_selected", "withdrawn", "not_joined", "left_job"].includes(newStatus) && !reason.trim()) throw new Error("A reason is required for this status change.");
    const now = new Date().toISOString();
    const updated = toPlacementRecord(upsertLocalCollection(STORAGE_KEYS.placementRecords, { ...existing, placement_status: newStatus, updated_at: now }));
    upsertLocalCollection(STORAGE_KEYS.placementStatusHistory, {
      id: createId("placement-history"),
      placement_id: placementId,
      organization_id: organizationId,
      job_id: placement.jobId,
      worker_profile_id: placement.workerProfileId,
      previous_status: placement.placementStatus,
      new_status: newStatus,
      changed_by_account_id: accountUserId(account),
      change_reason: reason,
      metadata: {},
      created_at: now
    });
    await this.logPlacementActivity({ organizationId, workerProfileId: placement.workerProfileId, jobId: placement.jobId, placementId, recommendationId: placement.recommendationId, actorAccountId: accountUserId(account), activityType: "placement_status_changed", description: `Placement moved to ${newStatus.replace(/_/g, " ")}.`, metadata: { previousStatus: placement.placementStatus, newStatus, reason } });
    return updated;
  },

  async getPlacementStatusHistory(placementId, organizationId = "") {
    return readLocalCollection(STORAGE_KEYS.placementStatusHistory)
      .filter((row) => row.placement_id === placementId)
      .filter((row) => !organizationId || row.organization_id === organizationId)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  async createInterview(payload, account) {
    if (!payload.organizationId || !payload.jobId || !payload.workerProfileId || !payload.scheduledDate) throw new Error("Interview schedule is incomplete.");
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("interview"),
      organization_id: payload.organizationId,
      job_id: payload.jobId,
      worker_profile_id: payload.workerProfileId,
      recommendation_id: payload.recommendationId || "",
      placement_id: payload.placementId || "",
      employer_profile_id: payload.employerProfileId || "",
      interview_type: payload.interviewType || "phone",
      scheduled_date: payload.scheduledDate,
      start_time: payload.startTime || "",
      end_time: payload.endTime || "",
      location: payload.location || "",
      meeting_link: payload.meetingLink || "",
      contact_person: payload.contactPerson || "",
      status: payload.status || "scheduled",
      worker_confirmed: Boolean(payload.workerConfirmed),
      employer_confirmed: Boolean(payload.employerConfirmed),
      outcome: payload.outcome || "pending",
      feedback_summary: payload.feedbackSummary || "",
      created_by_account_id: accountUserId(account),
      created_at: payload.createdAt || now,
      updated_at: now,
      completed_at: payload.completedAt || null
    };
    const interview = toInterviewRecord(upsertLocalCollection(STORAGE_KEYS.interviewRecords, row));
    await this.logPlacementActivity({ organizationId: interview.organizationId, workerProfileId: interview.workerProfileId, jobId: interview.jobId, placementId: interview.placementId, recommendationId: interview.recommendationId, interviewId: interview.id, actorAccountId: accountUserId(account), activityType: "interview_scheduled", description: "Interview was scheduled.", metadata: { scheduledDate: interview.scheduledDate, startTime: interview.startTime } });
    return interview;
  },

  async updateInterview(interviewId, updates, account) {
    const existing = readLocalCollection(STORAGE_KEYS.interviewRecords).find((item) => item.id === interviewId);
    if (!existing) throw new Error("Interview not found.");
    const interview = toInterviewRecord(upsertLocalCollection(STORAGE_KEYS.interviewRecords, { ...existing, ...updates, updated_at: new Date().toISOString() }));
    await this.logPlacementActivity({ organizationId: interview.organizationId, workerProfileId: interview.workerProfileId, jobId: interview.jobId, placementId: interview.placementId, recommendationId: interview.recommendationId, interviewId: interview.id, actorAccountId: accountUserId(account), activityType: "interview_updated", description: "Interview was updated." });
    return interview;
  },

  async getOrganizationInterviews(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.interviewRecords).map(toInterviewRecord).filter((interview) => interview.organizationId === organizationId).sort((a, b) => new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0));
  },

  async createPlacementFollowUp(payload, account) {
    if (!payload.organizationId || !payload.placementId || !payload.workerProfileId || !payload.scheduledFor) throw new Error("Follow-up details are required.");
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("follow-up"),
      organization_id: payload.organizationId,
      placement_id: payload.placementId,
      worker_profile_id: payload.workerProfileId,
      employer_profile_id: payload.employerProfileId || "",
      follow_up_type: payload.followUpType || "custom",
      scheduled_for: payload.scheduledFor,
      completed_at: payload.completedAt || null,
      status: payload.status || "scheduled",
      worker_status: payload.workerStatus || "",
      employment_status: payload.employmentStatus || "",
      salary_confirmed: Boolean(payload.salaryConfirmed),
      salary_amount: Number(payload.salaryAmount || 0),
      salary_period: payload.salaryPeriod || "month",
      worker_satisfaction: payload.workerSatisfaction || "",
      employer_satisfaction: payload.employerSatisfaction || "",
      issue_category: payload.issueCategory || "none",
      notes: payload.notes || "",
      next_action: payload.nextAction || "",
      created_by_account_id: accountUserId(account),
      created_at: payload.createdAt || now,
      updated_at: now
    };
    return toPlacementFollowUp(upsertLocalCollection(STORAGE_KEYS.placementFollowUps, row));
  },

  async getPlacementFollowUps(organizationId) {
    if (!organizationId) return [];
    return readLocalCollection(STORAGE_KEYS.placementFollowUps).map(toPlacementFollowUp).filter((item) => item.organizationId === organizationId).sort((a, b) => new Date(a.scheduledFor || 0) - new Date(b.scheduledFor || 0));
  },

  async completePlacementFollowUp(followUpId, updates, account) {
    const existing = readLocalCollection(STORAGE_KEYS.placementFollowUps).find((item) => item.id === followUpId);
    if (!existing) throw new Error("Follow-up not found.");
    const followUp = toPlacementFollowUp(upsertLocalCollection(STORAGE_KEYS.placementFollowUps, { ...existing, ...updates, status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
    await this.logPlacementActivity({ organizationId: followUp.organizationId, workerProfileId: followUp.workerProfileId, placementId: followUp.placementId, actorAccountId: accountUserId(account), activityType: "follow_up_completed", description: "Placement follow-up was completed.", metadata: { issueCategory: followUp.issueCategory } });
    return followUp;
  },

  async getDuePlacementFollowUps(organizationId) {
    const today = new Date().toISOString().slice(0, 10);
    return (await this.getPlacementFollowUps(organizationId)).filter((item) => ["scheduled", "due"].includes(item.status) && item.scheduledFor <= today);
  },

  async updateEmployerOrganizationConnection(payload, account) {
    if (!payload.organizationId || !payload.employerProfileId) return null;
    const now = new Date().toISOString();
    const row = {
      id: payload.id || createId("employer-connection"),
      organization_id: payload.organizationId,
      employer_profile_id: payload.employerProfileId,
      employer_name: payload.employerName || "Employer",
      industry: payload.industry || "",
      location_city: payload.locationCity || "",
      verification_status: payload.verificationStatus || "unverified",
      connection_status: payload.connectionStatus || "prospect",
      first_contacted_at: payload.firstContactedAt || now,
      connected_at: payload.connectedAt || (["connected", "active"].includes(payload.connectionStatus) ? now : null),
      last_activity_at: now,
      relationship_owner_account_id: payload.relationshipOwnerAccountId || accountUserId(account),
      notes: payload.notes || "",
      created_at: payload.createdAt || now,
      updated_at: now
    };
    return toEmployerConnection(upsertLocalCollection(STORAGE_KEYS.employerOrganizationConnections, row, (item) => item.organization_id === row.organization_id && item.employer_profile_id === row.employer_profile_id));
  },

  async getOrganizationEmployers(organizationId) {
    if (!organizationId) return [];
    const [connections, jobs, recommendations, placements] = await Promise.all([
      Promise.resolve(readLocalCollection(STORAGE_KEYS.employerOrganizationConnections).map(toEmployerConnection).filter((item) => item.organizationId === organizationId)),
      this.getNgoJobOpportunities(organizationId),
      this.getOrganizationRecommendations(organizationId),
      this.getOrganizationPlacements(organizationId)
    ]);
    const byEmployer = new Map(connections.map((item) => [item.employerProfileId, item]));
    jobs.forEach((job) => {
      if (!byEmployer.has(job.employerProfileId)) byEmployer.set(job.employerProfileId, toEmployerConnection({ id: `derived-${job.employerProfileId}`, organization_id: organizationId, employer_profile_id: job.employerProfileId, employer_name: job.employerName, industry: job.skillSector, location_city: job.locationCity, verification_status: job.verificationStatus, connection_status: "prospect", created_at: job.createdAt, updated_at: job.updatedAt }));
    });
    return [...byEmployer.values()].map((employer) => {
      const employerJobs = jobs.filter((job) => job.employerProfileId === employer.employerProfileId);
      const employerJobIds = new Set(employerJobs.map((job) => job.id));
      const employerRecommendations = recommendations.filter((item) => employerJobIds.has(item.jobId));
      const employerPlacements = placements.filter((item) => item.employerProfileId === employer.employerProfileId);
      return {
        ...employer,
        activeOpenings: employerJobs.filter((job) => job.status === "open").length,
        recommendationsSent: employerRecommendations.length,
        workersShortlisted: employerPlacements.filter((item) => ["shortlisted", "interview_requested", "interview_scheduled", "selected", "joined", "employed"].includes(item.placementStatus)).length,
        workersHired: employerPlacements.filter((item) => ["joined", "employed", "completed"].includes(item.placementStatus)).length
      };
    }).sort((a, b) => new Date(b.lastActivityAt || b.updatedAt || 0) - new Date(a.lastActivityAt || a.updatedAt || 0));
  },

  async getOrganizationEmployerById(organizationId, employerProfileId) {
    return (await this.getOrganizationEmployers(organizationId)).find((employer) => employer.employerProfileId === employerProfileId || employer.id === employerProfileId) || null;
  },

  async getPlacementDashboardStats(organizationId) {
    const [jobs, recommendations, placements, interviews, followUps, employers] = await Promise.all([
      this.getNgoJobOpportunities(organizationId),
      this.getOrganizationRecommendations(organizationId),
      this.getOrganizationPlacements(organizationId),
      this.getOrganizationInterviews(organizationId),
      this.getPlacementFollowUps(organizationId),
      this.getOrganizationEmployers(organizationId)
    ]);
    const activeRecommendations = recommendations.filter((item) => !["not_selected", "withdrawn", "expired", "closed", "joined"].includes(item.recommendationStatus)).length;
    const joined = placements.filter((item) => ["joined", "employed", "completed"].includes(item.placementStatus)).length;
    const dueFollowUps = followUps.filter((item) => ["scheduled", "due"].includes(item.status) && item.scheduledFor <= new Date().toISOString().slice(0, 10)).length;
    return {
      openOpportunities: jobs.filter((job) => job.status === "open").length,
      totalOpenPositions: jobs.reduce((sum, job) => sum + Math.max(0, job.openPositions - job.filledPositions), 0),
      verifiedEmployers: employers.filter((item) => item.verificationStatus === "verified").length,
      activeEmployers: employers.filter((item) => ["connected", "active"].includes(item.connectionStatus)).length,
      recommendationsSent: recommendations.length,
      activeRecommendations,
      workersAwaitingResponse: recommendations.filter((item) => item.workerConsentStatus === "pending" || ["submitted", "employer_viewed"].includes(item.recommendationStatus)).length,
      interviewsScheduled: interviews.filter((item) => ["scheduled", "confirmed"].includes(item.status)).length,
      workersSelected: placements.filter((item) => ["selected", "offer_made", "offer_accepted"].includes(item.placementStatus)).length,
      workersJoined: joined,
      followUpsDue: dueFollowUps,
      placementRate: calculatePercentage(joined, recommendations.length),
      stageCounts: placements.reduce((acc, placement) => ({ ...acc, [placement.placementStatus]: (acc[placement.placementStatus] || 0) + 1 }), {})
    };
  },

  async getPlacementAnalytics(organizationId) {
    const stats = await this.getPlacementDashboardStats(organizationId);
    const placements = await this.getOrganizationPlacements(organizationId);
    const recommendations = await this.getOrganizationRecommendations(organizationId);
    const selected = placements.filter((item) => ["selected", "offer_made", "offer_accepted", "joined", "employed", "completed"].includes(item.placementStatus)).length;
    return {
      ...stats,
      recommendationToShortlistRate: calculatePercentage(placements.filter((item) => ["shortlisted", "interview_requested", "interview_scheduled", "selected", "joined", "employed"].includes(item.placementStatus)).length, recommendations.length),
      shortlistToInterviewRate: calculatePercentage(placements.filter((item) => ["interview_requested", "interview_scheduled", "selected", "joined", "employed"].includes(item.placementStatus)).length, placements.filter((item) => ["shortlisted", "interview_requested", "interview_scheduled", "selected", "joined", "employed"].includes(item.placementStatus)).length),
      selectionToJoiningRate: calculatePercentage(stats.workersJoined, selected),
      retention90DayLabel: stats.workersJoined ? "90-day retention is not yet available until placements reach 90 days." : "No joined placements yet."
    };
  },

  async getImpactData() {
    const fallbackImpact = () => readJson(STORAGE_KEYS.impact, {
      workersRegistered: 0,
      employersActive: 0,
      ngoPrograms: 0,
      savedWorkers: readJson(STORAGE_KEYS.employerSavedWorkers, []).length
    });

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("rozgaar_impact_metrics?select=*&limit=1", {
          method: "GET"
        });
        return rows?.[0]?.payload || fallbackImpact();
      },
      fallbackImpact
    );
  }
};
