export type AdministrativeLevel = 'division' | 'district' | 'upazila';

export interface LocationItem {
  id: string;
  parentId: string | null;
  nameEn: string;
  nameBn: string;
  slug: string;
  level: AdministrativeLevel;
  sourceCode: string;
  isActive: boolean;
}

export type AccommodationType = 
  | 'hotel'
  | 'guest_house'
  | 'resort'
  | 'dormitory'
  | 'rest_house'
  | 'eco_cottage';

export type RoomType = 
  | 'single'
  | 'double'
  | 'twin'
  | 'family'
  | 'dormitory';

export type BathroomType = 'attached' | 'shared';

export type ListingStatus = 'published' | 'unpublished' | 'archived';

export type VerificationStatus = 'unverified' | 'community_verified' | 'owner_verified' | 'field_checked';

export type SourceType = 'demo' | 'community_submission' | 'owner_submission' | 'field_survey';

export interface HotelRoom {
  id: string;
  hotelId: string;
  roomName: string;
  roomType: RoomType;
  pricePerNight: number;
  maxGuests: number;
  airConditioned: boolean;
  bathroomType: BathroomType;
  availabilityNote?: string;
  updatedAt: string;
}

export interface HotelPhoto {
  id: string;
  hotelId: string;
  storagePath: string; // URL or storage relative path
  caption?: string;
  sortOrder: number;
  isCover: boolean;
  attribution?: string;
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  labelBn: string;
  labelEn: string;
  iconName: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  descriptionBn: string;
  descriptionEn: string;
  accommodationType: AccommodationType;
  locationId: string; // Refers to upazila or district
  locationHierarchy?: {
    division: LocationItem;
    district: LocationItem;
    upazila?: LocationItem;
  };
  address: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  publicWebsiteUrl?: string;
  status: ListingStatus;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  priceFrom: number; // Lowest known room price
  priceCheckedAt: string;
  checkInTime?: string;
  checkOutTime?: string;
  houseRules?: string;
  facilities: string[]; // Facility IDs
  rooms: HotelRoom[];
  photos: HotelPhoto[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export type ContributorRelationship = 
  | 'owner_manager'
  | 'hotel_staff'
  | 'local_contributor'
  | 'past_traveler'
  | 'other';

export interface SubmissionPayload {
  propertyName: string;
  accommodationType: AccommodationType;
  descriptionBn: string;
  descriptionEn?: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactPhone: string;
  publicWebsiteUrl?: string;
  contributorRelationship: ContributorRelationship;
  privateContactEmail: string;
  facilities: string[];
  rooms: Array<{
    roomName: string;
    roomType: RoomType;
    pricePerNight: number;
    maxGuests: number;
    airConditioned: boolean;
    bathroomType: BathroomType;
    availabilityNote?: string;
  }>;
  photos: Array<{
    storagePath: string;
    isCover: boolean;
    caption?: string;
    attribution?: string;
  }>;
}

export interface Submission {
  id: string;
  referenceCode: string;
  submittedBy?: string;
  privateContactEmail: string;
  payload: SubmissionPayload;
  status: SubmissionStatus;
  adminNotes?: string;
  decisionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 
  | 'incorrect_price'
  | 'incorrect_address'
  | 'incorrect_phone'
  | 'closed_property'
  | 'duplicate_property'
  | 'misleading_content'
  | 'unauthorized_image'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  hotelId: string;
  hotelName?: string;
  reportType: ReportType;
  description: string;
  reporterContact?: string;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface PriceHistory {
  id: string;
  hotelId: string;
  roomId: string;
  oldPrice: number;
  newPrice: number;
  source: string;
  checkedBy?: string;
  checkedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  entityType: 'hotel' | 'submission' | 'report' | 'location' | 'price';
  entityId: string;
  beforeData?: any;
  afterData?: any;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'owner' | 'admin' | 'moderator' | 'user';
}

export interface HotelFilterOptions {
  query?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  minPrice?: number;
  maxPrice?: number;
  accommodationType?: AccommodationType | 'all';
  roomType?: RoomType | 'all';
  airConditioned?: boolean | 'all';
  bathroomType?: BathroomType | 'all';
  facilityIds?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'recently_updated' | 'name_asc';
}
