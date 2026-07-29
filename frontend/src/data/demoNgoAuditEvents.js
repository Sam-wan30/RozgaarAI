import ashaWorkerPhoto from "../assets/workers/asha-kumari-domestic-worker.jpg";
import imranWorkerPhoto from "../assets/workers/imran-khan-electrician.jpg";
import rameshWorkerPhoto from "../assets/workers/ramesh-patel-plumber.jpg";
import rekhaWorkerPhoto from "../assets/workers/rekha-devi-tailor.jpg";
import sanjayWorkerPhoto from "../assets/workers/sanjay-verma-driver.jpg";

const workers = [
  { name: "Asha Kumari", occupation: "Domestic Worker", avatar: ashaWorkerPhoto, program: "Rozgaar Basic Batch 1" },
  { name: "Ramesh Patel", occupation: "Plumber", avatar: rameshWorkerPhoto, program: "Plumbing Batch - June" },
  { name: "Rekha Devi", occupation: "Tailor", avatar: rekhaWorkerPhoto, program: "Tailoring Batch - July" },
  { name: "Imran Khan", occupation: "Electrician", avatar: imranWorkerPhoto, program: "Electrical Batch - July" },
  { name: "Sanjay Verma", occupation: "Driver", avatar: sanjayWorkerPhoto, program: "Driving Batch - May" }
];

const programs = [
  "Rozgaar Basic Batch 1",
  "Plumbing Batch - June",
  "Tailoring Batch - July",
  "Electrical Batch - July",
  "Driving Batch - May",
  "Domestic Worker Safety Program",
  "Digital Skills Foundation",
  "Workplace Readiness Program"
];

const actors = [
  { name: "Ritu Sharma", role: "NGO Staff" },
  { name: "Amit Verma", role: "NGO Trainer" },
  { name: "Neha Singh", role: "NGO Staff" },
  { name: "Kavita Rao", role: "Program Manager" },
  { name: "Rajesh Kumar", role: "Placement Coordinator" },
  { name: "System", role: "Auto Process" },
  { name: "AI Engine", role: "RozgaarAI" },
  { name: "Urban Company", role: "Employer" },
  { name: "Smart Facility Services", role: "Employer" }
];

const eventTemplates = [
  ["Consent Captured", "Worker", "accepted Digital Worker Card consent.", "Success"],
  ["Worker Registered", "Worker", "completed assisted worker registration.", "Success"],
  ["Worker Profile Updated", "Worker", "updated work history and identity details.", "Success"],
  ["Training Assigned", "Training", "was assigned to a training programme.", "Success"],
  ["Training Started", "Training", "started the assigned training programme.", "Success"],
  ["Training Completed", "Training", "completed the training programme.", "Success"],
  ["Skill Assessment Completed", "Training", "completed the practical skill assessment.", "Success"],
  ["Certificate Generated", "Certificate", "certificate generated automatically.", "Success"],
  ["Certificate Issued", "Certificate", "certificate issued by programme admin.", "Success"],
  ["Certificate Downloaded", "Certificate", "downloaded a verified certificate.", "Success"],
  ["Skill Recommendation", "AI", "received an AI skill recommendation.", "Success"],
  ["Worker Recommended", "Placement", "recommended to an employer opening.", "Success"],
  ["Interview Scheduled", "Placement", "interview scheduled with employer.", "Pending"],
  ["Interview Feedback Submitted", "Placement", "interview feedback submitted.", "Success"],
  ["Placement Confirmed", "Placement", "placement confirmed by employer.", "Success"],
  ["Placement Follow-up Due", "Follow-up", "placement follow-up due in 7 days.", "Warning"],
  ["Wage Verification Completed", "Employer", "wage verification completed.", "Success"],
  ["Income Passport Updated", "System", "income passport updated with latest wage record.", "Success"],
  ["Digital Worker Card Generated", "System", "Digital Worker Card generated.", "Success"],
  ["Team Member Added", "System", "team member added to NGO workspace.", "Success"],
  ["Program Created", "Training", "new training programme created.", "Success"],
  ["Employer Access Granted", "Employer", "employer access granted after worker consent.", "Success"],
  ["Consent Revoked", "Worker", "revoked employer profile access.", "Warning"],
  ["Verification Pending", "System", "verification pending for submitted evidence.", "Pending"],
  ["Login Attempt Blocked", "Security", "suspicious login attempt blocked.", "Failed"]
];

const firstEvents = [
  {
    title: "Consent Captured",
    description: "Asha Kumari accepted Digital Worker Card consent.",
    category: "Worker",
    actor: actors[0],
    worker: workers[0],
    program: "Rozgaar Basic Batch 1",
    timestamp: "2026-07-29T09:42:00+05:30",
    status: "Success",
    source: "Worker",
    ipAddress: "103.21.45.67",
    device: "Mobile App (Android)",
    location: "New Delhi, India",
    referenceId: "CONS-2026-07-29-0942-001",
    additional: {
      "Consent Version": "v2.1",
      "Consent Type": "Digital Worker Card",
      Method: "In-App Consent"
    },
    timeline: [
      ["Consent Request Sent", "2026-07-29T09:40:00+05:30"],
      ["Consent Viewed", "2026-07-29T09:41:00+05:30"],
      ["Consent Accepted", "2026-07-29T09:42:00+05:30"]
    ]
  },
  {
    title: "Training Assigned",
    description: "Electrical Safety Level-1 assigned to Imran Khan.",
    category: "Training",
    actor: actors[1],
    worker: workers[3],
    program: "Electrical Batch - July",
    timestamp: "2026-07-28T16:18:00+05:30",
    status: "Success",
    source: "Training"
  },
  {
    title: "Placement Confirmed",
    description: "Ramesh Patel hired by Urban Company.",
    category: "Placement",
    actor: actors[2],
    worker: workers[1],
    program: "Plumbing Batch - June",
    timestamp: "2026-07-26T11:30:00+05:30",
    status: "Success",
    source: "Placement"
  },
  {
    title: "Certificate Generated",
    description: "Plumbing Level-2 certificate generated automatically.",
    category: "Certificate",
    actor: actors[5],
    worker: workers[1],
    program: "Plumbing Batch - June",
    timestamp: "2026-07-24T14:16:00+05:30",
    status: "Success",
    source: "Certificate"
  },
  {
    title: "Skill Recommendation",
    description: "AI recommended Hospitality Training for Rekha Devi.",
    category: "AI",
    actor: actors[6],
    worker: workers[2],
    program: "Tailoring Batch - July",
    timestamp: "2026-07-22T10:12:00+05:30",
    status: "Success",
    source: "AI"
  },
  {
    title: "Follow-up Due",
    description: "Placement follow-up due in 7 days.",
    category: "Follow-up",
    actor: { name: "System", role: "Reminder" },
    worker: workers[4],
    program: "Driving Batch - May",
    timestamp: "2026-07-21T17:45:00+05:30",
    status: "Warning",
    source: "Follow-up"
  },
  {
    title: "Digital Worker Card Generated",
    description: "Digital Worker Card created for Asha Kumari.",
    category: "System",
    actor: actors[5],
    worker: workers[0],
    program: "Rozgaar Basic Batch 1",
    timestamp: "2026-07-20T15:08:00+05:30",
    status: "Success",
    source: "System"
  }
];

function enrich(event, index) {
  const timestamp = event.timestamp || new Date(Date.parse("2026-07-20T12:00:00+05:30") - index * 142 * 60 * 1000).toISOString();
  return {
    id: `audit-${String(index + 1).padStart(3, "0")}`,
    ipAddress: event.ipAddress || `103.21.${45 + (index % 40)}.${67 + (index % 120)}`,
    device: event.device || (index % 3 === 0 ? "Web Dashboard (Chrome)" : index % 3 === 1 ? "Mobile App (Android)" : "Tablet App"),
    location: event.location || ["New Delhi, India", "Mumbai, India", "Jaipur, India", "Ahmedabad, India", "Bengaluru, India"][index % 5],
    referenceId: event.referenceId || `AUD-2026-${String(index + 1).padStart(4, "0")}`,
    additional: event.additional || {
      "Consent Version": index % 4 === 0 ? "v2.1" : "v2.0",
      Method: index % 2 === 0 ? "Workspace Action" : "Automated Rule",
      "Risk Level": event.status === "Failed" ? "High" : event.status === "Warning" ? "Medium" : "Low"
    },
    timeline: event.timeline || [
      ["Event Created", timestamp],
      ["Event Processed", new Date(Date.parse(timestamp) + 60 * 1000).toISOString()],
      ["Audit Record Saved", new Date(Date.parse(timestamp) + 120 * 1000).toISOString()]
    ],
    ...event,
    timestamp
  };
}

const generatedEvents = Array.from({ length: 421 }, (_, offset) => {
  const index = offset + firstEvents.length;
  const worker = workers[index % workers.length];
  const [title, category, suffix, status] = eventTemplates[index % eventTemplates.length];
  const actor = actors[index % actors.length];
  const program = programs[index % programs.length] || worker.program;
  const timestamp = new Date(Date.parse("2026-07-20T09:00:00+05:30") - offset * 150 * 60 * 1000).toISOString();
  return {
    title,
    description: `${worker.name} ${suffix}`,
    category,
    actor,
    worker,
    program,
    timestamp,
    status,
    source: category
  };
});

export const demoNgoAuditEvents = [...firstEvents, ...generatedEvents].map(enrich);
