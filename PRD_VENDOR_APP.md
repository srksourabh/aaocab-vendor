# AaoCab Vendor Empanelment App — Product Requirements Document

**Version**: 1.1
**Date**: April 24, 2026
**Author**: Sourabh Bhaumik, CEO
**Status**: Draft for Review

> **Design Language**: See `DEVELOPMENT_PLAN.md` (Part 1: Design Language) for complete color system, typography, component specs, logo usage, and 21st.dev component selections.
> **Development Roadmap**: See `DEVELOPMENT_PLAN.md` (Part 3: Vendor App roadmap) for week-by-week execution plan.

---

## 1. Product Overview

### What We're Building
A self-service web portal where vendors (fleet owners and individual driver-owners) register themselves, upload documents, add their drivers and vehicles, and get verified — all with minimal human involvement from the AaoCab operations team.

### Why We're Building It
Today, vendor onboarding is done manually: phone calls, WhatsApp messages, documents collected via email, verification done by looking at photos one by one. This process takes 3-7 days per vendor and requires constant ops team attention. The Vendor App reduces this to under 24 hours with AI doing the heavy lifting.

### Who Uses It
- **Fleet Owner Vendors**: Business owners with 2-50 cars and multiple employed drivers (e.g., "Roy Travels" with 5 Innovas and 8 drivers)
- **Self-Employed Driver-Vendors**: Individuals who own one car and drive it themselves (e.g., "Raju Das" with 1 Sedan)
- **Hybrid Owner-Drivers**: Drive their own car AND have additional vehicles with employed drivers (e.g., "Amit Sen" drives his Innova but also has 2 Sedans with employed drivers)

### Business Impact
- Reduce vendor onboarding from 3-7 days to under 24 hours
- Reduce ops team workload by 70% on document verification
- Scale vendor network from 50+ to 500+ without proportional team growth
- Self-service means vendors can onboard at midnight — no business hours dependency

---

## 2. Core Principles

| Principle | What It Means |
|-----------|--------------|
| **AI does the grunt work, humans make the decisions** | AI parses documents, extracts fields, cross-verifies data, and flags issues. Ops team only reviews flagged cases and approves final empanelment. |
| **Self-employed driver = first-class citizen** | The "I am the driver" mode is not a workaround. It's a dedicated, simplified flow for the most common vendor type. |
| **Documents tell the truth** | Every claim (name, license, vehicle registration) must be backed by an uploaded document. AI verifies the document is real, not expired, and matches other documents. |
| **Progressive onboarding** | Vendor can register and start uploading documents immediately. Verification happens in the background. They don't wait idle. |
| **Mobile-first for drivers** | Drivers upload photos from their phone at the vehicle location. Every upload flow must work on a ₹8,000 Android phone with 4G. |

---

## 3. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Consistent with Customer App. SSR for initial load. |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS + shadcn/ui | Shared design system with Customer App |
| Database | Supabase (same instance: `zpjmblpjrkudxjburund`) | Shared vendor/driver/vehicle tables |
| Auth | Supabase Auth (Phone OTP) | Vendors log in with phone number |
| Storage | Supabase Storage | Document images, vehicle photos, driver photos |
| AI — OCR | Google Document AI | Extract fields from Indian documents (License, Aadhaar, PAN, RC) |
| AI — Verification | Claude Vision (Sonnet 4.6) | Cross-verify documents, detect tampering, validate photos |
| AI — NLP | Claude Haiku 4.5 | Parse unstructured text, suggest corrections |
| Hosting | Vercel | Auto-deploy from GitHub |

---

## 4. User Flows

### 4.1 The Three Vendor Scenarios

**Scenario A: Fleet Owner** (e.g., Roy Travels — 5 cars, 8 drivers)
```
Register as Vendor → Upload business docs → Add Car #1 → Add Car #2... → Add Driver #1 → Add Driver #2... → Review & Submit → AI Verification → Ops Approval → Active
```

**Scenario B: Self-Employed Driver** (e.g., Raju Das — 1 car, drives himself)
```
Register as Vendor → Toggle "I am the driver" → Upload personal + driver docs in ONE flow → Add Car → Review & Submit → AI Verification → Ops Approval → Active
```

**Scenario C: Hybrid Owner-Driver** (e.g., Amit Sen — drives his own car + has 2 more with employed drivers)
```
Register as Vendor → Toggle "I also drive" → Upload personal + driver docs → Add his car → Add additional cars → Add employed drivers → Review & Submit → AI Verification → Ops Approval → Active
```

### 4.2 Registration Flow (5 Steps)

#### Step 1: Phone Verification
```
┌──────────────────────────────┐
│                              │
│   Join AaoCab as a Vendor    │
│                              │
│   Your phone number:         │
│   [ +91 ______________ ]    │
│                              │
│   [ Send OTP →  ]           │
│                              │
│   Already registered?        │
│   [ Login instead ]          │
│                              │
└──────────────────────────────┘
```
- Phone OTP via Supabase Auth
- If phone already exists → redirect to login

#### Step 2: Vendor Profile
```
┌──────────────────────────────┐
│  Tell us about your business │
│                              │
│  Business/Your Name:         │
│  [ Roy Travels           ]   │
│                              │
│  Owner Name:                 │
│  [ Rajesh Roy            ]   │
│                              │
│  City:                       │
│  [ Kolkata               ]   │
│                              │
│  ┌────────────────────────┐  │
│  │ ☐ I am the driver     │  │  ← THE TOGGLE
│  │   (I drive my own car) │  │
│  └────────────────────────┘  │
│                              │
│  How many cars do you have?  │
│  [ 1 ] [ 2-5 ] [ 5+ ]       │
│                              │
│  [ Continue → ]              │
└──────────────────────────────┘
```

**"I am the driver" toggle behavior**:
- **OFF** (Fleet Owner): Shows Business Documents flow, then separate Driver and Vehicle sections
- **ON** (Self-Employed): Merges vendor + driver docs into one flow, shows "Your Vehicle" section directly

#### Step 3: Business Documents Upload (AI-Powered)

**Documents Required for All Vendors:**

| # | Document | Required? | AI Extraction |
|---|----------|-----------|--------------|
| 1 | PAN Card | Yes | Name, PAN number, DOB |
| 2 | Aadhaar Card | Yes | Name, Aadhaar number, address |
| 3 | GST Certificate | If registered | GST number, business name, registration date |
| 4 | Bank Account Details | Yes | Account number, IFSC, account holder name |

**Upload Experience:**
```
┌──────────────────────────────┐
│  Upload your PAN Card        │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   📷 Take Photo        │  │
│  │   📁 Upload from Phone │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  ⏳ Scanning your document...│  ← AI processing indicator
│                              │
│  ✅ We found:                │  ← AI extraction results
│  Name: RAJESH ROY            │
│  PAN: ABCPR1234F             │
│  DOB: 15/03/1980             │
│                              │
│  Is this correct?            │
│  [ Yes, correct ✓ ]         │
│  [ No, let me fix → ]       │  ← Manual correction if AI is wrong
│                              │
└──────────────────────────────┘
```

**AI Document Processing Pipeline:**

```
Upload Image
    ↓
Google Document AI (OCR)
    → Extract text + bounding boxes
    → Identify document type
    → Extract structured fields
    ↓
Claude Vision (Verification)
    → Is this a genuine Indian PAN card? (not a screenshot of a screenshot, not visibly edited)
    → Does the photo quality allow reading all fields?
    → Are there visual signs of tampering? (font mismatches, blurry patches near text)
    ↓
Cross-Verification Logic
    → Does the name on PAN match the name on Aadhaar? (fuzzy match, Levenshtein distance < 3)
    → Does the PAN number format match Indian PAN regex? ([A-Z]{5}[0-9]{4}[A-Z])
    → Is the Aadhaar number valid? (Verhoeff checksum)
    → Is the document expired? (check expiry date vs today)
    ↓
Result: PASS / FLAG / REJECT
    → PASS: Auto-verified, no human review needed
    → FLAG: Send to ops team with specific reason ("Name mismatch: PAN says RAJESH, Aadhaar says RAJESH KUMAR")
    → REJECT: Clearly invalid (expired, wrong document type, unreadable)
```

**Cost per vendor**: ~₹12 (4 documents × ~₹2.50 per document for OCR + Claude Vision)

#### Step 4: Add Vehicles

```
┌──────────────────────────────┐
│  Add Your Vehicle            │
│  Vehicle 1 of [?]            │
│                              │
│  Registration Number:        │
│  [ WB-02-AB-1234 ]          │  ← Auto-format as user types
│                              │
│  Vehicle Type:               │
│  [Sedan ▼]                   │
│  Make: [Toyota ▼]            │
│  Model: [Innova Crysta ▼]   │
│  Year: [2022 ▼]              │
│  Fuel: [Diesel ▼]            │
│  Seating: [7 ▼]              │
│                              │
│  ── Vehicle Documents ──     │
│                              │
│  📄 RC Book         [Upload] │  → AI extracts: reg number, owner, validity
│  📄 Insurance       [Upload] │  → AI extracts: policy number, expiry
│  📄 Fitness Cert    [Upload] │  → AI extracts: validity date
│  📄 PUC Certificate [Upload] │  → AI extracts: expiry date
│  📄 Permit (if any) [Upload] │  → AI extracts: permit type, validity
│                              │
│  ── Vehicle Photos ──        │
│  (Timestamped, GPS-tagged)   │
│                              │
│  📷 Front View      [Capture]│
│  📷 Rear View       [Capture]│
│  📷 Left Side       [Capture]│
│  📷 Right Side      [Capture]│
│  📷 Interior Front  [Capture]│
│  📷 Interior Rear   [Capture]│
│  📷 Boot/Trunk     [Capture]│
│  📷 Odometer        [Capture]│
│                              │
│  [ + Add Another Vehicle ]   │
│  [ Continue → ]              │
└──────────────────────────────┘
```

**Vehicle Photo Requirements:**
- **Must be taken live** — no gallery upload for vehicle photos. Camera opens directly.
- **Timestamp embedded**: Date and time watermarked on the photo (generated client-side)
- **GPS tagged**: Location metadata attached to verify photos were taken at the vehicle location
- **AI quality check**: Each photo sent to Claude Vision for:
  - Is this actually a car exterior/interior? (reject selfies, screenshots, irrelevant images)
  - Is the image clear enough to assess condition? (reject blurry, dark photos)
  - Rate cleanliness/condition 1-10
  - Detect visible damage (dents, scratches, torn seats)

**AI Vehicle Document Verification:**
- RC Book: Extract registration number → verify it matches the number the vendor typed
- Insurance: Extract expiry date → flag if expiring within 30 days
- Fitness: Extract validity → reject if expired
- PUC: Extract expiry → flag if expiring within 15 days

#### Step 5: Add Drivers (Fleet Owners Only — skipped for "I am the driver")

```
┌──────────────────────────────┐
│  Add Driver                  │
│  Driver 1                    │
│                              │
│  Full Name:                  │
│  [ Suman Das             ]   │
│                              │
│  Phone Number:               │
│  [ +91 98765 43210      ]   │
│                              │
│  ── Driver Documents ──     │
│                              │
│  📄 Driving License  [Upload]│  → AI: name, number, expiry, vehicle classes
│  📄 Aadhaar Card     [Upload]│  → AI: name, number, address
│  📄 PAN Card         [Upload]│  → AI: name, PAN number
│  📷 Passport Photo   [Upload]│  → AI: face detection, quality check
│  📄 Police Verification [Upload]│  → AI: date check (must be within 6 months)
│  📄 Medical Fitness  [Upload]│  → AI: date check, doctor certification
│  📄 Bank Details     [Upload]│  → AI: account number, IFSC, name
│                              │
│  Which vehicles can this     │
│  driver operate?             │
│  ☑ WB-02-AB-1234 (Innova)   │
│  ☑ WB-02-CD-5678 (Sedan)    │
│  ☐ WB-02-EF-9012 (Ertiga)   │
│                              │
│  [ + Add Another Driver ]    │
│  [ Continue → ]              │
└──────────────────────────────┘
```

**AI Driver Document Verification Pipeline:**
```
For each driver:
  1. Extract fields from all 7 documents via Google Document AI
  2. Cross-verify:
     - Name match across License, Aadhaar, PAN (fuzzy match)
     - License vehicle class supports the assigned vehicle type
       (e.g., Light Motor Vehicle class for Sedan/Innova)
     - License not expired
     - Police verification within 6 months
     - Medical fitness certificate current
  3. Face match: Compare passport photo with Aadhaar photo
     (Claude Vision: "Do these two photos show the same person?")
  4. Result: PASS / FLAG / REJECT with specific reasons
```

**Cost per driver**: ~₹17.50 (7 documents × ~₹2.50 per document)

---

## 5. Vendor Dashboard (Post-Onboarding)

Once approved, the vendor logs into a dashboard to manage their fleet and view trip activity.

### 5.1 Dashboard Home

```
┌──────────────────────────────┐
│  Welcome, Roy Travels        │
│  Vendor ID: VND-0042         │
│  Status: ✅ Active            │
├──────────────────────────────┤
│                              │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │ 5    │ │ 8    │ │ 12   ││
│  │ Cars │ │Drivers│ │Trips ││
│  │      │ │      │ │ /mo  ││
│  └──────┘ └──────┘ └──────┘│
│                              │
│  ⚠️ Alerts                    │
│  • Suman Das: License expiry │
│    in 15 days — renew now    │
│  • WB-02-AB-1234: Insurance  │
│    expiry in 30 days         │
│  • New trip request: Kol→Dgha│
│    May 5, Sedan — Accept?    │
│                              │
│  Recent Trips                │
│  • Apr 22: Kol→Digha ₹3,200 │
│    Driver: Suman, ⭐ 4.8     │
│  • Apr 20: Kol→Siliguri      │
│    ₹8,500, Driver: Amit, ⭐5 │
│                              │
│  Earnings This Month         │
│  Total: ₹45,600              │
│  Pending: ₹12,200            │
│  Paid: ₹33,400               │
│                              │
└──────────────────────────────┘
│ 🏠 Home │ 🚗 Fleet │ 📋 Trips │ 💰 Earnings │ 👤 Profile │
```

### 5.2 Fleet Management

**Vehicles Tab**: List all vehicles with status indicators
- 🟢 Active (docs valid, available for trips)
- 🟡 Expiring (a document expires within 30 days)
- 🔴 Suspended (expired document or failed inspection)
- Tap any vehicle → view details, update documents, update photos

**Drivers Tab**: List all drivers with status
- 🟢 Active
- 🟡 Document expiring
- 🔴 Suspended
- Tap any driver → view details, update documents

**Document Renewal Flow**: When a document is expiring, the vendor/driver gets:
1. Push notification 30 days before
2. WhatsApp reminder 15 days before
3. Dashboard alert (persistent)
4. Upload new document → AI re-verifies → auto-update if PASS

### 5.3 Trip Management

**Incoming Trip Requests**:
```
┌──────────────────────────────┐
│  New Trip Request            │
│                              │
│  Route: Kolkata → Digha      │
│  Date: May 5, 7:00 AM       │
│  Car Type: Sedan             │
│  Customer: R*** D** (masked) │
│  Fare: ₹3,200               │
│  Your payout: ₹2,560        │
│                              │
│  Assign Driver & Vehicle:    │
│  Driver: [Suman Das ▼]      │
│  Vehicle: [WB-02-AB-1234 ▼] │
│                              │
│  [ Accept ✓ ]  [ Decline ✗ ]│
│                              │
│  If declining, reason:       │
│  [ No availability ▼ ]      │
└──────────────────────────────┘
```

**Pre-Trip Photo Submission** (by driver, via this app):
- 2 hours before pickup, driver receives reminder
- Opens app → takes 7 mandatory photos
- AI scores each photo immediately
- If all pass → customer gets "Driver is preparing for your trip" notification
- If any fail → driver re-takes, or ops team is alerted

### 5.4 Earnings & Payouts

- Monthly earnings summary
- Per-trip breakdown (fare, commission deducted, net payout)
- Payment status: Pending / Processed / Paid
- Bank details on file (editable with re-verification)
- Download monthly statement (PDF)

---

## 6. AI Features Deep Dive

### 6.1 Document Intelligence System

This is the core AI feature of the Vendor App. It processes 12-15 documents per vendor (4 business + 5 vehicle + 7 per driver minimum).

**Architecture:**
```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  Mobile      │────→│  Supabase     │────→│  Document AI     │
│  Camera/     │     │  Storage      │     │  (Google Cloud)  │
│  Upload      │     │  (encrypted)  │     │  OCR + Field     │
└──────────────┘     └───────────────┘     │  Extraction      │
                                           └────────┬─────────┘
                                                    │
                                           ┌────────▼─────────┐
                                           │  Claude Vision   │
                                           │  (Sonnet 4.6)   │
                                           │  Verification +  │
                                           │  Fraud Detection │
                                           └────────┬─────────┘
                                                    │
                                           ┌────────▼─────────┐
                                           │  Cross-Verify    │
                                           │  Logic           │
                                           │  (Server-side)   │
                                           └────────┬─────────┘
                                                    │
                              ┌──────────────┬──────┴──────┐
                              ▼              ▼             ▼
                          ✅ PASS       🟡 FLAG       🔴 REJECT
                        (auto-approve)  (human review) (auto-reject)
```

**Verification Rules by Document Type:**

| Document | AI Extracts | Cross-Checks | Auto-Reject If |
|----------|------------|--------------|----------------|
| PAN Card | Name, PAN number, DOB | PAN format regex, name vs Aadhaar | Invalid PAN format, unreadable |
| Aadhaar | Name, number, address | Verhoeff checksum, name vs PAN | Invalid checksum, clearly fake |
| Driving License | Name, DL number, expiry, vehicle classes | Expiry > today, class supports vehicle type, name vs Aadhaar | Expired, wrong vehicle class |
| RC Book | Reg number, owner, validity | Reg number matches user input, validity > today | Expired, number mismatch |
| Insurance | Policy number, expiry, vehicle reg | Expiry > today, vehicle reg matches RC | Expired |
| Fitness Certificate | Validity date | Validity > today | Expired |
| PUC | Expiry date | Expiry > today | Expired |
| Police Verification | Issue date | Within 6 months | Older than 6 months |
| Medical Fitness | Issue date, doctor name | Within 12 months | Older than 12 months |

**Estimated Verification Accuracy**: 85-90% auto-pass rate (industry benchmark for Indian document OCR). The remaining 10-15% go to human review.

### 6.2 Vehicle Photo AI Assessment

**What AI evaluates for each photo:**

| Photo | AI Checks | Score Criteria |
|-------|----------|----------------|
| Exterior (4 photos) | Damage detection, cleanliness, number plate readable | No visible dents/scratches = 8+, minor wear = 6-7, significant damage = <5 |
| Interior Front | Dashboard cleanliness, controls visible, AC vents | Clean and organized = 8+, dusty = 6-7, dirty = <5 |
| Interior Rear | Seat condition, legroom, cleanliness | Clean seats, no tears = 8+, worn but clean = 6-7, dirty/torn = <5 |
| Boot/Trunk | Storage space, cleanliness | Empty and clean = 8+, items present but organized = 6, cluttered = <5 |
| Odometer | Reading visible | Valid reading captured = PASS, unreadable = RETAKE |

**Scoring**: Vehicle must average 7+ across all photos to pass. Below 7 → flagged for ops review. Below 5 → auto-reject with reason.

### 6.3 Expiry Prediction & Renewal Nudges

**Not AI, but smart automation:**
- Nightly cron job checks all document expiry dates
- 30 days before: Dashboard alert + push notification
- 15 days before: WhatsApp reminder
- 7 days before: Daily WhatsApp + dashboard + email
- 0 days (expired): Vehicle/driver automatically suspended. Ops team notified. Vendor sees red banner: "Your [document] has expired. Upload renewed document to reactivate."

---

## 7. Database Schema (Shared with Customer App)

### Vendor-Side Tables

```sql
-- Vendors (fleet owners or self-employed driver-owners)
vendors (
  id uuid PK,
  phone text UNIQUE NOT NULL,
  business_name text,
  owner_name text NOT NULL,
  city text,
  is_self_driver boolean DEFAULT false,  -- "I am the driver" toggle
  linked_driver_id uuid FK → drivers,    -- if is_self_driver, points to their driver record
  pan_number text,
  aadhaar_number text,
  gst_number text,
  bank_account_number text,
  bank_ifsc text,
  bank_account_holder text,
  agreement_status text DEFAULT 'pending', -- pending, signed, expired
  onboarding_status text DEFAULT 'started', -- started, docs_uploaded, under_review, approved, rejected
  overall_rating numeric DEFAULT 0,
  total_trips integer DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz
)

-- Drivers
drivers (
  id uuid PK,
  vendor_id uuid FK → vendors NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  license_number text,
  license_expiry date,
  license_vehicle_classes text[], -- ["LMV", "HMV"]
  aadhaar_number text,
  pan_number text,
  photo_url text,
  police_verification_date date,
  medical_fitness_date date,
  bank_account_number text,
  bank_ifsc text,
  status text DEFAULT 'pending', -- pending, active, suspended, inactive
  overall_rating numeric DEFAULT 0,
  total_trips integer DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz
)

-- Vehicles
vehicles (
  id uuid PK,
  vendor_id uuid FK → vendors NOT NULL,
  registration_number text UNIQUE NOT NULL,
  vehicle_type text NOT NULL, -- sedan, ertiga, innova, innova_crysta, 12_seater, 16_seater
  make text, -- Toyota, Maruti, etc.
  model text,
  year integer,
  fuel_type text, -- petrol, diesel, cng, electric
  seating_capacity integer,
  insurance_expiry date,
  fitness_expiry date,
  puc_expiry date,
  permit_type text, -- all_india, state, none
  permit_expiry date,
  status text DEFAULT 'pending', -- pending, active, suspended, inactive
  condition_score numeric, -- AI-assessed from photos, 1-10
  created_at timestamptz,
  updated_at timestamptz
)

-- Document Uploads (for all entity types)
documents (
  id uuid PK,
  entity_type text NOT NULL, -- vendor, driver, vehicle
  entity_id uuid NOT NULL,   -- FK to vendors/drivers/vehicles
  document_type text NOT NULL, -- pan, aadhaar, license, rc_book, insurance, etc.
  file_url text NOT NULL,     -- Supabase Storage path
  file_name text,
  extracted_data jsonb,       -- AI-extracted fields
  verification_status text DEFAULT 'pending', -- pending, processing, passed, flagged, rejected
  verification_notes text,    -- reason for flag/reject
  ai_confidence numeric,      -- 0-1 confidence score
  verified_by text,           -- 'ai' or ops team member name
  verified_at timestamptz,
  expiry_date date,           -- extracted from document
  created_at timestamptz,
  updated_at timestamptz
)

-- Vehicle Photos
vehicle_photos (
  id uuid PK,
  vehicle_id uuid FK → vehicles NOT NULL,
  photo_type text NOT NULL, -- front, rear, left, right, interior_front, interior_rear, boot, odometer
  file_url text NOT NULL,
  taken_at timestamptz,     -- timestamp embedded in photo
  gps_lat numeric,
  gps_lng numeric,
  ai_cleanliness_score numeric, -- 1-10
  ai_damage_detected boolean DEFAULT false,
  ai_damage_notes text,
  ai_is_valid_photo boolean, -- is this actually a car photo?
  created_at timestamptz
)

-- Pre-Trip Photos (per trip)
pre_trip_photos (
  id uuid PK,
  booking_id uuid FK → bookings NOT NULL,
  driver_id uuid FK → drivers NOT NULL,
  vehicle_id uuid FK → vehicles NOT NULL,
  photo_type text NOT NULL, -- exterior_front, exterior_rear, interior_dashboard, interior_rear, amenities, driver_selfie, odometer
  file_url text NOT NULL,
  taken_at timestamptz,
  ai_score numeric,
  ai_passed boolean,
  ai_notes text,
  created_at timestamptz
)

-- Driver-Vehicle Assignments (which drivers can drive which vehicles)
driver_vehicle_assignments (
  id uuid PK,
  driver_id uuid FK → drivers NOT NULL,
  vehicle_id uuid FK → vehicles NOT NULL,
  is_primary boolean DEFAULT false, -- driver's primary vehicle
  created_at timestamptz,
  UNIQUE(driver_id, vehicle_id)
)

-- Vendor Earnings
vendor_earnings (
  id uuid PK,
  vendor_id uuid FK → vendors NOT NULL,
  booking_id uuid FK → bookings NOT NULL,
  total_fare numeric,
  commission_rate numeric, -- 0.20 to 0.25
  commission_amount numeric,
  vendor_payout numeric,
  payout_status text DEFAULT 'pending', -- pending, processing, paid
  payout_date date,
  payout_reference text, -- bank transfer reference
  created_at timestamptz
)
```

### Row Level Security (RLS) Policies

```sql
-- Vendors can only see their own data
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors see own data" ON vendors
  FOR ALL USING (auth.uid() = id);

-- Vendors can only see their own drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors see own drivers" ON drivers
  FOR ALL USING (vendor_id = auth.uid());

-- Vendors can only see their own vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors see own vehicles" ON vehicles
  FOR ALL USING (vendor_id = auth.uid());

-- Documents: vendors see their own + their drivers' + their vehicles'
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors see own docs" ON documents
  FOR ALL USING (
    entity_id = auth.uid() OR
    entity_id IN (SELECT id FROM drivers WHERE vendor_id = auth.uid()) OR
    entity_id IN (SELECT id FROM vehicles WHERE vendor_id = auth.uid())
  );
```

---

## 8. Design System

Same brand as Customer App (see Customer App PRD Section 7), with these additions:

### Vendor-Specific UI Patterns

| Element | Design |
|---------|--------|
| Status badges | 🟢 Green chip: Active, 🟡 Amber chip: Expiring, 🔴 Red chip: Suspended |
| Document upload card | White card, 12px radius, dashed border when empty, solid when uploaded |
| Photo capture button | Full-width, 56px height, camera icon, #4F4ED6 background |
| Verification indicator | ⏳ Pending (gray), 🔄 Processing (blue pulse), ✅ Passed (teal), ⚠️ Flagged (amber), ❌ Rejected (red) |
| Progress stepper | 5-step horizontal stepper at top: Register → Documents → Vehicles → Drivers → Review |
| Earning card | White card, large number in Poppins 700, currency in Mulish 400 |

### Mobile Camera UX

For vehicle photos (must be taken live):
- Camera opens in landscape mode
- Guide overlay shows where the car should be positioned
- Countdown timer (3 seconds) before capture
- Timestamp + GPS watermark added automatically
- Preview with "Retake" or "Use This Photo" buttons
- Upload progress indicator

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Document upload size | Max 5MB per image (auto-compress if larger) |
| AI processing time | < 10 seconds per document (OCR + verification) |
| Photo upload time | < 5 seconds per photo on 4G |
| Offline capability | Form data saved locally, uploads queued for connectivity |
| Camera compatibility | Works on Android 9+ default camera API |
| Minimum device | ₹8,000 Android phone with 2GB RAM |
| Concurrent uploads | Handle 50 vendors uploading simultaneously |
| Storage | Supabase Storage, encrypted at rest |
| Data retention | Documents stored for 3 years (regulatory requirement) |

---

## 10. Phased Rollout

### Phase 1: Core Onboarding (Weeks 1-4)
- Phone OTP registration
- Vendor profile with "I am the driver" toggle
- Document upload (manual — no AI yet)
- Vehicle registration with photos (manual review)
- Driver addition (for fleet owners)
- Basic dashboard (status, alerts)
- Supabase schema + RLS + Storage
- Vercel deployment

### Phase 2: AI Verification (Weeks 5-8)
- Google Document AI integration for OCR
- Claude Vision for document verification
- Cross-verification logic (name matching, format validation, expiry checks)
- Auto-pass / Flag / Reject pipeline
- Vehicle photo AI assessment
- Document expiry notifications (WhatsApp + dashboard)
- Earnings dashboard

### Phase 3: Operations (Weeks 9-12)
- Trip request acceptance/decline flow
- Pre-trip photo submission with AI scoring
- Driver-vehicle assignment management
- Earnings statements (downloadable PDF)
- WhatsApp bot for trip notifications to drivers
- Hindi language support

### Phase 4: Intelligence (Weeks 13-16)
- Driver performance scoring (automated from trip data)
- Predictive document renewal reminders
- Vehicle condition trend tracking (compare photos over time)
- Vendor rating system
- Bengali language support
- Bulk driver/vehicle upload (CSV import for large fleet owners)

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI misreads document fields | Wrong data stored, downstream errors | Always show extracted data to vendor for confirmation. "Is this correct?" step after every document. |
| Tampered documents pass AI check | Unqualified driver/vehicle on platform | AI is first filter, not the only filter. Ops team spot-checks 20% of AI-passed documents randomly. |
| Poor photo quality from cheap phones | AI can't assess vehicle condition | Client-side quality check before upload (blur detection, brightness). Guide overlay for proper framing. "This photo is too dark — try again" feedback. |
| Vendor abandons mid-onboarding | Lost potential vendor | Save progress at every step. Send WhatsApp reminder after 24 hours of inactivity: "You're 3 steps away from joining AaoCab!" |
| Document verification API costs spike | Budget overrun | Cache verification results. Don't re-verify unchanged documents. Batch processing during off-peak hours. Monthly cost monitoring with alerts. |
| Self-employed driver confused by fleet owner flow | Drops off | "I am the driver" toggle is on Step 2 (not buried). Toggle changes the entire flow, not just adds a field. |

---

## 12. Dependencies

| Dependency | Owner | Status |
|-----------|-------|--------|
| Shared Supabase schema | Both apps | Not started — must be designed before either app builds |
| Google Document AI account | Sourabh | Needs GCP setup |
| Claude API key | Sourabh | Needs Anthropic account |
| Supabase Storage bucket | Auto | Created during schema setup |
| WhatsApp Business API | Sourabh | Shared with Customer App |
| Vendor Empanelment Agreement (digital) | Legal/Sourabh | Existing document, needs digital version |

---

## 13. Relationship to Other Apps

| App | What It Shares | What It Owns |
|-----|---------------|-------------|
| Customer App | Reads vendor/driver/vehicle data for driver profile cards. Creates bookings that appear in vendor dashboard. | Customer accounts, bookings, reviews, SEO pages |
| Vendor App | Reads booking data assigned to this vendor. | Vendor/driver/vehicle registration, document verification, pre-trip photos, earnings |
| Admin Panel (future) | Full read/write access to all tables. Manages the verification queue, trip assignment, and finance. | Ops workflows, reporting, commission management |

All three apps use the same Supabase database (`zpjmblpjrkudxjburund`) with RLS ensuring each app only sees what it should.

---

*This PRD is a living document. It will be updated based on learnings from the first 50 vendor onboardings and ops team feedback.*
