import ashaWorkerPhoto from "../assets/workers/asha-kumari-domestic-worker.jpg";
import imranWorkerPhoto from "../assets/workers/imran-khan-electrician.jpg";
import rameshWorkerPhoto from "../assets/workers/ramesh-patel-plumber.jpg";
import rekhaWorkerPhoto from "../assets/workers/rekha-devi-tailor.jpg";
import sanjayWorkerPhoto from "../assets/workers/sanjay-verma-driver.jpg";

export const ngoTeamMembers = [
  {
    id: "team-priya-sharma",
    name: "Priya Sharma",
    role: "Programme Manager",
    department: "Training & Development",
    email: "priya.sharma@rozgaarngo.org",
    status: "Active",
    lastActive: "12 mins ago",
    avatar: ashaWorkerPhoto
  },
  {
    id: "team-rahul-verma",
    name: "Rahul Verma",
    role: "Trainer",
    department: "Skill Development",
    email: "rahul.verma@rozgaarngo.org",
    status: "Active",
    lastActive: "28 mins ago",
    avatar: imranWorkerPhoto
  },
  {
    id: "team-anjali-patel",
    name: "Anjali Patel",
    role: "Coordinator",
    department: "Community Outreach",
    email: "anjali.patel@rozgaarngo.org",
    status: "Active",
    lastActive: "1 hour ago",
    avatar: rekhaWorkerPhoto
  },
  {
    id: "team-amit-singh",
    name: "Amit Singh",
    role: "Data Analyst",
    department: "Reports & Analytics",
    email: "amit.singh@rozgaarngo.org",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: rameshWorkerPhoto
  },
  {
    id: "team-neha-gupta",
    name: "Neha Gupta",
    role: "HR Manager",
    department: "Human Resources",
    email: "neha.gupta@rozgaarngo.org",
    status: "Away",
    lastActive: "3 hours ago",
    avatar: sanjayWorkerPhoto
  }
];

export const ngoRoleDistribution = [
  { name: "Admin", count: 3, percent: 7, color: "#2f65f5" },
  { name: "Programme Managers", count: 10, percent: 24, color: "#19b86a" },
  { name: "Trainers", count: 14, percent: 33, color: "#2f80ed" },
  { name: "Coordinators", count: 8, percent: 19, color: "#7b61ff" },
  { name: "Data Analysts", count: 4, percent: 10, color: "#e65aa5" },
  { name: "Others", count: 3, percent: 7, color: "#7c5ce6" }
];

export const ngoRecentActivity = [
  { id: "activity-1", actor: "Rahul Verma", action: "created new programme", time: "2 mins ago", tone: "green" },
  { id: "activity-2", actor: "Priya Sharma", action: "verified 18 certificates", time: "15 mins ago", tone: "emerald" },
  { id: "activity-3", actor: "Anjali Patel", action: "added 24 new workers", time: "1 hour ago", tone: "blue" },
  { id: "activity-4", actor: "Amit Singh", action: "exported monthly report", time: "2 hours ago", tone: "purple" },
  { id: "activity-5", actor: "6 invitations", action: "accepted today", time: "3 hours ago", tone: "orange" }
];

export const ngoPendingInvitations = [
  { id: "invite-suresh", email: "suresh.kumar@email.com", role: "Trainer", invitedAt: "Invited 2 days ago", resentAt: "" },
  { id: "invite-meena", email: "meena.joshi@email.com", role: "Coordinator", invitedAt: "Invited 3 days ago", resentAt: "" }
];

export const ngoPermissionGroups = [
  {
    title: "Programme Management",
    permissions: ["Create Programmes", "Edit Programmes", "Delete Programmes", "View Reports"]
  },
  {
    title: "Worker Management",
    permissions: ["Add Workers", "Edit Worker Profiles", "Verify Workers", "Assign Programmes"]
  },
  {
    title: "Certificates",
    permissions: ["Issue Certificates", "Verify Certificates", "Revoke Certificates"]
  }
];

export const ngoPerformanceMetrics = [
  { label: "Programmes Completed", value: 92, color: "#19b86a" },
  { label: "Worker Satisfaction", value: 96, color: "#22c55e" },
  { label: "Training Success", value: 89, color: "#ff7043" },
  { label: "Attendance Rate", value: 94, color: "#7b61ff" }
];
