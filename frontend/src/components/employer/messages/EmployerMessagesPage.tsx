import {
  Archive,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Filter,
  MapPin,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Sparkles,
  Star,
  User,
  Users,
  Video
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const demoConversations = [
  { id: "asha", workerName: "Asha Kumari", role: "Applied • Housekeeping", preview: "Hi, I’m interested in the Housekeeping role.", time: "2 min ago", unread: 1, workerId: "RZG-DEL-DOM-3210", status: "Active now" },
  { id: "ramesh", workerName: "Ramesh Patel", role: "Security Guard", preview: "Thank you! I’m available tomorrow.", time: "Yesterday", unread: 1, workerId: "RZG-BPL-PLM-1854", status: "Online" },
  { id: "imran", workerName: "Imran Khan", role: "Electrician", preview: "Please share more details about the role.", time: "Yesterday", unread: 0, workerId: "RZG-LKO-ELE-5522", status: "Online" },
  { id: "rekha", workerName: "Rekha Devi", role: "Tailor", preview: "I have 8 years of experience in stitching.", time: "2 days ago", unread: 0, workerId: "RZG-RPR-TLR-4421", status: "Away" },
  { id: "sanjay", workerName: "Sanjay Verma", role: "Driver", preview: "Looking forward to hearing back.", time: "3 days ago", unread: 0, workerId: "RZG-NGP-DRV-7810", status: "Away" }
];

function getDemoJobTitle(conversation) {
  return String(conversation?.role || "this").replace(/^Applied\s*•\s*/i, "").trim();
}

function getDemoThread(conversation = demoConversations[0]) {
  const jobTitle = getDemoJobTitle(conversation);
  const firstName = String(conversation?.workerName || "there").split(/\s+/)[0];

  return [
  { id: "m1", from: "worker", text: `Hi! I saw the ${jobTitle} job posted. I’m very interested in this role.`, time: "10:32 AM" },
  { id: "m2", from: "employer", text: `Hello ${firstName}! Thank you for your interest. Are you available to start this week?`, time: "10:34 AM" },
  { id: "m3", from: "worker", text: "Yes, I am available. I have flexible timing and can start immediately.", time: "10:35 AM" },
  { id: "m4", from: "employer", text: "Great! Can we schedule a quick interview for tomorrow?", time: "10:36 AM" },
  { id: "m5", from: "worker", text: "Sure! Tomorrow at 11 AM works for me.", time: "10:36 AM" },
  { id: "m6", from: "employer", text: "Perfect! Interview scheduled for tomorrow at 11 AM. You’ll get a calendar invite.", time: "10:37 AM" }
  ];
}

function initials(name) {
  return String(name || "RA").split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
}

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[14px] border border-slate-200 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function Avatar({ worker, name, size = "h-11 w-11" }) {
  return (
    <span className={`relative grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 text-xs font-black text-white`}>
      {worker?.photoUrl ? (
        <img src={worker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center rounded-full bg-blue-600">{initials(name || worker?.name)}</span>
      )}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
    </span>
  );
}

function MessageStats({ isEmployerDemoMode, messages }) {
  const values = isEmployerDemoMode
    ? [["3", "Contact Requests", "bg-green-500"], ["1", "Interview Scheduled", "bg-blue-500"], ["12", "Active Conversations", "bg-violet-400"]]
    : [[String(messages.length), "Contact Requests", "bg-green-500"], ["0", "Interview Scheduled", "bg-blue-500"], [String(messages.length), "Active Conversations", "bg-violet-400"]];

  return (
    <div className="grid shrink-0 gap-3 md:grid-cols-3">
      {values.map(([value, label, dot]) => (
        <Card key={label} className="relative h-[54px] min-w-[150px] px-5 py-2">
          <span className={`absolute right-4 top-3 h-1.5 w-1.5 rounded-full ${dot}`} />
          <p className="text-xl font-black leading-none text-blue-700">{value}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
        </Card>
      ))}
    </div>
  );
}

function ConversationListItem({ conversation, selected, worker, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[78px] w-full items-center gap-3 rounded-xl border px-3 text-left transition hover:border-blue-200 hover:bg-blue-50/45 ${
        selected ? "border-blue-200 bg-blue-50/70 shadow-sm before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl before:bg-blue-600" : "border-slate-200 bg-white"
      }`}
    >
      <Avatar worker={worker} name={conversation.workerName} size="h-12 w-12" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-black text-slate-950">{conversation.workerName}</span>
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </span>
        <span className="mt-1 block truncate text-xs font-bold text-slate-500">{conversation.role}</span>
        <span className="mt-1 block truncate text-xs font-bold text-slate-600">{conversation.preview}</span>
      </span>
      <span className="flex h-full flex-col items-end justify-between gap-2 py-1">
        <span className="text-[11px] font-bold text-slate-400">{conversation.time}</span>
        {conversation.unread ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-black text-white">{conversation.unread}</span> : null}
      </span>
    </button>
  );
}

function ConversationList({ conversations, workers, selectedId, onSelect, query, setQuery, tab, setTab, onFeedback, isEmployerDemoMode }) {
  const tabs = ["All", "Unread", "Applicants", "Interview", "Archived"];
  const unreadCount = conversations.filter((conversation) => Number(conversation.unread || 0) > 0).length;
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex shrink-0 gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
          </label>
          <button type="button" onClick={onFeedback} aria-label="Filter conversations" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex shrink-0 gap-1 border-b border-slate-100">
          {tabs.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={`min-h-9 rounded-t-lg px-3 text-xs font-black transition ${tab === item ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
              {item} {item === "Unread" && unreadCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{isEmployerDemoMode ? 3 : unreadCount}</span>}
            </button>
          ))}
        </div>
        <p className="mt-4 shrink-0 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Contact Requests ({conversations.length})</p>
        <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              selected={selectedId === conversation.id}
              worker={workers.find((worker) => worker.workerId === conversation.workerId || worker.name === conversation.workerName)}
              onClick={() => onSelect(conversation.id)}
            />
          ))}
        </div>
        <button type="button" onClick={onFeedback} className="mt-3 flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-700 hover:bg-slate-50">
          <Archive className="h-4 w-4" /> View Archived (4)
        </button>
      </Card>
      <QuickActions onFeedback={onFeedback} />
    </div>
  );
}

function QuickActions({ onFeedback }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-black text-slate-950">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          [Users, "Find Workers"],
          [BriefcaseBusiness, "Post Job"],
          [CalendarDays, "Schedule Interview"],
          [Star, "Saved Workers"]
        ].map(([Icon, label]) => (
          <button key={label} type="button" onClick={onFeedback} className="group flex flex-col items-center gap-2 text-center text-[11px] font-black text-slate-700">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white"><Icon className="h-5 w-5" /></span>
            {label}
          </button>
        ))}
      </div>
    </Card>
  );
}

function ChatMessage({ message, worker }) {
  const isEmployer = message.from === "employer";
  return (
    <div className={`flex items-end gap-3 ${isEmployer ? "justify-end" : "justify-start"}`}>
      {!isEmployer && <Avatar worker={worker} name={worker?.name} size="h-9 w-9" />}
      <div className={`max-w-[62%] rounded-xl border px-4 py-3 text-sm font-bold leading-6 shadow-sm ${isEmployer ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700"}`}>
        <p>{message.text}</p>
        <p className={`mt-1 text-right text-[11px] font-bold ${isEmployer ? "text-blue-500" : "text-slate-400"}`}>{message.time} {isEmployer && <span className="text-blue-600">✓✓</span>}</p>
      </div>
    </div>
  );
}

function MessageComposer({ value, setValue, onSend, onFeedback, disabled = false }) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-3">
      <div className="flex w-fit overflow-hidden rounded-xl border border-slate-200 bg-white">
        {[
          [MessageSquare, "Message"],
          [Paperclip, "Attach"],
          [CalendarDays, "Schedule"],
          [Star, "Templates"]
        ].map(([Icon, label], index) => (
          <button key={label} type="button" onClick={index ? onFeedback : undefined} className={`inline-flex h-9 items-center gap-2 px-4 text-xs font-black ${index === 0 ? "border-b-2 border-blue-600 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") onSend(); }}
          placeholder={disabled ? "Select a conversation to message..." : "Type your message..."}
          className="h-10 min-w-0 flex-1 text-sm font-bold outline-none placeholder:text-slate-400 disabled:bg-transparent disabled:text-slate-400"
        />
        <button type="button" disabled={disabled} onClick={onFeedback} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"><Mic className="h-4 w-4" /></button>
        <button type="button" disabled={disabled} onClick={onSend} className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function ChatWindow({ conversation, worker, messages, draft, setDraft, onSend, onFeedback, navigateTo }) {
  const hasConversation = Boolean(conversation);

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <header className="flex h-[66px] shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Back" className="text-slate-500 hover:text-blue-700">←</button>
          {hasConversation ? <Avatar worker={worker} name={conversation?.workerName} size="h-11 w-11" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-500">R</span>}
          <div>
            <h3 className="text-base font-black text-slate-950">{conversation?.workerName || "Select conversation"}</h3>
            <p className={`text-xs font-black ${hasConversation ? "text-green-600" : "text-slate-400"}`}>{conversation?.status || (hasConversation ? "Active now" : "No active thread")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={!worker?.workerId} onClick={() => worker?.workerId && navigateTo(`/employer/workers/${worker.workerId}`)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"><User className="h-4 w-4" /> View Profile</button>
          {[Phone, Video, MoreHorizontal].map((Icon, index) => <button key={index} type="button" disabled={!hasConversation} onClick={onFeedback} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"><Icon className="h-4 w-4" /></button>)}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/35 px-5 py-4">
        {hasConversation && messages.length ? (
          <>
            <div className="mx-auto mb-4 w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">Today</div>
            <div className="space-y-4">
              {messages.map((message) => <ChatMessage key={message.id} message={message} worker={worker} />)}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700"><MessageSquare className="h-6 w-6" /></span>
            <h3 className="mt-4 text-lg font-black text-slate-950">No conversation selected</h3>
            <p className="mt-2 max-w-sm text-sm font-bold leading-6 text-slate-500">Real worker messages will appear here when a contact request or active conversation is opened.</p>
          </div>
        )}
      </div>
      <MessageComposer value={draft} setValue={setDraft} onSend={onSend} onFeedback={onFeedback} disabled={!hasConversation} />
    </Card>
  );
}

function WorkerSummary({ worker, navigateTo }) {
  if (!worker) {
    return <Card className="p-5 text-sm font-bold text-slate-500">Select a worker to view their hiring summary.</Card>;
  }

  return (
    <Card className="min-h-0 overflow-y-auto p-4">
      <h3 className="text-base font-black text-slate-950">Worker Summary</h3>
      <div className="mt-5 flex items-center gap-4">
        <Avatar worker={worker} name={worker.name} size="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-lg font-black text-slate-950">{worker.name}</h4>
            <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-black text-green-700">98% Match</span>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">{worker.skill}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-500"><MapPin className="h-3.5 w-3.5" /> {worker.city}</p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-slate-100 text-sm">
        <SummaryRow label="Experience" value={`${worker.experience || 4} Years ★★★★★`} />
        <div className="py-4">
          <p className="text-xs font-black text-slate-600">Skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Cleaning", "Cooking", "Child Care", "Elder Care"].map((skill) => <span key={skill} className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700">{skill}</span>)}
          </div>
        </div>
        <SummaryRow label="Expected Wage" value={`₹${Number(worker.expectedWage || 18000).toLocaleString("en-IN")} / month`} valueClass="text-green-700" />
        <SummaryRow label="Availability" value="Immediate" badge />
        <div className="py-4">
          <p className="text-xs font-black text-slate-600">Documents Verified</p>
          {["Aadhaar Card", "eShram Card", "Worker ID Card"].map((doc) => (
            <p key={doc} className="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">{doc}<CheckCircle2 className="h-4 w-4 text-green-600" /></p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-violet-50 p-4 text-center"><p className="text-xs font-bold text-slate-500">Applied Jobs</p><p className="mt-1 text-2xl font-black text-violet-700">3</p></div>
        <div className="rounded-xl bg-blue-50 p-4 text-center"><p className="text-xs font-bold text-slate-500">Interviews</p><p className="mt-1 text-2xl font-black text-green-700">1</p></div>
      </div>
      <div className="mt-3 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-black text-slate-500">Next Interview</p>
        <div className="mt-2 flex items-center justify-between gap-2"><p className="text-sm font-black text-slate-800">Tomorrow, 11:00 AM</p><button className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-black text-blue-700">View Details</button></div>
      </div>
      <button type="button" onClick={() => navigateTo(`/employer/workers/${worker.workerId}`)} className="mt-4 flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50">View Full Profile <ChevronRight className="h-4 w-4" /></button>
    </Card>
  );
}

function SummaryRow({ label, value, valueClass = "text-slate-700", badge = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <p className="text-xs font-black text-slate-600">{label}</p>
      {badge ? <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-black text-green-700">{value}</span> : <p className={`text-xs font-black ${valueClass}`}>{value}</p>}
    </div>
  );
}

function AISuggestionBar({ conversation, worker, onFeedback }) {
  const workerName = worker?.name || conversation?.workerName || "This worker";
  const jobTitle = getDemoJobTitle(conversation);

  return (
    <div className="flex h-[58px] shrink-0 items-center justify-between gap-4 rounded-[14px] border border-green-200 bg-green-50 px-5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-black text-slate-950"><Sparkles className="h-4 w-4 text-green-700" /> AI Suggestion</p>
        <p className="mt-1 truncate text-xs font-bold text-slate-600">{workerName} has a 98% match for your {jobTitle} job. This worker is available immediately and has verified documents.</p>
      </div>
      <button type="button" onClick={onFeedback} className="h-9 shrink-0 rounded-lg border border-green-400 bg-white px-5 text-xs font-black text-green-700 hover:bg-green-100">Proceed to Hire</button>
    </div>
  );
}

export function EmployerMessagesPage({
  messages,
  workers,
  isEmployerDemoMode,
  navigateTo,
  setStatusMessage
}) {
  const [selectedId, setSelectedId] = useState(isEmployerDemoMode ? "asha" : "");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [draft, setDraft] = useState("");
  const [threadMessages, setThreadMessages] = useState(isEmployerDemoMode ? getDemoThread(demoConversations[0]) : []);

  useEffect(() => {
    setDraft("");
    if (isEmployerDemoMode) {
      setSelectedId("asha");
      setThreadMessages(getDemoThread(demoConversations[0]));
      return;
    }
    setSelectedId("");
    setThreadMessages([]);
  }, [isEmployerDemoMode]);

  const realConversations = messages.map((message) => {
    const worker = workers.find((item) => item.workerId === message.workerId);
    return {
      id: message.id,
      workerName: worker?.name || message.subject?.replace(" contact request", "") || "Worker",
      role: worker?.skill || "Contact Request",
      preview: message.lastMessage,
      time: "Recently",
      unread: 0,
      workerId: message.workerId,
      status: "Active"
    };
  });
  const sourceConversations = isEmployerDemoMode ? demoConversations : realConversations;
  const conversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sourceConversations.filter((conversation) => {
      const matchesQuery = !normalized || [conversation.workerName, conversation.role, conversation.preview].join(" ").toLowerCase().includes(normalized);
      const matchesTab = tab === "All" || (tab === "Unread" && conversation.unread) || (tab === "Applicants" && /applied|housekeeping/i.test(conversation.role)) || tab === "Interview" || tab === "Archived";
      return matchesQuery && matchesTab;
    });
  }, [query, sourceConversations, tab]);

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) || null;
  const selectedWorker = workers.find((worker) => worker.workerId === selectedConversation?.workerId || worker.name === selectedConversation?.workerName);

  useEffect(() => {
    if (!isEmployerDemoMode || !selectedConversation) return;
    setDraft("");
    setThreadMessages(getDemoThread(selectedConversation));
  }, [isEmployerDemoMode, selectedConversation?.id]);

  function feedback(message = "Action ready in demo workspace.") {
    setStatusMessage?.(message);
  }

  function sendMessage() {
    if (!selectedConversation) {
      feedback("Select a conversation before sending a message.");
      return;
    }
    if (!draft.trim()) return;
    setThreadMessages((current) => [...current, { id: `local-${Date.now()}`, from: "employer", text: draft.trim(), time: "Now" }]);
    setDraft("");
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4 overflow-hidden bg-slate-50/80 px-2 py-3 lg:px-3">
      <div className="flex shrink-0 justify-center">
        <MessageStats isEmployerDemoMode={isEmployerDemoMode} messages={messages} />
      </div>
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[350px_minmax(0,1fr)_300px]">
        <ConversationList conversations={conversations} workers={workers} selectedId={selectedConversation?.id} onSelect={setSelectedId} query={query} setQuery={setQuery} tab={tab} setTab={setTab} onFeedback={() => feedback()} isEmployerDemoMode={isEmployerDemoMode} />
        <ChatWindow conversation={selectedConversation} worker={selectedWorker} messages={threadMessages} draft={draft} setDraft={setDraft} onSend={sendMessage} onFeedback={() => feedback()} navigateTo={navigateTo} />
        <WorkerSummary worker={selectedWorker} navigateTo={navigateTo} />
      </div>
      {isEmployerDemoMode && <AISuggestionBar conversation={selectedConversation} worker={selectedWorker} onFeedback={() => feedback("Proceed to Hire is ready for the selected worker.")} />}
    </section>
  );
}
