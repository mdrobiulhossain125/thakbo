import { 
  Hotel, 
  HotelFilterOptions, 
  Submission, 
  SubmissionPayload, 
  Report, 
  AuditLog, 
  PriceHistory, 
  AdministrativeLevel 
} from '../types';
import { DEMO_HOTELS } from '../data/demoHotels';
import { getLocationHierarchy, ALL_LOCATIONS } from '../data/locations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  HOTELS: 'thakbo_hotels_v1',
  SUBMISSIONS: 'thakbo_submissions_v1',
  REPORTS: 'thakbo_reports_v1',
  AUDIT_LOGS: 'thakbo_audit_logs_v1',
  PRICE_HISTORY: 'thakbo_price_history_v1',
};

// Initialize seed data if not present
function initializeLocalStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.HOTELS)) {
    // Populate with demo hotels enriched with location hierarchy
    const enrichedDemo = DEMO_HOTELS.map(hotel => ({
      ...hotel,
      locationHierarchy: getLocationHierarchy(hotel.locationId)
    }));
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(enrichedDemo));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    const initialSubmissions: Submission[] = [
      {
        id: 'sub-sample-1',
        referenceCode: 'TB-SUB-784912',
        submittedBy: 'Ashikur Rahman (Local Guide)',
        privateContactEmail: 'ashik.guide@example.com',
        payload: {
          propertyName: 'Naf View Budget Inn',
          accommodationType: 'hotel',
          descriptionBn: 'টেকনাফ বাসস্ট্যান্ডের কাছে নাফ নদীমুখী পরিচ্ছন্ন বাজেট হোটেল। সেন্টমার্টিনগামী ট্রাভেলারদের জন্য উপযোগী।',
          descriptionEn: 'Budget hotel near Teknaf bus terminal facing the Naf River. Ideal transit stay before taking the morning ship to St. Martins Island.',
          divisionId: 'div-chattogram',
          districtId: 'dis-coxsbazar',
          upazilaId: 'upz-teknaf',
          address: 'মেইন রোড, টেকনাফ বাস টার্মিনাল সংলগ্ন, কক্সবাজার',
          contactPhone: '+880 1819-555444',
          publicWebsiteUrl: '',
          contributorRelationship: 'local_contributor',
          privateContactEmail: 'ashik.guide@example.com',
          facilities: ['fac-attached-bath', 'fac-generator', 'fac-wifi'],
          rooms: [
            {
              roomName: 'স্ট্যান্ডার্ড নন-এসি ডাবল',
              roomType: 'double',
              pricePerNight: 900,
              maxGuests: 2,
              airConditioned: false,
              bathroomType: 'attached',
              availabilityNote: 'নাফ নদী দেখা যায়'
            }
          ],
          photos: [
            {
              storagePath: '/src/assets/images/cox_beach_guesthouse_1791896539124.jpg',
              isCover: true,
              caption: 'হোটেল ভবন প্রাঙ্গণ',
              attribution: 'Ashikur Rahman'
            }
          ]
        },
        status: 'pending',
        adminNotes: 'Phone number verified via SMS. Location is 200m from Teknaf bus terminal.',
        createdAt: '2026-03-24T14:20:00Z',
        updatedAt: '2026-03-24T14:20:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    const initialReports: Report[] = [
      {
        id: 'rep-sample-1',
        hotelId: 'demo-hotel-1',
        hotelName: 'Sagorika Guest House',
        reportType: 'incorrect_price',
        description: 'অফ-সিজনে নন-এসি ডাবল রুম ১,০০০ টাকায় পেয়েছি, বর্তমানে সাইটে ১২০০ উল্লেখ আছে। দয়া করে চেক করুন।',
        reporterContact: 'tanvir.traveler@example.com',
        status: 'pending',
        createdAt: '2026-03-26T08:15:00Z'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReports));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const initialLogs: AuditLog[] = [
      {
        id: 'log-1',
        actorId: 'system-init',
        actorEmail: 'admin@thakbo.com',
        action: 'SYSTEM_BOOTSTRAP',
        entityType: 'hotel',
        entityId: 'seed',
        beforeData: null,
        afterData: { totalHotels: DEMO_HOTELS.length },
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify([]));
  }
}

// Get raw list helpers
function getStoredHotels(): Hotel[] {
  initializeLocalStore();
  const raw = localStorage.getItem(STORAGE_KEYS.HOTELS);
  return raw ? JSON.parse(raw) : [];
}

function saveStoredHotels(hotels: Hotel[]) {
  localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
}

function getStoredSubmissions(): Submission[] {
  initializeLocalStore();
  const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return raw ? JSON.parse(raw) : [];
}

function saveStoredSubmissions(submissions: Submission[]) {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
}

function getStoredReports(): Report[] {
  initializeLocalStore();
  const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
  return raw ? JSON.parse(raw) : [];
}

function saveStoredReports(reports: Report[]) {
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
}

function logAudit(action: string, entityType: AuditLog['entityType'], entityId: string, actorId: string, actorEmail?: string, beforeData?: any, afterData?: any) {
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  const logs: AuditLog[] = raw ? JSON.parse(raw) : [];
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actorId,
    actorEmail,
    action,
    entityType,
    entityId,
    beforeData,
    afterData,
    createdAt: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
}

// Public Discovery APIs
export async function getPublishedHotels(filters: HotelFilterOptions = {}): Promise<{
  hotels: Hotel[];
  total: number;
}> {
  let list = getStoredHotels().filter(h => h.status === 'published');

  // Text search
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    list = list.filter(h => {
      const nameMatch = h.name.toLowerCase().includes(q);
      const descMatch = (h.descriptionBn && h.descriptionBn.toLowerCase().includes(q)) || 
                        (h.descriptionEn && h.descriptionEn.toLowerCase().includes(q));
      const addrMatch = h.address.toLowerCase().includes(q);
      const locHierarchy = h.locationHierarchy;
      const locMatch = locHierarchy && (
        locHierarchy.division.nameEn.toLowerCase().includes(q) ||
        locHierarchy.division.nameBn.includes(q) ||
        locHierarchy.district.nameEn.toLowerCase().includes(q) ||
        locHierarchy.district.nameBn.includes(q) ||
        (locHierarchy.upazila && (
          locHierarchy.upazila.nameEn.toLowerCase().includes(q) ||
          locHierarchy.upazila.nameBn.includes(q)
        ))
      );
      return nameMatch || descMatch || addrMatch || locMatch;
    });
  }

  // Location filters
  if (filters.divisionId && filters.divisionId !== 'all') {
    list = list.filter(h => h.locationHierarchy?.division.id === filters.divisionId);
  }

  if (filters.districtId && filters.districtId !== 'all') {
    list = list.filter(h => h.locationHierarchy?.district.id === filters.districtId);
  }

  if (filters.upazilaId && filters.upazilaId !== 'all') {
    list = list.filter(h => h.locationHierarchy?.upazila?.id === filters.upazilaId || h.locationId === filters.upazilaId);
  }

  // Accommodation type
  if (filters.accommodationType && filters.accommodationType !== 'all') {
    list = list.filter(h => h.accommodationType === filters.accommodationType);
  }

  // Min / Max price
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    list = list.filter(h => h.priceFrom >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    list = list.filter(h => {
      // Must have at least one room within budget or priceFrom within budget
      return h.priceFrom <= filters.maxPrice! || h.rooms.some(r => r.pricePerNight <= filters.maxPrice!);
    });
  }

  // Room type filter
  if (filters.roomType && filters.roomType !== 'all') {
    list = list.filter(h => h.rooms.some(r => r.roomType === filters.roomType));
  }

  // AC filter
  if (filters.airConditioned !== undefined && filters.airConditioned !== 'all') {
    const wantAc = Boolean(filters.airConditioned);
    list = list.filter(h => h.rooms.some(r => r.airConditioned === wantAc));
  }

  // Bathroom filter
  if (filters.bathroomType && filters.bathroomType !== 'all') {
    list = list.filter(h => h.rooms.some(r => r.bathroomType === filters.bathroomType));
  }

  // Facilities filter
  if (filters.facilityIds && filters.facilityIds.length > 0) {
    list = list.filter(h => 
      filters.facilityIds!.every(facId => h.facilities.includes(facId))
    );
  }

  // Sorting
  if (filters.sortBy === 'price_asc') {
    list.sort((a, b) => a.priceFrom - b.priceFrom);
  } else if (filters.sortBy === 'price_desc') {
    list.sort((a, b) => b.priceFrom - a.priceFrom);
  } else if (filters.sortBy === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: recently updated
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  return {
    hotels: list,
    total: list.length
  };
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  const list = getStoredHotels();
  const hotel = list.find(h => h.slug === slug && h.status === 'published');
  if (!hotel) return null;
  return {
    ...hotel,
    locationHierarchy: getLocationHierarchy(hotel.locationId)
  };
}

export async function getSimilarHotels(currentHotelId: string, locationId: string, limit = 3): Promise<Hotel[]> {
  const list = getStoredHotels().filter(h => h.status === 'published' && h.id !== currentHotelId);
  const currentHierarchy = getLocationHierarchy(locationId);

  // Match by upazila first, then district
  const upazilaMatches = list.filter(h => h.locationId === locationId);
  if (upazilaMatches.length >= limit) {
    return upazilaMatches.slice(0, limit);
  }

  const districtMatches = list.filter(h => 
    h.locationId !== locationId && 
    h.locationHierarchy?.district.id === currentHierarchy?.district.id
  );

  return [...upazilaMatches, ...districtMatches].slice(0, limit);
}

// User Submission APIs
export async function createStaySubmission(payload: SubmissionPayload): Promise<{
  success: boolean;
  referenceCode: string;
  submissionId: string;
}> {
  // Generate high-entropy reference code e.g. TB-SUB-849120
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  const referenceCode = `TB-SUB-${randomSuffix}`;
  const submissionId = `sub-${Date.now()}`;

  const submission: Submission = {
    id: submissionId,
    referenceCode,
    submittedBy: payload.privateContactEmail ? `Contributor (${payload.contributorRelationship})` : 'Anonymous Contributor',
    privateContactEmail: payload.privateContactEmail,
    payload,
    status: 'pending', // CRITICAL: NEVER automatically publish
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const submissions = getStoredSubmissions();
  submissions.unshift(submission);
  saveStoredSubmissions(submissions);

  logAudit(
    'SUBMISSION_CREATED',
    'submission',
    submissionId,
    'anonymous-submitter',
    payload.privateContactEmail,
    null,
    { referenceCode, propertyName: payload.propertyName, status: 'pending' }
  );

  return {
    success: true,
    referenceCode,
    submissionId,
  };
}

// Public Safe Status Lookup
export async function getSubmissionStatusByReference(referenceCode: string): Promise<{
  found: boolean;
  status?: Submission['status'];
  referenceCode?: string;
  propertyName?: string;
  submittedAt?: string;
  decisionReason?: string;
  publicNotes?: string;
}> {
  const cleanRef = referenceCode.trim().toUpperCase();
  const submissions = getStoredSubmissions();
  const match = submissions.find(s => s.referenceCode.toUpperCase() === cleanRef);

  if (!match) {
    return { found: false };
  }

  // Public-safe payload: Strips adminNotes, private emails, internal IDs!
  return {
    found: true,
    status: match.status,
    referenceCode: match.referenceCode,
    propertyName: match.payload.propertyName,
    submittedAt: match.createdAt,
    decisionReason: match.decisionReason,
    publicNotes: match.status === 'changes_requested' ? match.decisionReason : undefined
  };
}

// Reporting an Issue
export async function submitHotelReport(data: {
  hotelId: string;
  hotelName: string;
  reportType: Report['reportType'];
  description: string;
  reporterContact?: string;
}): Promise<{ success: boolean; reportId: string }> {
  const reports = getStoredReports();
  const reportId = `rep-${Date.now()}`;

  const newReport: Report = {
    id: reportId,
    hotelId: data.hotelId,
    hotelName: data.hotelName,
    reportType: data.reportType,
    description: data.description,
    reporterContact: data.reporterContact,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  reports.unshift(newReport);
  saveStoredReports(reports);

  logAudit('REPORT_SUBMITTED', 'report', reportId, 'traveler', data.reporterContact, null, {
    hotelId: data.hotelId,
    reportType: data.reportType
  });

  return { success: true, reportId };
}

// Admin Operations
export async function getAdminDashboardStats() {
  const hotels = getStoredHotels();
  const submissions = getStoredSubmissions();
  const reports = getStoredReports();

  const publishedHotels = hotels.filter(h => h.status === 'published').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
  const unresolvedReports = reports.filter(r => r.status === 'pending' || r.status === 'investigating').length;

  // Hotels with prices unchecked in the last 60 days
  const now = Date.now();
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const priceReconfirmationNeeded = hotels.filter(h => {
    const checked = new Date(h.priceCheckedAt).getTime();
    return (now - checked) > sixtyDaysMs;
  }).length;

  return {
    publishedHotels,
    pendingSubmissions,
    rejectedSubmissions,
    unresolvedReports,
    priceReconfirmationNeeded,
    totalSubmissions: submissions.length
  };
}

export async function getAdminSubmissionsList(): Promise<Submission[]> {
  return getStoredSubmissions();
}

export async function approveSubmission(submissionId: string, adminId: string, adminEmail: string): Promise<{ success: boolean; hotelId: string }> {
  const submissions = getStoredSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) throw new Error('Submission not found');

  const submission = submissions[index];
  if (submission.status === 'approved') {
    // Idempotent: already approved
    return { success: true, hotelId: `hotel-${submission.id}` };
  }

  const payload = submission.payload;
  const baseSlug = payload.propertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const locationItem = ALL_LOCATIONS.find(l => l.id === payload.upazilaId || l.id === payload.districtId);
  const locationSuffix = locationItem ? `-${locationItem.slug}` : '';
  const uniqueSlug = `${baseSlug}${locationSuffix}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Find lowest price from rooms
  const validPrices = payload.rooms.map(r => r.pricePerNight).filter(p => p > 0);
  const priceFrom = validPrices.length > 0 ? Math.min(...validPrices) : 1000;

  const newHotelId = `hotel-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const newHotel: Hotel = {
    id: newHotelId,
    name: payload.propertyName,
    slug: uniqueSlug,
    descriptionBn: payload.descriptionBn,
    descriptionEn: payload.descriptionEn || '',
    accommodationType: payload.accommodationType,
    locationId: payload.upazilaId || payload.districtId,
    locationHierarchy: getLocationHierarchy(payload.upazilaId || payload.districtId),
    address: payload.address,
    latitude: payload.latitude,
    longitude: payload.longitude,
    contactPhone: payload.contactPhone,
    publicWebsiteUrl: payload.publicWebsiteUrl,
    status: 'published',
    sourceType: payload.contributorRelationship === 'owner_manager' ? 'owner_submission' : 'community_submission',
    verificationStatus: 'community_verified',
    priceFrom,
    priceCheckedAt: nowIso,
    facilities: payload.facilities,
    rooms: payload.rooms.map((r, i) => ({
      id: `room-${newHotelId}-${i + 1}`,
      hotelId: newHotelId,
      roomName: r.roomName,
      roomType: r.roomType,
      pricePerNight: r.pricePerNight,
      maxGuests: r.maxGuests,
      airConditioned: r.airConditioned,
      bathroomType: r.bathroomType,
      availabilityNote: r.availabilityNote,
      updatedAt: nowIso
    })),
    photos: payload.photos.map((p, i) => ({
      id: `photo-${newHotelId}-${i + 1}`,
      hotelId: newHotelId,
      storagePath: p.storagePath,
      caption: p.caption,
      sortOrder: i + 1,
      isCover: p.isCover || i === 0,
      attribution: p.attribution || payload.propertyName,
      createdAt: nowIso
    })),
    createdBy: adminEmail,
    createdAt: nowIso,
    updatedAt: nowIso,
    publishedAt: nowIso
  };

  // 1. Add hotel to store
  const hotels = getStoredHotels();
  hotels.unshift(newHotel);
  saveStoredHotels(hotels);

  // 2. Update submission state
  submission.status = 'approved';
  submission.reviewedBy = adminEmail;
  submission.reviewedAt = nowIso;
  submission.updatedAt = nowIso;
  submissions[index] = submission;
  saveStoredSubmissions(submissions);

  // 3. Log audit
  logAudit('SUBMISSION_APPROVED_AND_PUBLISHED', 'hotel', newHotelId, adminId, adminEmail, { submissionId }, { hotelId: newHotelId, slug: uniqueSlug });

  return { success: true, hotelId: newHotelId };
}

export async function rejectSubmission(submissionId: string, reason: string, adminId: string, adminEmail: string): Promise<boolean> {
  const submissions = getStoredSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) throw new Error('Submission not found');

  submissions[index].status = 'rejected';
  submissions[index].decisionReason = reason;
  submissions[index].reviewedBy = adminEmail;
  submissions[index].reviewedAt = new Date().toISOString();
  submissions[index].updatedAt = new Date().toISOString();
  saveStoredSubmissions(submissions);

  logAudit('SUBMISSION_REJECTED', 'submission', submissionId, adminId, adminEmail, null, { reason });
  return true;
}

export async function requestSubmissionChanges(submissionId: string, instructions: string, adminId: string, adminEmail: string): Promise<boolean> {
  const submissions = getStoredSubmissions();
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) throw new Error('Submission not found');

  submissions[index].status = 'changes_requested';
  submissions[index].decisionReason = instructions;
  submissions[index].reviewedBy = adminEmail;
  submissions[index].reviewedAt = new Date().toISOString();
  submissions[index].updatedAt = new Date().toISOString();
  saveStoredSubmissions(submissions);

  logAudit('SUBMISSION_CHANGES_REQUESTED', 'submission', submissionId, adminId, adminEmail, null, { instructions });
  return true;
}

export async function getAdminHotelsList(): Promise<Hotel[]> {
  return getStoredHotels();
}

export async function updateHotelStatus(hotelId: string, newStatus: Hotel['status'], adminId: string, adminEmail: string): Promise<boolean> {
  const hotels = getStoredHotels();
  const idx = hotels.findIndex(h => h.id === hotelId);
  if (idx === -1) return false;

  const oldStatus = hotels[idx].status;
  hotels[idx].status = newStatus;
  hotels[idx].updatedAt = new Date().toISOString();
  if (newStatus === 'published' && !hotels[idx].publishedAt) {
    hotels[idx].publishedAt = new Date().toISOString();
  }
  saveStoredHotels(hotels);

  logAudit('HOTEL_STATUS_UPDATED', 'hotel', hotelId, adminId, adminEmail, { status: oldStatus }, { status: newStatus });
  return true;
}

export async function markHotelPriceChecked(hotelId: string, adminId: string, adminEmail: string): Promise<boolean> {
  const hotels = getStoredHotels();
  const idx = hotels.findIndex(h => h.id === hotelId);
  if (idx === -1) return false;

  const nowIso = new Date().toISOString();
  const oldChecked = hotels[idx].priceCheckedAt;
  hotels[idx].priceCheckedAt = nowIso;
  hotels[idx].updatedAt = nowIso;
  saveStoredHotels(hotels);

  logAudit('PRICE_CONFIRMED', 'price', hotelId, adminId, adminEmail, { priceCheckedAt: oldChecked }, { priceCheckedAt: nowIso });
  return true;
}

export async function getAdminReportsList(): Promise<Report[]> {
  return getStoredReports();
}

export async function resolveReport(reportId: string, resolutionNote: string, adminId: string, adminEmail: string): Promise<boolean> {
  const reports = getStoredReports();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx === -1) return false;

  reports[idx].status = 'resolved';
  reports[idx].resolutionNote = resolutionNote;
  reports[idx].resolvedBy = adminEmail;
  reports[idx].resolvedAt = new Date().toISOString();
  saveStoredReports(reports);

  logAudit('REPORT_RESOLVED', 'report', reportId, adminId, adminEmail, null, { resolutionNote });
  return true;
}

export async function getAdminAuditLogs(): Promise<AuditLog[]> {
  initializeLocalStore();
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  return raw ? JSON.parse(raw) : [];
}
