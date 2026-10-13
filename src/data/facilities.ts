import { Facility } from '../types';

export const ALL_FACILITIES: Facility[] = [
  { id: 'fac-wifi', name: 'wifi', labelBn: 'ফ্রি ওয়াই-ফাই', labelEn: 'Free Wi-Fi', iconName: 'Wifi' },
  { id: 'fac-generator', name: 'generator', labelBn: 'জেনারেটর / ব্যাকআপ বিদ্যুৎ', labelEn: 'Power Backup / Generator', iconName: 'Zap' },
  { id: 'fac-ac', name: 'ac', labelBn: 'এয়ার কন্ডিশনার (AC)', labelEn: 'Air Conditioning', iconName: 'Wind' },
  { id: 'fac-geyser', name: 'geyser', labelBn: 'গিজার / গরম পানি', labelEn: 'Hot Water / Geyser', iconName: 'Flame' },
  { id: 'fac-attached-bath', name: 'attached_bath', labelBn: 'সংযুক্ত বাথরুম', labelEn: 'Attached Bathroom', iconName: 'Bath' },
  { id: 'fac-restaurant', name: 'restaurant', labelBn: 'খাবারের ব্যবস্থা / রেস্তোরাঁ', labelEn: 'In-house Dining / Restaurant', iconName: 'Utensils' },
  { id: 'fac-parking', name: 'parking', labelBn: 'গাড়ি পার্কিং সুবিধা', labelEn: 'Car Parking', iconName: 'Car' },
  { id: 'fac-cctv', name: 'cctv', labelBn: 'নিরাপত্তা ও সিসিটিভি', labelEn: '24/7 Security & CCTV', iconName: 'ShieldCheck' },
  { id: 'fac-room-service', name: 'room_service', labelBn: 'রুম সার্ভিস', labelEn: 'Room Service', iconName: 'BellRing' },
  { id: 'fac-tv', name: 'tv', labelBn: 'টেলিভিশন', labelEn: 'Television', iconName: 'Tv' },
  { id: 'fac-family', name: 'family_friendly', labelBn: 'পারিবারিক পরিবেশ', labelEn: 'Family Friendly', iconName: 'Users' },
  { id: 'fac-balcony', name: 'balcony_view', labelBn: 'বারান্দা / ভিউ', labelEn: 'Balcony / Scenic View', iconName: 'Sunrise' },
];

export function getFacilityById(id: string): Facility | undefined {
  return ALL_FACILITIES.find(f => f.id === id);
}
