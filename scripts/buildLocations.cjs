// Script to generate complete Bangladesh administrative upazila dataset
const fs = require('fs');
const path = require('path');

const UPAZILAS_BY_DISTRICT = {
  // DHAKA DIVISION (13 Districts)
  'dis-dhaka': [
    { en: 'Dhamrai', bn: 'ধামরাই', slug: 'dhamrai' },
    { en: 'Dohar', bn: 'দোহার', slug: 'dohar' },
    { en: 'Keraniganj', bn: 'কেরানীগঞ্জ', slug: 'keraniganj' },
    { en: 'Nawabganj', bn: 'নবাবগঞ্জ', slug: 'nawabganj' },
    { en: 'Savar', bn: 'সাভার', slug: 'savar' },
    { en: 'Mirpur', bn: 'মিরপুর', slug: 'mirpur' },
    { en: 'Uttara', bn: 'উত্তরা', slug: 'uttara' },
    { en: 'Dhanmondi', bn: 'ধানমন্ডি', slug: 'dhanmondi' },
    { en: 'Gulshan', bn: 'গুলশান', slug: 'gulshan' },
    { en: 'Kotwali (Sadarghat)', bn: 'কোতোয়ালি (সদরঘাট)', slug: 'sadarghat' },
    { en: 'Mohammadpur', bn: 'মোহাম্মদপুর', slug: 'mohammadpur' },
    { en: 'Tejgaon', bn: 'তেজগাঁও', slug: 'tejgaon' }
  ],
  'dis-gazipur': [
    { en: 'Gazipur Sadar', bn: 'গাজীপুর সদর', slug: 'gazipur-sadar' },
    { en: 'Kaliakair', bn: 'কালিয়াকৈর', slug: 'kaliakair' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ', slug: 'kaliganj-gazipur' },
    { en: 'Kapasia', bn: 'কাপাসিয়া', slug: 'kapasia' },
    { en: 'Sreepur', bn: 'শ্রীপুর', slug: 'sreepur-gazipur' }
  ],
  'dis-narayanganj': [
    { en: 'Narayanganj Sadar', bn: 'নারায়ণগঞ্জ সদর', slug: 'narayanganj-sadar' },
    { en: 'Araihazar', bn: 'আড়াইহাজার', slug: 'araihazar' },
    { en: 'Bandar', bn: 'বন্দর', slug: 'bandar' },
    { en: 'Rupganj', bn: 'রূপগঞ্জ', slug: 'rupganj' },
    { en: 'Sonargaon', bn: 'সোনারগাঁ', slug: 'sonargaon' }
  ],
  'dis-tangail': [
    { en: 'Tangail Sadar', bn: 'টাঙ্গাইল সদর', slug: 'tangail-sadar' },
    { en: 'Basail', bn: 'বাসাইল', slug: 'basail' },
    { en: 'Bhuapur', bn: 'ভূঞাপুর', slug: 'bhuapur' },
    { en: 'Delduar', bn: 'দেলদুয়ার', slug: 'delduar' },
    { en: 'Ghatail', bn: 'ঘাটাইল', slug: 'ghatail' },
    { en: 'Gopalpur', bn: 'গোপালপুর', slug: 'gopalpur' },
    { en: 'Kalihati', bn: 'কালিহাতী', slug: 'kalihati' },
    { en: 'Madhupur', bn: 'মধুপুর', slug: 'madhupur' },
    { en: 'Mirzapur', bn: 'মির্জাপুর', slug: 'mirzapur' },
    { en: 'Nagarpur', bn: 'নাগরপুর', slug: 'nagarpur' },
    { en: 'Sakhipur', bn: 'সখীপুর', slug: 'sakhipur' },
    { en: 'Dhanbari', bn: 'ধনবাড়ী', slug: 'dhanbari' }
  ],
  'dis-faridpur': [
    { en: 'Faridpur Sadar', bn: 'ফরিদপুর সদর', slug: 'faridpur-sadar' },
    { en: 'Alfadanga', bn: 'আলফাডাঙ্গা', slug: 'alfadanga' },
    { en: 'Bhanga', bn: 'ভাঙ্গা', slug: 'bhanga' },
    { en: 'Boalmari', bn: 'বোয়ালমারী', slug: 'boalmari' },
    { en: 'Charbhadrasan', bn: 'চরভদ্রাসন', slug: 'charbhadrasan' },
    { en: 'Madhukhali', bn: 'মধুখালী', slug: 'madhukhali' },
    { en: 'Nagarkanda', bn: 'নগরকান্দা', slug: 'nagarkanda' },
    { en: 'Sadarpur', bn: 'সদরপুর', slug: 'sadarpur' },
    { en: 'Saltha', bn: 'সালথা', slug: 'saltha' }
  ],
  'dis-manikganj': [
    { en: 'Manikganj Sadar', bn: 'মানিকগঞ্জ সদর', slug: 'manikganj-sadar' },
    { en: 'Daulatpur', bn: 'দৌলতপুর', slug: 'daulatpur-manikganj' },
    { en: 'Ghiror', bn: 'ঘিওর', slug: 'ghior' },
    { en: 'Harirampur', bn: 'হরিরামপুর', slug: 'harirampur' },
    { en: 'Saturia', bn: 'সাটুরিয়া', slug: 'saturia' },
    { en: 'Shivalaya', bn: 'শিবালয়', slug: 'shivalaya' },
    { en: 'Singair', bn: 'সিংগাইর', slug: 'singair' }
  ],
  'dis-munshiganj': [
    { en: 'Munshiganj Sadar', bn: 'মুন্সীগঞ্জ সদর', slug: 'munshiganj-sadar' },
    { en: 'Gazaria', bn: 'গজারিয়া', slug: 'gazaria' },
    { en: 'Lohajang', bn: 'লৌহজং', slug: 'lohajang' },
    { en: 'Sirajdikhan', bn: 'সিরাজদিখান', slug: 'sirajdikhan' },
    { en: 'Sreenagar', bn: 'শ্রীনগর', slug: 'sreenagar' },
    { en: 'Tongibari', bn: 'টঙ্গিবাড়ী', slug: 'tongibari' }
  ],
  'dis-narsingdi': [
    { en: 'Narsingdi Sadar', bn: 'নরসিংদী সদর', slug: 'narsingdi-sadar' },
    { en: 'Belabo', bn: 'বেলাবো', slug: 'belabo' },
    { en: 'Monohardi', bn: 'মনোহরদী', slug: 'monohardi' },
    { en: 'Palash', bn: 'পলাশ', slug: 'palash' },
    { en: 'Raipura', bn: 'রায়পুরা', slug: 'raipura' },
    { en: 'Shibpur', bn: 'শিবপুর', slug: 'shibpur' }
  ],
  'dis-kishoreganj': [
    { en: 'Kishoreganj Sadar', bn: 'কিশোরগঞ্জ সদর', slug: 'kishoreganj-sadar' },
    { en: 'Austagram', bn: 'অষ্টগ্রাম', slug: 'austagram' },
    { en: 'Bajitpur', bn: 'বাজিতপুর', slug: 'bajitpur' },
    { en: 'Bhairab', bn: 'ভৈরব', slug: 'bhairab' },
    { en: 'Hossainpur', bn: 'হোসেনপুর', slug: 'hossainpur' },
    { en: 'Itna', bn: 'ইটনা', slug: 'itna' },
    { en: 'Karimganj', bn: 'করিমগঞ্জ', slug: 'karimganj' },
    { en: 'Katiadi', bn: 'কটিয়াদী', slug: 'katiadi' },
    { en: 'Kuliarchar', bn: 'কুলিয়ারচর', slug: 'kuliarchar' },
    { en: 'Mithamain', bn: 'মিঠামইন', slug: 'mithamain' },
    { en: 'Nikli', bn: 'নিকলী', slug: 'nikli' },
    { en: 'Pakundia', bn: 'পাকুন্দিয়া', slug: 'pakundia' },
    { en: 'Tarail', bn: 'তাড়াইল', slug: 'tarail' }
  ],
  'dis-gopalganj': [
    { en: 'Gopalganj Sadar', bn: 'গোপালগঞ্জ সদর', slug: 'gopalganj-sadar' },
    { en: 'Kashiani', bn: 'কাশিয়ানী', slug: 'kashiani' },
    { en: 'Kotalipara', bn: 'কোটালীপাড়া', slug: 'kotalipara' },
    { en: 'Muksudpur', bn: 'মুকসুদপুর', slug: 'muksudpur' },
    { en: 'Tungipara', bn: 'টুঙ্গিপাড়া', slug: 'tungipara' }
  ],
  'dis-madaripur': [
    { en: 'Madaripur Sadar', bn: 'মাদারীপুর সদর', slug: 'madaripur-sadar' },
    { en: 'Kalkini', bn: 'কালকিনি', slug: 'kalkini' },
    { en: 'Rajoir', bn: 'রাজৈর', slug: 'rajoir' },
    { en: 'Shibchar', bn: 'শিবচর', slug: 'shibchar' },
    { en: 'Dasar', bn: 'ডাসার', slug: 'dasar' }
  ],
  'dis-rajbari': [
    { en: 'Rajbari Sadar', bn: 'রাজবাড়ী সদর', slug: 'rajbari-sadar' },
    { en: 'Baliakandi', bn: 'বালিয়াকান্দি', slug: 'baliakandi' },
    { en: 'Goalandaghat', bn: 'গোয়ালন্দঘাট', slug: 'goalandaghat' },
    { en: 'Pangsha', bn: 'পাংশা', slug: 'pangsha' },
    { en: 'Kalukhali', bn: 'কালুখালী', slug: 'kalukhali' }
  ],
  'dis-shariatpur': [
    { en: 'Shariatpur Sadar', bn: 'শরীয়তপুর সদর', slug: 'shariatpur-sadar' },
    { en: 'Bhedarganj', bn: 'ভেদরগঞ্জ', slug: 'bhedarganj' },
    { en: 'Damudya', bn: 'ডামুড্যা', slug: 'damudya' },
    { en: 'Gosairhat', bn: 'গোসাইরহাট', slug: 'gosairhat' },
    { en: 'Naria', bn: 'নড়িয়া', slug: 'naria' },
    { en: 'Zanjira', bn: 'জাজিরা', slug: 'zanjira' }
  ],

  // CHATTOGRAM DIVISION (11 Districts)
  'dis-chattogram': [
    { en: 'Chattogram Sadar (Agrabad)', bn: 'চট্টগ্রাম সদর (আগ্রাবাদ)', slug: 'chattogram-sadar' },
    { en: 'Anwara', bn: 'আনোয়ারা', slug: 'anwara' },
    { en: 'Banshkhali', bn: 'বাঁশখালী', slug: 'banshkhali' },
    { en: 'Boalkhali', bn: 'বোয়ালখালী', slug: 'boalkhali' },
    { en: 'Chandanaish', bn: 'চন্দনাইশ', slug: 'chandanaish' },
    { en: 'Fatikchhari', bn: 'ফটিকছড়ি', slug: 'fatikchhari' },
    { en: 'Hathazari', bn: 'হাটহাজারী', slug: 'hathazari' },
    { en: 'Lohagara', bn: 'লোহাগাড়া', slug: 'lohagara' },
    { en: 'Mirsharai', bn: 'মীরসরাই', slug: 'mirsharai' },
    { en: 'Patiya', bn: 'পটিয়া', slug: 'patiya' },
    { en: 'Rangunia', bn: 'রাঙ্গুনিয়া', slug: 'rangunia' },
    { en: 'Raozan', bn: 'রাউজান', slug: 'raozan' },
    { en: 'Sandwip', bn: 'সন্দ্বীপ', slug: 'sandwip' },
    { en: 'Satkania', bn: 'সাতকানিয়া', slug: 'satkania' },
    { en: 'Sitakunda', bn: 'সীতাকুণ্ড', slug: 'sitakunda' },
    { en: 'Karnafuli', bn: 'কর্ণফুলী', slug: 'karnafuli' }
  ],
  'dis-coxsbazar': [
    { en: "Cox's Bazar Sadar", bn: 'কক্সবাজার সদর', slug: 'coxsbazar-sadar' },
    { en: 'Chakaria', bn: 'চকোরিয়া', slug: 'chakaria' },
    { en: 'Kutubdia', bn: 'কুতুবদিয়া', slug: 'kutubdia' },
    { en: 'Maheshkhali', bn: 'মহেশখালী', slug: 'maheshkhali' },
    { en: 'Ramu', bn: 'রামু', slug: 'ramu' },
    { en: 'Teknaf', bn: 'টেকনাফ', slug: 'teknaf' },
    { en: 'Ukhia', bn: 'উখিয়া', slug: 'ukhia' },
    { en: 'Pekua', bn: 'পেকুয়া', slug: 'pekua' },
    { en: "St. Martin's Island", bn: 'সেন্টমার্টিন দ্বীপ', slug: 'saint-martin' },
    { en: 'Eidgaon', bn: 'ঈদগাঁও', slug: 'eidgaon' }
  ],
  'dis-rangamati': [
    { en: 'Rangamati Sadar', bn: 'রাঙ্গামাটি সদর', slug: 'rangamati-sadar' },
    { en: 'Baghaichhari (Sajek)', bn: 'বাঘাইছড়ি (সাজেক)', slug: 'baghaichhari-sajek' },
    { en: 'Barkal', bn: 'বরকল', slug: 'barkal' },
    { en: 'Belaichhari', bn: 'বিলাইছড়ি', slug: 'belaichhari' },
    { en: 'Juraichhari', bn: 'জুরাইছড়ি', slug: 'juraichhari' },
    { en: 'Kaptai', bn: 'কাপ্তাই', slug: 'kaptai' },
    { en: 'Kawkhali', bn: 'কাউখালী', slug: 'kawkhali-rangamati' },
    { en: 'Langadu', bn: 'লংগদু', slug: 'langadu' },
    { en: 'Naniarchar', bn: 'নানিয়ারচর', slug: 'naniarchar' },
    { en: 'Rajasthali', bn: 'রাজস্থলী', slug: 'rajasthali' }
  ],
  'dis-bandarban': [
    { en: 'Bandarban Sadar', bn: 'বান্দরবান সদর', slug: 'bandarban-sadar' },
    { en: 'Ali Kadam', bn: 'আলীকদম', slug: 'ali-kadam' },
    { en: 'Lama', bn: 'লামা', slug: 'lama' },
    { en: 'Naikhongchhari', bn: 'নাইক্ষ্যংছড়ি', slug: 'naikhongchhari' },
    { en: 'Rowangchhari', bn: 'রোয়াংছড়ি', slug: 'rowangchhari' },
    { en: 'Ruma (Boga Lake)', bn: 'রুমা (বগা লেক)', slug: 'ruma' },
    { en: 'Thanchi', bn: 'থানচি', slug: 'thanchi' }
  ],
  'dis-khagrachhari': [
    { en: 'Khagrachhari Sadar', bn: 'খাগড়াছড়ি সদর', slug: 'khagrachhari-sadar' },
    { en: 'Dighinala', bn: 'দীঘিনালা', slug: 'dighinala' },
    { en: 'Lakshmichhari', bn: 'লক্ষ্মীছড়ি', slug: 'lakshmichhari' },
    { en: 'Mahalchhari', bn: 'মহালছড়ি', slug: 'mahalchhari' },
    { en: 'Manikchhari', bn: 'মানিকছড়ি', slug: 'manikchhari' },
    { en: 'Matiranga', bn: 'মাটিরাঙ্গা', slug: 'matiranga' },
    { en: 'Panchhari', bn: 'পানছড়ি', slug: 'panchhari' },
    { en: 'Ramgarh', bn: 'রামগড়', slug: 'ramgarh' },
    { en: 'Guimara', bn: 'গুইমারা', slug: 'guimara' }
  ],
  'dis-cumilla': [
    { en: 'Cumilla Sadar', bn: 'কুমিল্লা সদর', slug: 'cumilla-sadar' },
    { en: 'Barura', bn: 'বরুড়া', slug: 'barura' },
    { en: 'Brahmanpara', bn: 'ব্রাহ্মণপাড়া', slug: 'brahmanpara' },
    { en: 'Burichang', bn: 'বুড়িচং', slug: 'burichang' },
    { en: 'Chandina', bn: 'চান্দিনা', slug: 'chandina' },
    { en: 'Chauddagram', bn: 'চৌদ্দগ্রাম', slug: 'chauddagram' },
    { en: 'Daudkandi', bn: 'দাউদকান্দি', slug: 'daudkandi' },
    { en: 'Debidwar', bn: 'দেবিদ্বার', slug: 'debidwar' },
    { en: 'Homna', bn: 'হোমনা', slug: 'homna' },
    { en: 'Laksam', bn: 'লাকসাম', slug: 'laksam' },
    { en: 'Muradnagar', bn: 'মুরাদনগর', slug: 'muradnagar' },
    { en: 'Nangalkot', bn: 'নাঙ্গলকোট', slug: 'nangalkot' },
    { en: 'Meghna', bn: 'মেঘনা', slug: 'meghna' },
    { en: 'Titas', bn: 'তিতাস', slug: 'titas' },
    { en: 'Monohargonj', bn: 'মনোহরগঞ্জ', slug: 'monohargonj' },
    { en: 'Lalmai', bn: 'লালমাই', slug: 'lalmai' }
  ],
  'dis-noakhali': [
    { en: 'Noakhali Sadar', bn: 'নোয়াখালী সদর', slug: 'noakhali-sadar' },
    { en: 'Begumganj', bn: 'বেগমগঞ্জ', slug: 'begumganj' },
    { en: 'Chatkhil', bn: 'চাটখিল', slug: 'chatkhil' },
    { en: 'Companiganj', bn: 'কোম্পানীগঞ্জ', slug: 'companiganj-noakhali' },
    { en: 'Hatiya', bn: 'হাতিয়া', slug: 'hatiya' },
    { en: 'Senbagh', bn: 'সেনবাগ', slug: 'senbagh' },
    { en: 'Sonaimuri', bn: 'সোনাইমুড়ী', slug: 'sonaimuri' },
    { en: 'Subarnachar', bn: 'সুবর্ণচর', slug: 'subarnachar' },
    { en: 'Kabirhat', bn: 'কবিরহাট', slug: 'kabirhat' }
  ],
  'dis-feni': [
    { en: 'Feni Sadar', bn: 'ফেনী সদর', slug: 'feni-sadar' },
    { en: 'Chhagalnaiya', bn: 'ছাগলনাইয়া', slug: 'chhagalnaiya' },
    { en: 'Daganbhuiyan', bn: 'দাগনভূঞা', slug: 'daganbhuiyan' },
    { en: 'Parshuram', bn: 'পরশুরাম', slug: 'parshuram' },
    { en: 'Fulgazi', bn: 'ফুলগাজী', slug: 'fulgazi' },
    { en: 'Sonagazi', bn: 'সোনাগাজী', slug: 'sonagazi' }
  ],
  'dis-brahmanbaria': [
    { en: 'Brahmanbaria Sadar', bn: 'ব্রাহ্মণবাড়িয়া সদর', slug: 'brahmanbaria-sadar' },
    { en: 'Ashuganj', bn: 'আশুগঞ্জ', slug: 'ashuganj' },
    { en: 'Bancharampur', bn: 'বাঞ্ছারামপুর', slug: 'bancharampur' },
    { en: 'Kasba', bn: 'কসবা', slug: 'kasba' },
    { en: 'Nabinagar', bn: 'নবীনগর', slug: 'nabinagar' },
    { en: 'Nasirnagar', bn: 'নাসিরনগর', slug: 'nasirnagar' },
    { en: 'Sarail', bn: 'সরাইল', slug: 'sarail' },
    { en: 'Akhaura', bn: 'আখাউড়া', slug: 'akhaura' },
    { en: 'Bijoynagar', bn: 'বিজয়নগর', slug: 'bijoynagar' }
  ],
  'dis-chandpur': [
    { en: 'Chandpur Sadar', bn: 'চাঁদপুর সদর', slug: 'chandpur-sadar' },
    { en: 'Faridganj', bn: 'ফরিদগঞ্জ', slug: 'faridganj' },
    { en: 'Haimchar', bn: 'হাইমচর', slug: 'haimchar' },
    { en: 'Haziganj', bn: 'হাজীগঞ্জ', slug: 'haziganj' },
    { en: 'Kachua', bn: 'কচুয়া', slug: 'kachua' },
    { en: 'Matlab Dakshin', bn: 'মতলব দক্ষিণ', slug: 'matlab-dakshin' },
    { en: 'Matlab Uttar', bn: 'মতলব উত্তর', slug: 'matlab-uttar' },
    { en: 'Shahrasti', bn: 'শাহরাস্তি', slug: 'shahrasti' }
  ],
  'dis-lakshmipur': [
    { en: 'Lakshmipur Sadar', bn: 'লক্ষ্মীপুর সদর', slug: 'lakshmipur-sadar' },
    { en: 'Raipur', bn: 'রায়পুর', slug: 'raipur' },
    { en: 'Ramganj', bn: 'রামগঞ্জ', slug: 'ramganj' },
    { en: 'Ramgati', bn: 'রামগতি', slug: 'ramgati' },
    { en: 'Kamalnagar', bn: 'কমলনগর', slug: 'kamalnagar' }
  ],

  // SYLHET DIVISION (4 Districts)
  'dis-sylhet': [
    { en: 'Sylhet Sadar', bn: 'সিলেট সদর', slug: 'sylhet-sadar' },
    { en: 'Balaganj', bn: 'বালাগঞ্জ', slug: 'balaganj' },
    { en: 'Beanibazar', bn: 'বিয়ানীবাজার', slug: 'beanibazar' },
    { en: 'Bishwanath', bn: 'বিশ্বনাথ', slug: 'bishwanath' },
    { en: 'Companiganj (Bichnakandi)', bn: 'কোম্পানীগঞ্জ (বিছনাকান্দি)', slug: 'companiganj-bichnakandi' },
    { en: 'Fenchuganj', bn: 'ফেঞ্চুগঞ্জ', slug: 'fenchuganj' },
    { en: 'Golapganj', bn: 'গোলাপগঞ্জ', slug: 'golapganj' },
    { en: 'Gowainghat (Jaflong)', bn: 'গোয়াইনঘাট (জাফলং)', slug: 'gowainghat-jaflong' },
    { en: 'Jaintiapur', bn: 'জৈন্তাপুর', slug: 'jaintiapur' },
    { en: 'Kanaighat', bn: 'কানাইঘাট', slug: 'kanaighat' },
    { en: 'Zakiganj', bn: 'জকিগঞ্জ', slug: 'zakiganj' },
    { en: 'Dakshin Surma', bn: 'দক্ষিণ সুরমা', slug: 'dakshin-surma' },
    { en: 'Osmani Nagar', bn: 'ওসমানী নগর', slug: 'osmani-nagar' }
  ],
  'dis-moulvibazar': [
    { en: 'Moulvibazar Sadar', bn: 'মৌলভীবাজার সদর', slug: 'moulvibazar-sadar' },
    { en: 'Barlekha', bn: 'বড়লেখা', slug: 'barlekha' },
    { en: 'Juri', bn: 'জুড়ী', slug: 'juri' },
    { en: 'Kamalganj', bn: 'কমলগঞ্জ', slug: 'kamalganj' },
    { en: 'Kulaura', bn: 'কুলাউড়া', slug: 'kulaura' },
    { en: 'Rajnagar', bn: 'রাজনগর', slug: 'rajnagar' },
    { en: 'Sreemangal', bn: 'শ্রীমঙ্গল', slug: 'sreemangal' }
  ],
  'dis-habiganj': [
    { en: 'Habiganj Sadar', bn: 'হবিগঞ্জ সদর', slug: 'habiganj-sadar' },
    { en: 'Ajmiriganj', bn: 'আজমিরীগঞ্জ', slug: 'ajmiriganj' },
    { en: 'Bahubal', bn: 'বাহুবল', slug: 'bahubal' },
    { en: 'Baniachong', bn: 'বানিয়াচং', slug: 'bananiachong' },
    { en: 'Chunarughat', bn: 'চুনারুঘাট', slug: 'chunarughat' },
    { en: 'Lakhai', bn: 'লাখাই', slug: 'lakhai' },
    { en: 'Madhabpur', bn: 'মাধবপুর', slug: 'madhabpur' },
    { en: 'Nabiganj', bn: 'নবীগঞ্জ', slug: 'nabiganj' },
    { en: 'Sayestaganj', bn: 'শায়েস্তাগঞ্জ', slug: 'sayestaganj' }
  ],
  'dis-sunamganj': [
    { en: 'Sunamganj Sadar', bn: 'সুনামগঞ্জ সদর', slug: 'sunamganj-sadar' },
    { en: 'Bishwamvarpur', bn: 'বিশ্বম্ভরপুর', slug: 'bishwamvarpur' },
    { en: 'Chhatak', bn: 'ছাতক', slug: 'chhatak' },
    { en: 'Derai', bn: 'দিরাই', slug: 'derai' },
    { en: 'Dharampasha', bn: 'ধর্মপাশা', slug: 'dharampasha' },
    { en: 'Dowarabazar', bn: 'দোয়ারাবাজার', slug: 'dowarabazar' },
    { en: 'Jagannathpur', bn: 'জগন্নাথপুর', slug: 'jagannathpur' },
    { en: 'Jamalganj', bn: 'জামালগঞ্জ', slug: 'jamalganj' },
    { en: 'Sullah', bn: 'শাল্লা', slug: 'sullah' },
    { en: 'Tahirpur (Tanguar Haor)', bn: 'তাহিরপুর (টাঙ্গুয়ার হাওর)', slug: 'tahirpur-tanguar-haor' },
    { en: 'South Sunamganj (Shantiganj)', bn: 'শান্তিগঞ্জ', slug: 'shantiganj' },
    { en: 'Madhyanagar', bn: 'মধ্যনগর', slug: 'madhyanagar' }
  ],

  // RAJSHAHI DIVISION (8 Districts)
  'dis-rajshahi': [
    { en: 'Boalia (Rajshahi Sadar)', bn: 'বোয়ালিয়া (রাজশাহী সদর)', slug: 'rajshahi-sadar' },
    { en: 'Bagha', bn: 'বাঘা', slug: 'bagha' },
    { en: 'Bagmara', bn: 'বাগমারা', slug: 'bagmara' },
    { en: 'Charghat', bn: 'চারঘাট', slug: 'charghat' },
    { en: 'Durgapur', bn: 'দুর্গাপুর', slug: 'durgapur-rajshahi' },
    { en: 'Godagari', bn: 'গোদাগাড়ী', slug: 'godagari' },
    { en: 'Mohanpur', bn: 'মোহনপুর', slug: 'mohanpur' },
    { en: 'Paba', bn: 'পবা', slug: 'paba' },
    { en: 'Puthia', bn: 'পুঠিয়া', slug: 'puthia' },
    { en: 'Tanore', bn: 'তানোর', slug: 'tanore' }
  ],
  'dis-bogura': [
    { en: 'Bogura Sadar', bn: 'বগুড়া সদর', slug: 'bogura-sadar' },
    { en: 'Adamdighi', bn: 'আদমদীঘি', slug: 'adamdighi' },
    { en: 'Dhunat', bn: 'ধুনট', slug: 'dhunat' },
    { en: 'Dhupchanchia', bn: 'দুপচাঁচিয়া', slug: 'dhupchanchia' },
    { en: 'Gabtali', bn: 'গাবতলী', slug: 'gabtali' },
    { en: 'Kahaloo', bn: 'কাহালু', slug: 'kahaloo' },
    { en: 'Nandigram', bn: 'নন্দীগ্রাম', slug: 'nandigram' },
    { en: 'Sariakandi', bn: 'সারিয়াকান্দি', slug: 'sariakandi' },
    { en: 'Shajahanpur', bn: 'শাজাহানপুর', slug: 'shajahanpur' },
    { en: 'Sherpur', bn: 'শেরপুর', slug: 'sherpur-bogura' },
    { en: 'Shibganj (Mahasthangarh)', bn: 'শিবগঞ্জ (মহাস্থানগড়)', slug: 'shibganj-mahasthangarh' },
    { en: 'Sonatola', bn: 'সোনাতলা', slug: 'sonatola' }
  ],
  'dis-pabna': [
    { en: 'Pabna Sadar', bn: 'পাবনা সদর', slug: 'pabna-sadar' },
    { en: 'Atgharia', bn: 'আটঘরিয়া', slug: 'atgharia' },
    { en: 'Bera', bn: 'বেড়া', slug: 'bera' },
    { en: 'Bhangura', bn: 'ভাঙ্গুড়া', slug: 'bhangura' },
    { en: 'Chatmohar', bn: 'চাটমোহর', slug: 'chatmohar' },
    { en: 'Faridpur', bn: 'ফরিদপুর', slug: 'faridpur-pabna' },
    { en: 'Ishwardi', bn: 'ঈশ্বরদী', slug: 'ishwardi' },
    { en: 'Santhia', bn: 'সাঁথিয়া', slug: 'santhia' },
    { en: 'Sujanagar', bn: 'সুজানগর', slug: 'sujanagar' }
  ],
  'dis-sirajganj': [
    { en: 'Sirajganj Sadar', bn: 'সিরাজগঞ্জ সদর', slug: 'sirajganj-sadar' },
    { en: 'Belkuchi', bn: 'বেলকুচি', slug: 'belkuchi' },
    { en: 'Chauhali', bn: 'চৌহালী', slug: 'chauhali' },
    { en: 'Kamarkhanda', bn: 'কামারখন্দ', slug: 'kamarkhanda' },
    { en: 'Kazipur', bn: 'কাজীপুর', slug: 'kazipur' },
    { en: 'Rayganj', bn: 'রায়গঞ্জ', slug: 'rayganj' },
    { en: 'Shahjadpur', bn: 'শাহজাদপুর', slug: 'shahjadpur' },
    { en: 'Tarash', bn: 'তাড়াশ', slug: 'tarash' },
    { en: 'Ullahpara', bn: 'উল্লাপাড়া', slug: 'ullahpara' }
  ],
  'dis-naogaon': [
    { en: 'Naogaon Sadar', bn: 'নওগাঁ সদর', slug: 'naogaon-sadar' },
    { en: 'Atrai', bn: 'আত্রাই', slug: 'atrai' },
    { en: 'Badalgachhi', bn: 'বদলগাছী', slug: 'badalgachhi' },
    { en: 'Dhamoirhat', bn: 'ধামইরহাট', slug: 'dhamoirhat' },
    { en: 'Manda', bn: 'মান্দা', slug: 'manda' },
    { en: 'Mohadevpur', bn: 'মহাদেবপুর', slug: 'mohadevpur' },
    { en: 'Niamatpur', bn: 'নিয়ামতপুর', slug: 'niamatpur' },
    { en: 'Patnitala', bn: 'পত্নীতলা', slug: 'patnitala' },
    { en: 'Porsha', bn: 'পোরশা', slug: 'porsha' },
    { en: 'Raninagar', bn: 'রাণীনগর', slug: 'raninagar' },
    { en: 'Sapahar', bn: 'সাপাহার', slug: 'sapahar' }
  ],
  'dis-natore': [
    { en: 'Natore Sadar', bn: 'নাটোর সদর', slug: 'natore-sadar' },
    { en: 'Bagatipara', bn: 'বাগাতিপাড়া', slug: 'bagatipara' },
    { en: 'Baraigram', bn: 'বড়াইগ্রাম', slug: 'baraigram' },
    { en: 'Gurudaspur', bn: 'গুরুদাসপুর', slug: 'gurudaspur' },
    { en: 'Lalpur', bn: 'লালপুর', slug: 'lalpur' },
    { en: 'Singra', bn: 'সিংড়া', slug: 'singra' },
    { en: 'Naldanga', bn: 'নলডাঙ্গা', slug: 'naldanga' }
  ],
  'dis-chapainawabganj': [
    { en: 'Chapainawabganj Sadar', bn: 'চাঁপাইনবাবগঞ্জ সদর', slug: 'chapainawabganj-sadar' },
    { en: 'Bholahat', bn: 'ভোলাহাট', slug: 'bholahat' },
    { en: 'Gomastapur', bn: 'গোমস্তাপুর', slug: 'gomastapur' },
    { en: 'Nachole', bn: 'নাচোল', slug: 'nachole' },
    { en: 'Shibganj', bn: 'শিবগঞ্জ', slug: 'shibganj-chapainawabganj' }
  ],
  'dis-joypurhat': [
    { en: 'Joypurhat Sadar', bn: 'জয়পুরহাট সদর', slug: 'joypurhat-sadar' },
    { en: 'Akkelpur', bn: 'আক্কেলপুর', slug: 'akkelpur' },
    { en: 'Kalai', bn: 'কালাই', slug: 'kalai' },
    { en: 'Khetlal', bn: 'ক্ষেতলাল', slug: 'khetlal' },
    { en: 'Panchbibi', bn: 'পাঁচবিবি', slug: 'panchbibi' }
  ],

  // KHULNA DIVISION (10 Districts)
  'dis-khulna': [
    { en: 'Khulna Sadar', bn: 'খুলনা সদর', slug: 'khulna-sadar' },
    { en: 'Batiaghata', bn: 'বটিয়াঘাটা', slug: 'batiaghata' },
    { en: 'Dacope', bn: 'দাকোপ', slug: 'dacope' },
    { en: 'Dumuria', bn: 'ডুমুরিয়া', slug: 'dumuria' },
    { en: 'Dighalia', bn: 'দিঘলিয়া', slug: 'dighalia' },
    { en: 'Koyra', bn: 'কয়রা', slug: 'koyra' },
    { en: 'Paikgachha', bn: 'পাইকগাছা', slug: 'paikgachha' },
    { en: 'Phultala', bn: 'ফুলতলা', slug: 'phultala' },
    { en: 'Rupsha', bn: 'রূপসা', slug: 'rupsha' },
    { en: 'Terokhada', bn: 'তেরখাদা', slug: 'terokhada' }
  ],
  'dis-jashore': [
    { en: 'Jashore Sadar', bn: 'যশোর সদর', slug: 'jashore-sadar' },
    { en: 'Abhaynagar', bn: 'অভয়নগর', slug: 'abhaynagar' },
    { en: 'Bagherpara', bn: 'বাঘারপাড়া', slug: 'bagherpara' },
    { en: 'Chaugachha', bn: 'চৌগাছা', slug: 'chaugachha' },
    { en: 'Jhikargachha', bn: 'ঝিকরগাছা', slug: 'jhikargachha' },
    { en: 'Keshabpur', bn: 'কেশবপুর', slug: 'keshabpur' },
    { en: 'Manirampur', bn: 'মণিরামপুর', slug: 'manirampur' },
    { en: 'Sharsha', bn: 'শার্শা', slug: 'sharsha' }
  ],
  'dis-satkhira': [
    { en: 'Satkhira Sadar', bn: 'সাতক্ষীরা সদর', slug: 'satkhira-sadar' },
    { en: 'Assasuni', bn: 'আশাশুনি', slug: 'assasuni' },
    { en: 'Debhata', bn: 'দেবহাটা', slug: 'debhata' },
    { en: 'Kalaroa', bn: 'কলারোয়া', slug: 'kalaroa' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ', slug: 'kaliganj-satkhira' },
    { en: 'Shyamnagar', bn: 'শ্যামনগর', slug: 'shyamnagar' },
    { en: 'Tala', bn: 'তালা', slug: 'tala' }
  ],
  'dis-bagerhat': [
    { en: 'Bagerhat Sadar', bn: 'বাগেরহাট সদর', slug: 'bagerhat-sadar' },
    { en: 'Chitalmari', bn: 'চিতলমারী', slug: 'chitalmari' },
    { en: 'Fakirhat', bn: 'ফকিরহাট', slug: 'fakirhat' },
    { en: 'Kachua', bn: 'কচুয়া', slug: 'kachua-bagerhat' },
    { en: 'Mollahat', bn: 'মোল্লাহাট', slug: 'mollahat' },
    { en: 'Mongla (Sundarbans Gateway)', bn: 'মোংলা (সুন্দরবন)', slug: 'mongla-sundarbans' },
    { en: 'Morrelganj', bn: 'মোড়েলগঞ্জ', slug: 'morrelganj' },
    { en: 'Rampal', bn: 'রামপাল', slug: 'rampal' },
    { en: 'Sarankhola', bn: 'শরণখোলা', slug: 'sarankhola' }
  ],
  'dis-kushtia': [
    { en: 'Kushtia Sadar', bn: 'কুষ্টিয়া সদর', slug: 'kushtia-sadar' },
    { en: 'Bheramara', bn: 'ভেড়ামারা', slug: 'bheramara' },
    { en: 'Daulatpur', bn: 'দৌলতপুর', slug: 'daulatpur-kushtia' },
    { en: 'Khoksa', bn: 'খোকসা', slug: 'khoksa' },
    { en: 'Kumarkhali', bn: 'কুমারখালী', slug: 'kumarkhali' },
    { en: 'Mirpur', bn: 'মিরপুর', slug: 'mirpur-kushtia' }
  ],
  'dis-chuadanga': [
    { en: 'Chuadanga Sadar', bn: 'চুয়াডাঙ্গা সদর', slug: 'chuadanga-sadar' },
    { en: 'Alamdanga', bn: 'আলমডাঙ্গা', slug: 'alamdanga' },
    { en: 'Damurhuda', bn: 'দামুড়হুদা', slug: 'damurhuda' },
    { en: 'Jibannagar', bn: 'জীবননগর', slug: 'jibannagar' }
  ],
  'dis-meherpur': [
    { en: 'Meherpur Sadar', bn: 'মেহেরপুর সদর', slug: 'meherpur-sadar' },
    { en: 'Gangni', bn: 'গাংনী', slug: 'gangni' },
    { en: 'Mujibnagar', bn: 'মুজিবনগর', slug: 'mujibnagar' }
  ],
  'dis-jhenaidah': [
    { en: 'Jhenaidah Sadar', bn: 'ঝিনাইদহ সদর', slug: 'jhenaidah-sadar' },
    { en: 'Harinakunda', bn: 'হরিণাকুণ্ডু', slug: 'harinakunda' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ', slug: 'kaliganj-jhenaidah' },
    { en: 'Kotchandpur', bn: 'কোটচাঁদপুর', slug: 'kotchandpur' },
    { en: 'Maheshpur', bn: 'মহেশপুর', slug: 'maheshpur' },
    { en: 'Shailkupa', bn: 'শৈলকুপা', slug: 'shailkupa' }
  ],
  'dis-magura': [
    { en: 'Magura Sadar', bn: 'মাগুরা সদর', slug: 'magura-sadar' },
    { en: 'Mohammadpur', bn: 'মোহাম্মদপুর', slug: 'mohammadpur-magura' },
    { en: 'Shalikha', bn: 'শালিখা', slug: 'shalikha' },
    { en: 'Sreepur', bn: 'শ্রীপুর', slug: 'sreepur-magura' }
  ],
  'dis-narail': [
    { en: 'Narail Sadar', bn: 'নড়াইল সদর', slug: 'narail-sadar' },
    { en: 'Kalia', bn: 'কালিয়া', slug: 'kalia' },
    { en: 'Lohagara', bn: 'লোহাগাড়া', slug: 'lohagara-narail' }
  ],

  // BARISHAL DIVISION (6 Districts)
  'dis-barishal': [
    { en: 'Kotwali (Barishal Sadar)', bn: 'কোতোয়ালি (বরিশাল সদর)', slug: 'barishal-sadar' },
    { en: 'Agailjhara', bn: 'আগৈলঝাড়া', slug: 'agailjhara' },
    { en: 'Babuganj', bn: 'বাবুগঞ্জ', slug: 'babuganj' },
    { en: 'Bakerganj', bn: 'বাকেরগঞ্জ', slug: 'bakerganj' },
    { en: 'Banaripara (Floating Guava Market)', bn: 'বানারীপাড়া (ভাসমান পেয়ারা বাজার)', slug: 'banaripara' },
    { en: 'Gaurnadi', bn: 'গৌরনদী', slug: 'gaurnadi' },
    { en: 'Hizla', bn: 'হিজলা', slug: 'hizla' },
    { en: 'Mehendiganj', bn: 'মেহেন্দীগঞ্জ', slug: 'mehendiganj' },
    { en: 'Muladi', bn: 'মুলাদী', slug: 'muladi' },
    { en: 'Wazirpur', bn: 'উজিরপুর', slug: 'wazirpur' }
  ],
  'dis-patuakhali': [
    { en: 'Patuakhali Sadar', bn: 'পটুয়াখালী সদর', slug: 'patuakhali-sadar' },
    { en: 'Bauphal', bn: 'বাউফল', slug: 'bauphal' },
    { en: 'Dashmina', bn: 'দশমিনা', slug: 'dashmina' },
    { en: 'Galachipa', bn: 'গলাচিপা', slug: 'galachipa' },
    { en: 'Kalapara (Kuakata Beach)', bn: 'কলাপাড়া (কুয়াকাটা)', slug: 'kalapara-kuakata' },
    { en: 'Mirzaganj', bn: 'মির্জাগঞ্জ', slug: 'mirzaganj' },
    { en: 'Rangabali', bn: 'রাঙ্গাবালী', slug: 'rangabali' },
    { en: 'Dumki', bn: 'দুমকি', slug: 'dumki' }
  ],
  'dis-bhola': [
    { en: 'Bhola Sadar', bn: 'ভোলা সদর', slug: 'bhola-sadar' },
    { en: 'Burhanuddin', bn: 'বোরহানউদ্দিন', slug: 'burhanuddin' },
    { en: 'Char Fasson', bn: 'চরফ্যাশন', slug: 'char-fasson' },
    { en: 'Daulatkhan', bn: 'দৌলতখান', slug: 'daulatkhan' },
    { en: 'Lalmohan', bn: 'লালমোহন', slug: 'lalmohan' },
    { en: 'Manpura', bn: 'মনপুরা', slug: 'manpura' },
    { en: 'Tazumuddin', bn: 'তজুমদ্দিন', slug: 'tazumuddin' }
  ],
  'dis-pirojpur': [
    { en: 'Pirojpur Sadar', bn: 'পিরোজপুর সদর', slug: 'pirojpur-sadar' },
    { en: 'Bhandaria', bn: 'ভাণ্ডারিয়া', slug: 'bhandaria' },
    { en: 'Kawkhali', bn: 'কাউখালী', slug: 'kawkhali-pirojpur' },
    { en: 'Mathbaria', bn: 'মঠবাড়িয়া', slug: 'mathbaria' },
    { en: 'Nazirpur', bn: 'নাজিরপুর', slug: 'nazirpur' },
    { en: 'Nesarabad (Swarupkati)', bn: 'নেছারাবাদ (স্বরূপকাঠি)', slug: 'nesarabad' },
    { en: 'Zianagar (Indurkani)', bn: 'ইন্দুরকানী', slug: 'indurkani' }
  ],
  'dis-barguna': [
    { en: 'Barguna Sadar', bn: 'বরগুনা সদর', slug: 'barguna-sadar' },
    { en: 'Amtali', bn: 'আমতলী', slug: 'amtali' },
    { en: 'Bamna', bn: 'বামনা', slug: 'bamna' },
    { en: 'Betagi', bn: 'বেতাগী', slug: 'betagi' },
    { en: 'Patharghata', bn: 'পাথরঘাটা', slug: 'patharghata' },
    { en: 'Taltali', bn: 'তালতলী', slug: 'taltali' }
  ],
  'dis-jhalokati': [
    { en: 'Jhalokati Sadar', bn: 'ঝালকাঠি সদর', slug: 'jhalokati-sadar' },
    { en: 'Kathalia', bn: 'কাঠালিয়া', slug: 'kathalia' },
    { en: 'Nalchity', bn: 'নলছিটি', slug: 'nalchity' },
    { en: 'Rajapur', bn: 'রাজাপুর', slug: 'rajapur' }
  ],

  // RANGPUR DIVISION (8 Districts)
  'dis-rangpur': [
    { en: 'Rangpur Sadar', bn: 'রংপুর সদর', slug: 'rangpur-sadar' },
    { en: 'Badarganj', bn: 'বদরগঞ্জ', slug: 'badarganj' },
    { en: 'Gangachhara', bn: 'গঙ্গাচড়া', slug: 'gangachhara' },
    { en: 'Kaunia', bn: 'কাউনিয়া', slug: 'kaunia' },
    { en: 'Mithapukur', bn: 'মিঠাপুকুর', slug: 'mithapukur' },
    { en: 'Pirgachha', bn: 'পীরগাছা', slug: 'pirgachha' },
    { en: 'Pirganj', bn: 'পীরগঞ্জ', slug: 'pirganj-rangpur' },
    { en: 'Taraganj', bn: 'তারাগঞ্জ', slug: 'taraganj' }
  ],
  'dis-dinajpur': [
    { en: 'Dinajpur Sadar', bn: 'দিনাজপুর সদর', slug: 'dinajpur-sadar' },
    { en: 'Birampur', bn: 'বিরামপুর', slug: 'birampur' },
    { en: 'Birganj', bn: 'বীরগঞ্জ', slug: 'birganj' },
    { en: 'Biral', bn: 'বিরল', slug: 'biral' },
    { en: 'Bochaganj', bn: 'বোচাগঞ্জ', slug: 'bochaganj' },
    { en: 'Chirirbandar', bn: 'চিরিরবন্দর', slug: 'chirirbandar' },
    { en: 'Phulbari', bn: 'ফুলবাড়ী', slug: 'phulbari-dinajpur' },
    { en: 'Ghoraghat', bn: 'ঘোড়াঘাট', slug: 'ghoraghat' },
    { en: 'Hakimpur', bn: 'হাকিমপুর', slug: 'hakimpur' },
    { en: 'Kaharole', bn: 'কাহারোল', slug: 'kaharole' },
    { en: 'Khansama', bn: 'খানসামা', slug: 'khansama' },
    { en: 'Nawabganj', bn: 'নবাবগঞ্জ', slug: 'nawabganj-dinajpur' },
    { en: 'Parbatipur', bn: 'পার্বতীপুর', slug: 'parbatipur' }
  ],
  'dis-panchagarh': [
    { en: 'Panchagarh Sadar', bn: 'পঞ্চগড় সদর', slug: 'panchagarh-sadar' },
    { en: 'Atwari', bn: 'আটোয়ারী', slug: 'atwari' },
    { en: 'Boda', bn: 'বোদা', slug: 'boda' },
    { en: 'Debiganj', bn: 'দেবীগঞ্জ', slug: 'debiganj' },
    { en: 'Tetulia (Kanchenjunga View)', bn: 'তেঁতুলিয়া (কাঞ্চনজঙ্ঘা ভিউ)', slug: 'tetulia' }
  ],
  'dis-thakurgaon': [
    { en: 'Thakurgaon Sadar', bn: 'ঠাকুরগাঁও সদর', slug: 'thakurgaon-sadar' },
    { en: 'Baliadangi', bn: 'বালিয়াডাঙ্গী', slug: 'baliadangi' },
    { en: 'Haripur', bn: 'হরিপুর', slug: 'haripur' },
    { en: 'Pirganj', bn: 'পীরগঞ্জ', slug: 'pirganj-thakurgaon' },
    { en: 'Ranisankail', bn: 'রাণীশংকৈল', slug: 'ranisankail' }
  ],
  'dis-nilphamari': [
    { en: 'Nilphamari Sadar', bn: 'নীলফামারী সদর', slug: 'nilphamari-sadar' },
    { en: 'Dimla', bn: 'ডিমলা', slug: 'dimla' },
    { en: 'Domar', bn: 'ডোমার', slug: 'domar' },
    { en: 'Jaldhaka', bn: 'জলঢাকা', slug: 'jaldhaka' },
    { en: 'Kishoreganj', bn: 'কিশোরগঞ্জ', slug: 'kishoreganj-nilphamari' },
    { en: 'Saidpur', bn: 'সৈয়দপুর', slug: 'saidpur' }
  ],
  'dis-lalmonirhat': [
    { en: 'Lalmonirhat Sadar', bn: 'লালমনিরহাট সদর', slug: 'lalmonirhat-sadar' },
    { en: 'Aditmari', bn: 'আদিতমারী', slug: 'aditmari' },
    { en: 'Hatibandha', bn: 'হাতীবান্ধা', slug: 'hatibandha' },
    { en: 'Kaliganj', bn: 'কালীগঞ্জ', slug: 'kaliganj-lalmonirhat' },
    { en: 'Patgram', bn: 'পাটগ্রাম', slug: 'patgram' }
  ],
  'dis-kurigram': [
    { en: 'Kurigram Sadar', bn: 'কুড়িগ্রাম সদর', slug: 'kurigram-sadar' },
    { en: 'Bhurungamari', bn: 'ভুরুঙ্গামারী', slug: 'bhurungamari' },
    { en: 'Char Rajibpur', bn: 'চর রাজিবপুর', slug: 'char-rajibpur' },
    { en: 'Chilmari', bn: 'চিলমারী', slug: 'chilmari' },
    { en: 'Phulbari', bn: 'ফুলবাড়ী', slug: 'phulbari-kurigram' },
    { en: 'Nageshwari', bn: 'নাগেশ্বরী', slug: 'nageshwari' },
    { en: 'Rajarhat', bn: 'রাজারহাট', slug: 'rajarhat' },
    { en: 'Raomari', bn: 'রৌমারী', slug: 'raomari' },
    { en: 'Ulipur', bn: 'উলিপুর', slug: 'ulipur' }
  ],
  'dis-gaibandha': [
    { en: 'Gaibandha Sadar', bn: 'গাইবান্ধা সদর', slug: 'gaibandha-sadar' },
    { en: 'Fulchhari', bn: 'ফুলছড়ি', slug: 'fulchhari' },
    { en: 'Gobindaganj', bn: 'গোবিন্দগঞ্জ', slug: 'gobindaganj' },
    { en: 'Palashbari', bn: 'পলাশবাড়ী', slug: 'palashbari' },
    { en: 'Sadullapur', bn: 'সাদুল্লাপুর', slug: 'sadullapur' },
    { en: 'Saghata', bn: 'সাঘাটা', slug: 'saghata' },
    { en: 'Sundarganj', bn: 'সুন্দরগঞ্জ', slug: 'sundarganj' }
  ],

  // MYMENSINGH DIVISION (4 Districts)
  'dis-mymensingh': [
    { en: 'Mymensingh Sadar', bn: 'ময়মনসিংহ সদর', slug: 'mymensingh-sadar' },
    { en: 'Bhaluka', bn: 'ভালুকা', slug: 'bhaluka' },
    { en: 'Dhobaura', bn: 'ধোবাউড়া', slug: 'dhobaura' },
    { en: 'Fulbaria', bn: 'ফুলবাড়ীয়া', slug: 'fulbaria' },
    { en: 'Gafargaon', bn: 'গফরগাঁও', slug: 'gafargaon' },
    { en: 'Gauripur', bn: 'গৌরীপুর', slug: 'gauripur' },
    { en: 'Haluaghat', bn: 'হালুয়াঘাট', slug: 'haluaghat' },
    { en: 'Ishwarganj', bn: 'ঈশ্বরগঞ্জ', slug: 'ishwarganj' },
    { en: 'Muktagachha', bn: 'মুক্তাগাছা', slug: 'muktagachha' },
    { en: 'Nandail', bn: 'নান্দাইল', slug: 'nandail' },
    { en: 'Phulpur', bn: 'ফুলপুর', slug: 'phulpur' },
    { en: 'Trishal', bn: 'ত্রিশাল', slug: 'trishal' },
    { en: 'Tara Khanda', bn: 'তারাকান্দা', slug: 'tara-khanda' }
  ],
  'dis-netrokona': [
    { en: 'Netrokona Sadar', bn: 'নেত্রকোণা সদর', slug: 'netrokona-sadar' },
    { en: 'Atpara', bn: 'আটপাড়া', slug: 'atpara' },
    { en: 'Barhatta', bn: 'বারহাট্টা', slug: 'barhatta' },
    { en: 'Durgapur (Birishiri)', bn: 'দুর্গাপুর (বিরিশিরি)', slug: 'durgapur-birishiri' },
    { en: 'Khaliajuri', bn: 'খালিয়াজুড়ী', slug: 'khaliajuri' },
    { en: 'Kalmakanda', bn: 'কলমাকান্দা', slug: 'kalmakanda' },
    { en: 'Kendua', bn: 'কেন্দুয়া', slug: 'kendua' },
    { en: 'Madan', bn: 'মদন', slug: 'madan' },
    { en: 'Mohanganj', bn: 'মোহনগঞ্জ', slug: 'mohanganj' },
    { en: 'Purbadhala', bn: 'পূর্বধলা', slug: 'purbadhala' }
  ],
  'dis-jamalpur': [
    { en: 'Jamalpur Sadar', bn: 'জামালপুর সদর', slug: 'jamalpur-sadar' },
    { en: 'Bakshiganj', bn: 'বকশীগঞ্জ', slug: 'bakshiganj' },
    { en: 'Dewanganj', bn: 'দেওয়ানগঞ্জ', slug: 'dewanganj' },
    { en: 'Islampur', bn: 'ইসলামপুর', slug: 'islampur' },
    { en: 'Madarganj', bn: 'মাদারগঞ্জ', slug: 'madarganj' },
    { en: 'Melandaha', bn: 'মেলান্দহ', slug: 'melandaha' },
    { en: 'Sarishabari', bn: 'সরিষাবাড়ী', slug: 'sarishabari' }
  ],
  'dis-sherpur': [
    { en: 'Sherpur Sadar', bn: 'শেরপুর সদর', slug: 'sherpur-sadar' },
    { en: 'Jhenaigati', bn: 'ঝিনাইগাতী', slug: 'jhenaigati' },
    { en: 'Nakla', bn: 'নকলা', slug: 'nakla' },
    { en: 'Nalitabari', bn: 'নালিতাবাড়ী', slug: 'nalitabari' },
    { en: 'Sreebardi', bn: 'শ্রীবরদী', slug: 'sreebardi' }
  ]
};

// Convert to LocationItem[] array
const upazilaItems = [];
let upzCounter = 1;

for (const [districtId, list] of Object.entries(UPAZILAS_BY_DISTRICT)) {
  for (const item of list) {
    upazilaItems.push({
      id: `upz-${item.slug}`,
      parentId: districtId,
      nameEn: item.en,
      nameBn: item.bn,
      slug: item.slug,
      level: 'upazila',
      sourceCode: String(upzCounter++).padStart(4, '0'),
      isActive: true
    });
  }
}

fs.writeFileSync(path.join(__dirname, '../src/data/allUpazilas.json'), JSON.stringify(upazilaItems, null, 2));
console.log(`Generated ${upazilaItems.length} upazilas across all 64 districts!`);
