import { LocationItem } from '../types';

export const DIVISIONS: LocationItem[] = [
  { id: 'div-dhaka', parentId: null, nameEn: 'Dhaka', nameBn: 'ঢাকা', slug: 'dhaka', level: 'division', sourceCode: '30', isActive: true },
  { id: 'div-chattogram', parentId: null, nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', slug: 'chattogram', level: 'division', sourceCode: '20', isActive: true },
  { id: 'div-sylhet', parentId: null, nameEn: 'Sylhet', nameBn: 'সিলেট', slug: 'sylhet', level: 'division', sourceCode: '60', isActive: true },
  { id: 'div-rajshahi', parentId: null, nameEn: 'Rajshahi', nameBn: 'রাজশাহী', slug: 'rajshahi', level: 'division', sourceCode: '50', isActive: true },
  { id: 'div-khulna', parentId: null, nameEn: 'Khulna', nameBn: 'খুলনা', slug: 'khulna', level: 'division', sourceCode: '40', isActive: true },
  { id: 'div-barishal', parentId: null, nameEn: 'Barishal', nameBn: 'বরিশাল', slug: 'barishal', level: 'division', sourceCode: '10', isActive: true },
  { id: 'div-rangpur', parentId: null, nameEn: 'Rangpur', nameBn: 'রংপুর', slug: 'rangpur', level: 'division', sourceCode: '55', isActive: true },
  { id: 'div-mymensingh', parentId: null, nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', slug: 'mymensingh', level: 'division', sourceCode: '45', isActive: true },
];

export const DISTRICTS: LocationItem[] = [
  // Dhaka Division (13)
  { id: 'dis-dhaka', parentId: 'div-dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা', slug: 'dhaka', level: 'district', sourceCode: '26', isActive: true },
  { id: 'dis-gazipur', parentId: 'div-dhaka', nameEn: 'Gazipur', nameBn: 'গাজীপুর', slug: 'gazipur', level: 'district', sourceCode: '33', isActive: true },
  { id: 'dis-narayanganj', parentId: 'div-dhaka', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', slug: 'narayanganj', level: 'district', sourceCode: '67', isActive: true },
  { id: 'dis-tangail', parentId: 'div-dhaka', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', slug: 'tangail', level: 'district', sourceCode: '93', isActive: true },
  { id: 'dis-faridpur', parentId: 'div-dhaka', nameEn: 'Faridpur', nameBn: 'ফরিদপুর', slug: 'faridpur', level: 'district', sourceCode: '29', isActive: true },
  { id: 'dis-manikganj', parentId: 'div-dhaka', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', slug: 'manikganj', level: 'district', sourceCode: '56', isActive: true },
  { id: 'dis-munshiganj', parentId: 'div-dhaka', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', slug: 'munshiganj', level: 'district', sourceCode: '59', isActive: true },
  { id: 'dis-narsingdi', parentId: 'div-dhaka', nameEn: 'Narsingdi', nameBn: 'নরসিংদী', slug: 'narsingdi', level: 'district', sourceCode: '68', isActive: true },
  { id: 'dis-kishoreganj', parentId: 'div-dhaka', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', slug: 'kishoreganj', level: 'district', sourceCode: '48', isActive: true },
  { id: 'dis-gopalganj', parentId: 'div-dhaka', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', slug: 'gopalganj', level: 'district', sourceCode: '35', isActive: true },
  { id: 'dis-madaripur', parentId: 'div-dhaka', nameEn: 'Madaripur', nameBn: 'মাদারীপুর', slug: 'madaripur', level: 'district', sourceCode: '54', isActive: true },
  { id: 'dis-rajbari', parentId: 'div-dhaka', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', slug: 'rajbari', level: 'district', sourceCode: '82', isActive: true },
  { id: 'dis-shariatpur', parentId: 'div-dhaka', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', slug: 'shariatpur', level: 'district', sourceCode: '86', isActive: true },

  // Chattogram Division (11)
  { id: 'dis-chattogram', parentId: 'div-chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', slug: 'chattogram', level: 'district', sourceCode: '15', isActive: true },
  { id: 'dis-coxsbazar', parentId: 'div-chattogram', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', slug: 'coxs-bazar', level: 'district', sourceCode: '22', isActive: true },
  { id: 'dis-rangamati', parentId: 'div-chattogram', nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', slug: 'rangamati', level: 'district', sourceCode: '84', isActive: true },
  { id: 'dis-bandarban', parentId: 'div-chattogram', nameEn: 'Bandarban', nameBn: 'বান্দরবান', slug: 'bandarban', level: 'district', sourceCode: '03', isActive: true },
  { id: 'dis-khagrachhari', parentId: 'div-chattogram', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', slug: 'khagrachhari', level: 'district', sourceCode: '46', isActive: true },
  { id: 'dis-cumilla', parentId: 'div-chattogram', nameEn: 'Cumilla', nameBn: 'কুমিল্লা', slug: 'cumilla', level: 'district', sourceCode: '19', isActive: true },
  { id: 'dis-noakhali', parentId: 'div-chattogram', nameEn: 'Noakhali', nameBn: 'নোয়াখালী', slug: 'noakhali', level: 'district', sourceCode: '75', isActive: true },
  { id: 'dis-feni', parentId: 'div-chattogram', nameEn: 'Feni', nameBn: 'ফেনী', slug: 'feni', level: 'district', sourceCode: '30', isActive: true },
  { id: 'dis-brahmanbaria', parentId: 'div-chattogram', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', slug: 'brahmanbaria', level: 'district', sourceCode: '12', isActive: true },
  { id: 'dis-chandpur', parentId: 'div-chattogram', nameEn: 'Chandpur', nameBn: 'চাঁদপুর', slug: 'chandpur', level: 'district', sourceCode: '13', isActive: true },
  { id: 'dis-lakshmipur', parentId: 'div-chattogram', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', slug: 'lakshmipur', level: 'district', sourceCode: '51', isActive: true },

  // Sylhet Division (4)
  { id: 'dis-sylhet', parentId: 'div-sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট', slug: 'sylhet', level: 'district', sourceCode: '91', isActive: true },
  { id: 'dis-moulvibazar', parentId: 'div-sylhet', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', slug: 'moulvibazar', level: 'district', sourceCode: '58', isActive: true },
  { id: 'dis-habiganj', parentId: 'div-sylhet', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', slug: 'habiganj', level: 'district', sourceCode: '36', isActive: true },
  { id: 'dis-sunamganj', parentId: 'div-sylhet', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', slug: 'sunamganj', level: 'district', sourceCode: '90', isActive: true },

  // Rajshahi Division (8)
  { id: 'dis-rajshahi', parentId: 'div-rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী', slug: 'rajshahi', level: 'district', sourceCode: '81', isActive: true },
  { id: 'dis-bogura', parentId: 'div-rajshahi', nameEn: 'Bogura', nameBn: 'বগুড়া', slug: 'bogura', level: 'district', sourceCode: '10', isActive: true },
  { id: 'dis-pabna', parentId: 'div-rajshahi', nameEn: 'Pabna', nameBn: 'পাবনা', slug: 'pabna', level: 'district', sourceCode: '76', isActive: true },
  { id: 'dis-sirajganj', parentId: 'div-rajshahi', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', slug: 'sirajganj', level: 'district', sourceCode: '88', isActive: true },
  { id: 'dis-naogaon', parentId: 'div-rajshahi', nameEn: 'Naogaon', nameBn: 'নওগাঁ', slug: 'naogaon', level: 'district', sourceCode: '64', isActive: true },
  { id: 'dis-natore', parentId: 'div-rajshahi', nameEn: 'Natore', nameBn: 'নাটোর', slug: 'natore', level: 'district', sourceCode: '69', isActive: true },
  { id: 'dis-chapainawabganj', parentId: 'div-rajshahi', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', slug: 'chapainawabganj', level: 'district', sourceCode: '70', isActive: true },
  { id: 'dis-joypurhat', parentId: 'div-rajshahi', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', slug: 'joypurhat', level: 'district', sourceCode: '38', isActive: true },

  // Khulna Division (10)
  { id: 'dis-khulna', parentId: 'div-khulna', nameEn: 'Khulna', nameBn: 'খুলনা', slug: 'khulna', level: 'district', sourceCode: '47', isActive: true },
  { id: 'dis-jashore', parentId: 'div-khulna', nameEn: 'Jashore', nameBn: 'যশোর', slug: 'jashore', level: 'district', sourceCode: '41', isActive: true },
  { id: 'dis-satkhira', parentId: 'div-khulna', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', slug: 'satkhira', level: 'district', sourceCode: '87', isActive: true },
  { id: 'dis-bagerhat', parentId: 'div-khulna', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', slug: 'bagerhat', level: 'district', sourceCode: '01', isActive: true },
  { id: 'dis-kushtia', parentId: 'div-khulna', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', slug: 'kushtia', level: 'district', sourceCode: '50', isActive: true },
  { id: 'dis-chuadanga', parentId: 'div-khulna', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', slug: 'chuadanga', level: 'district', sourceCode: '18', isActive: true },
  { id: 'dis-meherpur', parentId: 'div-khulna', nameEn: 'Meherpur', nameBn: 'মেহেরপুর', slug: 'meherpur', level: 'district', sourceCode: '57', isActive: true },
  { id: 'dis-jhenaidah', parentId: 'div-khulna', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', slug: 'jhenaidah', level: 'district', sourceCode: '44', isActive: true },
  { id: 'dis-magura', parentId: 'div-khulna', nameEn: 'Magura', nameBn: 'মাগুরা', slug: 'magura', level: 'district', sourceCode: '55', isActive: true },
  { id: 'dis-narail', parentId: 'div-khulna', nameEn: 'Narail', nameBn: 'নড়াইল', slug: 'narail', level: 'district', sourceCode: '65', isActive: true },

  // Barishal Division (6)
  { id: 'dis-barishal', parentId: 'div-barishal', nameEn: 'Barishal', nameBn: 'বরিশাল', slug: 'barishal', level: 'district', sourceCode: '06', isActive: true },
  { id: 'dis-patuakhali', parentId: 'div-barishal', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', slug: 'patuakhali', level: 'district', sourceCode: '78', isActive: true },
  { id: 'dis-bhola', parentId: 'div-barishal', nameEn: 'Bhola', nameBn: 'ভোলা', slug: 'bhola', level: 'district', sourceCode: '09', isActive: true },
  { id: 'dis-pirojpur', parentId: 'div-barishal', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', slug: 'pirojpur', level: 'district', sourceCode: '79', isActive: true },
  { id: 'dis-barguna', parentId: 'div-barishal', nameEn: 'Barguna', nameBn: 'বরগুনা', slug: 'barguna', level: 'district', sourceCode: '04', isActive: true },
  { id: 'dis-jhalokati', parentId: 'div-barishal', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', slug: 'jhalokati', level: 'district', sourceCode: '42', isActive: true },

  // Rangpur Division (8)
  { id: 'dis-rangpur', parentId: 'div-rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর', slug: 'rangpur', level: 'district', sourceCode: '85', isActive: true },
  { id: 'dis-dinajpur', parentId: 'div-rangpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', slug: 'dinajpur', level: 'district', sourceCode: '27', isActive: true },
  { id: 'dis-panchagarh', parentId: 'div-rangpur', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', slug: 'panchagarh', level: 'district', sourceCode: '77', isActive: true },
  { id: 'dis-thakurgaon', parentId: 'div-rangpur', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', slug: 'thakurgaon', level: 'district', sourceCode: '94', isActive: true },
  { id: 'dis-nilphamari', parentId: 'div-rangpur', nameEn: 'Nilphamari', nameBn: 'নীলফামারী', slug: 'nilphamari', level: 'district', sourceCode: '73', isActive: true },
  { id: 'dis-lalmonirhat', parentId: 'div-rangpur', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', slug: 'lalmonirhat', level: 'district', sourceCode: '52', isActive: true },
  { id: 'dis-kurigram', parentId: 'div-rangpur', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', slug: 'kurigram', level: 'district', sourceCode: '49', isActive: true },
  { id: 'dis-gaibandha', parentId: 'div-rangpur', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', slug: 'gaibandha', level: 'district', sourceCode: '32', isActive: true },

  // Mymensingh Division (4)
  { id: 'dis-mymensingh', parentId: 'div-mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', slug: 'mymensingh', level: 'district', sourceCode: '61', isActive: true },
  { id: 'dis-netrokona', parentId: 'div-mymensingh', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', slug: 'netrokona', level: 'district', sourceCode: '72', isActive: true },
  { id: 'dis-jamalpur', parentId: 'div-mymensingh', nameEn: 'Jamalpur', nameBn: 'জামালপুর', slug: 'jamalpur', level: 'district', sourceCode: '39', isActive: true },
  { id: 'dis-sherpur', parentId: 'div-mymensingh', nameEn: 'Sherpur', nameBn: 'শেরপুর', slug: 'sherpur', level: 'district', sourceCode: '89', isActive: true },
];

import allUpazilasJson from './allUpazilas.json';

export const UPAZILAS: LocationItem[] = allUpazilasJson as LocationItem[];

export const ALL_LOCATIONS: LocationItem[] = [
  ...DIVISIONS,
  ...DISTRICTS,
  ...UPAZILAS,
];

export function getDivisions(): LocationItem[] {
  return DIVISIONS.filter(l => l.isActive);
}

export function getAllDistricts(): LocationItem[] {
  return DISTRICTS.filter(d => d.isActive);
}

export function getAllUpazilas(): LocationItem[] {
  return UPAZILAS.filter(u => u.isActive);
}

export function getDistrictsByDivision(divisionId?: string): LocationItem[] {
  if (!divisionId || divisionId === 'all') {
    return DISTRICTS.filter(d => d.isActive);
  }
  return DISTRICTS.filter(d => d.parentId === divisionId && d.isActive);
}

export function getUpazilasByDistrict(districtId?: string): LocationItem[] {
  if (!districtId || districtId === 'all') {
    return UPAZILAS.filter(u => u.isActive);
  }
  return UPAZILAS.filter(u => u.parentId === districtId && u.isActive);
}

export function getUpazilasByDivision(divisionId: string): LocationItem[] {
  if (!divisionId || divisionId === 'all') {
    return UPAZILAS.filter(u => u.isActive);
  }
  const districtIds = new Set(
    DISTRICTS.filter(d => d.parentId === divisionId).map(d => d.id)
  );
  return UPAZILAS.filter(u => districtIds.has(u.parentId || '') && u.isActive);
}

export function findLocationById(id: string): LocationItem | undefined {
  return ALL_LOCATIONS.find(l => l.id === id);
}

export function findDistrictById(id: string): LocationItem | undefined {
  return DISTRICTS.find(d => d.id === id);
}

export function findUpazilaById(id: string): LocationItem | undefined {
  return UPAZILAS.find(u => u.id === id);
}

export function getLocationHierarchy(locationId: string): {
  division: LocationItem;
  district: LocationItem;
  upazila?: LocationItem;
} | undefined {
  const item = findLocationById(locationId);
  if (!item) return undefined;

  if (item.level === 'upazila') {
    const district = findLocationById(item.parentId || '');
    if (!district) return undefined;
    const division = findLocationById(district.parentId || '');
    if (!division) return undefined;
    return { division, district, upazila: item };
  }

  if (item.level === 'district') {
    const division = findLocationById(item.parentId || '');
    if (!division) return undefined;
    return { division, district: item };
  }

  return undefined;
}

export function searchLocations(query: string): LocationItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_LOCATIONS.filter(l => 
    l.isActive && (
      l.nameEn.toLowerCase().includes(q) ||
      l.nameBn.includes(q) ||
      l.slug.includes(q)
    )
  );
}

export const POPULAR_TRAVEL_UPAZILAS = [
  'upz-baghaichhari',      // বাঘাইছড়ি (সাজেক)
  'upz-coxsbazar-sadar',   // কক্সবাজার সদর
  'upz-sreemangal',        // শ্রীমঙ্গল
  'upz-kalapara',          // কলাপাড়া (কুয়াকাটা)
  'upz-teknaf',            // টেকনাফ
  'upz-bandarban-sadar',   // বান্দরবান সদর
  'upz-gowainghat',        // গোয়াইনঘাট (জাফলং)
  'upz-mirpur',            // মিরপুর (ঢাকা)
];

