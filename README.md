# Thakbo (থাকবো) — Budget Accommodation Discovery Platform for Bangladesh

> **Tagline (Bengali):** "ঘুরতে বের হোন, থাকার চিন্তা কমান।"  
> **Tagline (English):** "Find affordable stays across Bangladesh."

Thakbo is a community-powered budget accommodation discovery platform focused on Bangladesh. It helps travelers discover affordable, clean places to stay in cities, towns, tourist destinations, and especially at the **upazila level**.

---

## 🌟 Core Features

1. **Hierarchical Discovery Across Bangladesh**:
   - Covers all **8 Divisions** (Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh).
   - All **64 Districts** and comprehensive Upazila-level destination data.
   - Dual Bengali and English search handling.

2. **Advanced Multi-Criteria Filters & Real Search**:
   - Location (Division → District → Upazila cascading selector).
   - Nightly budget range in Bangladeshi Taka (৳ BDT).
   - Accommodation type: Hotel, Guest House, Eco Cottage, Resort, Dormitory, Rest House.
   - Room type: Single, Double, Twin, Family, Dormitory Bunk.
   - AC and Non-AC room filtering.
   - Attached vs. Shared bathroom.
   - Facilities: Wi-Fi, Generator/Power Backup, Geyser/Hot Water, Car Parking, CCTV, In-house Restaurant, etc.
   - Sorting: Lowest price first, Highest price, Recently updated, Name.

3. **Community Submission Workflow**:
   - Public multi-section form under `/add-hotel`.
   - **Guaranteed Pending Status**: Submissions NEVER automatically publish.
   - High-entropy tracking code generated upon submission (e.g. `TB-SUB-849120`).
   - Image upload preview, multiple photos with cover selector, and size/type validation.
   - Contributor relationship logging (Owner/Manager, Hotel Staff, Local Contributor, Past Traveler).

4. **Public-Safe Tracking**:
   - Safe lookup under `/submission-status`.
   - Strips private email addresses, admin internal notes, and system IDs.
   - Displays real-time moderation lifecycle (Received → Review → Decision).

5. **Moderator & Admin Portal (`/admin`)**:
   - Secure login with session management.
   - Test credentials: `admin@thakbo.com` / `thakbo2026`.
   - Real database-derived statistics: Total published, Pending queue, Price reconfirmation needed, Unresolved user reports.
   - Atomic idempotent approval: creates/updates public hotel record, generates canonical slug, records reviewer ID and timestamp, and writes an audit log entry.
   - Rejection with reason and Request Changes workflow.
   - Price verification button (`Price Verified Today`).
   - Discrepancy report resolution console.
   - Immutable audit logs.

6. **Reporting System**:
   - Travelers can flag incorrect prices, closed properties, incorrect contact info, or misleading listings via the built-in Report modal.

7. **Bilingual Design System**:
   - Default language: Bengali (`bn`).
   - Secondary language: English (`en`).
   - Authentic fonts: **Hind Siliguri** for Bengali, **Plus Jakarta Sans / Satoshi** for English, **JetBrains Mono** for numbers/codes.
   - Currency: Bangladeshi Taka (৳ BDT) with Bengali numeral formatting (`৳১,২০০`).

---

## 🗄️ Database & Supabase Integration

Thakbo is engineered with a **Universal Persistence Architecture**:
- Out of the box, it operates with local transactional storage pre-seeded with 12+ realistic demo stays across Cox's Bazar, Sajek Valley, Sreemangal, Bandarban, Kuakata, Dhaka, Tetulia, etc.
- To connect your cloud **Supabase PostgreSQL** instance:
  1. Copy your Supabase Project URL and Anon Key into `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
  2. Run the provided SQL migration in Supabase SQL Editor:
     - `supabase/migrations/20261013000000_thakbo_schema.sql`
  3. Run the seed script:
     - `supabase/seed.sql`
  4. Create a public Storage bucket named `hotel-photos`.

---

## 🛡️ Security & Privacy Guardrails

- Anonymous users can only query published listings (`status = 'published'`).
- Submitter private contact emails are isolated from public hotel payloads.
- Demo listings are explicitly labeled: *"Demo listing — not a real property"*.
- No fabricated reviews, fake star ratings, or misleading instant booking promises.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Compile check
npm run build

# TypeScript validation
npm run lint
```
