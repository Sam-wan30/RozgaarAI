# RozgaarAI Architecture

```mermaid
flowchart TB
  Landing["Public Landing + Demo Entry"] --> Worker["Worker Workspace"]
  Landing --> Employer["Employer Workspace"]
  Landing --> NGO["NGO/Foundation Workspace"]
  Worker --> Identity["Digital Career Identity"]
  Worker --> Income["Income Passport"]
  Worker --> Jobs["AI Job Matching"]
  Employer --> Search["Find Workers"]
  Employer --> Pipeline["Hiring Pipeline"]
  NGO --> Consent["Consent + Worker Linking"]
  NGO --> Training["Training + Certificates"]
  NGO --> Placement["Placement Pipeline"]
  NGO --> Reports["Reports + Audit"]
  Search --> DemoData["Shared Demo Worker Objects"]
  Placement --> Audit["Activity Logs"]
  Reports --> Diagnostics["Admin Diagnostics"]
```

```mermaid
sequenceDiagram
  participant NGO
  participant Worker
  participant Employer
  participant App as React App
  participant Store as Local/Supabase-ready Store
  participant Audit as Audit Log

  NGO->>App: Invite or assist worker
  Worker->>App: Grant consent
  App->>Store: Save linked worker state
  App->>Audit: Record consent event
  Employer->>App: Publish opportunity
  NGO->>App: Recommend consented worker
  App->>Store: Create recommendation / placement record
  App->>Audit: Record placement movement
  Employer->>App: Interview / select
  App->>Store: Update stage and follow-up
```

## Core Principles

- Real data and demo overlays are isolated.
- Workers own identity and consent.
- Employers see verified, role-matched talent.
- NGOs support training, consent, and placement outcomes.
- Diagnostics expose configuration status without secrets.
