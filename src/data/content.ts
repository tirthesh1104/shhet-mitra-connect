// Centralized mock content for Phase 2 activated pages.
// All bilingual (mr/en). Keeping this static keeps navigation instant with zero blank states.

export type BL = { mr: string; en: string };

export const SCHEMES: Array<{
  id: string; name: BL; benefit: BL; eligibility: BL;
  crops: string[]; states: string[]; url: string; howto: BL;
}> = [
  {
    id: "pm-kisan",
    name: { mr: "पीएम-किसान सन्मान निधी", en: "PM-Kisan Samman Nidhi" },
    benefit: { mr: "वार्षिक ₹६,००० तीन हप्त्यांत थेट खात्यात", en: "₹6,000/year in 3 installments to farmer's bank account" },
    eligibility: { mr: "जमीनधारक शेतकरी कुटुंब (लहान व सीमांत)", en: "Landholding farmer families (small & marginal)" },
    crops: ["*"], states: ["*"],
    url: "https://pmkisan.gov.in",
    howto: {
      mr: "१) आधार, बँक पासबुक व सातबारा घ्या. २) pmkisan.gov.in वर 'New Farmer Registration' करा. ३) CSC केंद्रात अर्ज भरा किंवा तलाठीकडे तपासा.",
      en: "1) Keep Aadhaar, bank passbook, land record. 2) Register at pmkisan.gov.in as new farmer. 3) Or apply at nearest CSC / Talathi office.",
    },
  },
  {
    id: "fasal-bima",
    name: { mr: "पीएम फसल विमा योजना", en: "PM Fasal Bima Yojana" },
    benefit: { mr: "नैसर्गिक आपत्तीमुळे नुकसान झाल्यास विमा भरपाई", en: "Insurance payout for crop loss due to natural calamity" },
    eligibility: { mr: "सर्व शेतकरी (कर्जदार/गैर-कर्जदार)", en: "All farmers (loanee & non-loanee)" },
    crops: ["*"], states: ["*"],
    url: "https://pmfby.gov.in",
    howto: {
      mr: "१) पेरणीच्या ७ दिवसांच्या आत बँक/CSC वर अर्ज. २) खरीप ₹२%, रब्बी १.५% प्रीमियम. ३) नुकसान झाल्यास ७२ तासांत विमा कंपनीला कळवा.",
      en: "1) Apply within 7 days of sowing at bank/CSC. 2) Premium: Kharif 2%, Rabi 1.5%. 3) Report loss to insurer within 72 hours.",
    },
  },
  {
    id: "soil-health",
    name: { mr: "मृदा आरोग्य कार्ड", en: "Soil Health Card" },
    benefit: { mr: "मोफत माती परीक्षण + पोषक सल्ला", en: "Free soil test + nutrient recommendation" },
    eligibility: { mr: "सर्व शेतकरी", en: "All farmers" },
    crops: ["*"], states: ["*"],
    url: "https://soilhealth.dac.gov.in",
    howto: {
      mr: "१) नजीकच्या कृषी केंद्रात संपर्क साधा. २) खताच्या ३ ठिकाणी माती नमुना द्या. ३) ३० दिवसांत कार्ड मिळेल.",
      en: "1) Contact nearest Krishi Kendra. 2) Provide soil samples from 3 spots. 3) Receive card within 30 days.",
    },
  },
  {
    id: "pmksy",
    name: { mr: "पीएमकेएसवाय (सूक्ष्म सिंचन)", en: "PMKSY (Micro-Irrigation)" },
    benefit: { mr: "ठिबक/तुषार सिंचनासाठी ५५–८०% अनुदान", en: "55–80% subsidy on drip / sprinkler irrigation" },
    eligibility: { mr: "अल्पभूधारक व अन्य शेतकरी", en: "Small & other farmers" },
    crops: ["*"], states: ["*"],
    url: "https://pmksy.gov.in",
    howto: {
      mr: "१) mahadbt.maharashtra.gov.in वर अर्ज. २) आधार + सातबारा जोडा. ३) मान्यताप्राप्त कंपनीकडून बसवा.",
      en: "1) Apply at mahadbt.maharashtra.gov.in. 2) Attach Aadhaar + land record. 3) Install via empanelled vendor.",
    },
  },
  {
    id: "enam",
    name: { mr: "eNAM (राष्ट्रीय कृषी बाजार)", en: "eNAM National Agri Market" },
    benefit: { mr: "ऑनलाइन बाजारपेठ — योग्य भाव, थेट खरेदीदार", en: "Online mandi — fair price, direct buyers" },
    eligibility: { mr: "सर्व शेतकरी / व्यापारी", en: "All farmers & traders" },
    crops: ["*"], states: ["*"],
    url: "https://enam.gov.in",
    howto: {
      mr: "१) enam.gov.in वर नोंदणी. २) नजीकच्या eNAM मंडीत माल न्या. ३) ऑनलाइन बोली स्वीकारा.",
      en: "1) Register at enam.gov.in. 2) Bring produce to nearest eNAM mandi. 3) Accept online bid.",
    },
  },
  {
    id: "kcc",
    name: { mr: "किसान क्रेडिट कार्ड (KCC)", en: "Kisan Credit Card" },
    benefit: { mr: "४% व्याजदराने ₹३ लाखांपर्यंत पीक कर्ज", en: "Crop loan up to ₹3 lakh @ 4% interest" },
    eligibility: { mr: "जमीनधारक / भाडेकरू शेतकरी", en: "Landholding / tenant farmers" },
    crops: ["*"], states: ["*"],
    url: "https://www.nabard.org",
    howto: {
      mr: "१) कोणत्याही राष्ट्रीयकृत बँकेत अर्ज. २) आधार, सातबारा, ओळखपत्र द्या. ३) १५ दिवसांत मंजुरी.",
      en: "1) Apply at any nationalised bank. 2) Submit Aadhaar, land record, ID. 3) Sanction within 15 days.",
    },
  },
  {
    id: "rkvy",
    name: { mr: "राष्ट्रीय कृषी विकास योजना", en: "Rashtriya Krishi Vikas Yojana" },
    benefit: { mr: "कृषी पायाभूत सुविधा व नवीन तंत्रज्ञानासाठी अनुदान", en: "Grants for agri infrastructure & new technology" },
    eligibility: { mr: "शेतकरी गट, FPO, वैयक्तिक शेतकरी", en: "Farmer groups, FPOs, individual farmers" },
    crops: ["*"], states: ["*"],
    url: "https://rkvy.nic.in",
    howto: {
      mr: "१) जिल्हा कृषी अधिकाऱ्याकडे प्रस्ताव. २) DPR तयार करा. ३) DLC मान्यता मिळाल्यावर निधी.",
      en: "1) Submit proposal to District Agri Officer. 2) Prepare DPR. 3) Funds after DLC approval.",
    },
  },
  {
    id: "pkvy",
    name: { mr: "परंपरागत कृषी विकास योजना", en: "Paramparagat Krishi Vikas Yojana" },
    benefit: { mr: "सेंद्रिय शेतीसाठी ३ वर्षांत ₹५०,००० प्रति हेक्टर", en: "₹50,000/hectare over 3 years for organic farming" },
    eligibility: { mr: "५० शेतकऱ्यांचा गट (क्लस्टर)", en: "Cluster of 50 farmers" },
    crops: ["*"], states: ["*"],
    url: "https://pgsindia-ncof.gov.in",
    howto: {
      mr: "१) ५० शेतकऱ्यांचा गट तयार करा. २) कृषी विभागाकडे नोंदणी. ३) PGS प्रमाणपत्रासाठी अर्ज.",
      en: "1) Form cluster of 50 farmers. 2) Register with agri dept. 3) Apply for PGS certification.",
    },
  },
  {
    id: "mahadbt-tractor",
    name: { mr: "यंत्र-अवजारे अनुदान (MahaDBT)", en: "Farm Equipment Subsidy (MahaDBT)" },
    benefit: { mr: "ट्रॅक्टर, रोटावेटर, पॉवर टिलरसाठी ४०–५०% अनुदान", en: "40–50% subsidy on tractor, rotavator, power tiller" },
    eligibility: { mr: "महाराष्ट्रातील शेतकरी", en: "Farmers in Maharashtra" },
    crops: ["*"], states: ["Maharashtra"],
    url: "https://mahadbt.maharashtra.gov.in",
    howto: {
      mr: "१) mahadbtmahait.gov.in वर लॉगिन. २) 'कृषी यांत्रिकीकरण' निवडा. ३) कागदपत्रे अपलोड करून लॉटरी.",
      en: "1) Login at mahadbtmahait.gov.in. 2) Choose 'Agri Mechanization'. 3) Upload docs, wait for lottery.",
    },
  },
];

export const SIDE_INCOMES: Array<{
  id: string; name: BL; earn: string; invest: string;
  difficulty: BL; desc: BL; icon: string;
}> = [
  { id: "bee", name: { mr: "मधुमक्षिका पालन", en: "Beekeeping" }, earn: "₹8,000 – ₹25,000 / महिना", invest: "₹15,000 – ₹50,000",
    difficulty: { mr: "मध्यम", en: "Medium" },
    desc: { mr: "५–१० पेट्यांतून सुरुवात करा. मध व मेण विका. NABARD अनुदान उपलब्ध.", en: "Start with 5–10 boxes. Sell honey and wax. NABARD subsidy available." }, icon: "Bug" },
  { id: "mushroom", name: { mr: "मशरूम शेती", en: "Mushroom Farming" }, earn: "₹10,000 – ₹30,000 / महिना", invest: "₹20,000 – ₹40,000",
    difficulty: { mr: "सोपे", en: "Easy" },
    desc: { mr: "छोट्या शेडमध्ये करता येते. ३ आठवड्यांत उत्पन्न सुरू.", en: "Can be done in small shed. Yield begins in 3 weeks." }, icon: "Sprout" },
  { id: "vermi", name: { mr: "गांडूळ खत", en: "Vermicomposting" }, earn: "₹5,000 – ₹15,000 / महिना", invest: "₹5,000 – ₹15,000",
    difficulty: { mr: "सोपे", en: "Easy" },
    desc: { mr: "शेणखत + गांडुळांपासून सेंद्रिय खत. मार्केटला जोरदार मागणी.", en: "Organic manure from dung + earthworms. High market demand." }, icon: "Leaf" },
  { id: "dairy", name: { mr: "दुग्धव्यवसाय", en: "Dairy" }, earn: "₹15,000 – ₹40,000 / महिना", invest: "₹80,000 – ₹2,00,000",
    difficulty: { mr: "मध्यम", en: "Medium" },
    desc: { mr: "२–४ म्हशी/गायी. सहकारी संघाला दूध पुरवा.", en: "2–4 buffaloes/cows. Supply milk to co-op union." }, icon: "Milk" },
  { id: "intercrop", name: { mr: "मिश्रपीक (आंतरपीक)", en: "Intercropping Vegetables" }, earn: "₹3,000 – ₹12,000 / महिना", invest: "₹2,000 – ₹8,000",
    difficulty: { mr: "सोपे", en: "Easy" },
    desc: { mr: "मुख्य पिकाच्या ओळींत भाजीपाला घ्या. अतिरिक्त उत्पन्न.", en: "Grow vegetables between main crop rows. Extra income." }, icon: "Carrot" },
  { id: "agri-tour", name: { mr: "कृषी पर्यटन", en: "Agri-Tourism" }, earn: "₹20,000 – ₹1,00,000 / महिना", invest: "₹50,000 – ₹3,00,000",
    difficulty: { mr: "कठीण", en: "Hard" },
    desc: { mr: "शहरी लोकांना शेतीचा अनुभव द्या. महाराष्ट्र पर्यटन नोंदणी करा.", en: "Offer farm-stay experience to urban tourists. Register with MTDC." }, icon: "Tent" },
];

export const MANDI_CROPS = [
  { key: "wheat", mr: "गहू", en: "Wheat", base: 2400, trend: "up" as const },
  { key: "onion", mr: "कांदा", en: "Onion", base: 1800, trend: "down" as const },
  { key: "tomato", mr: "टोमॅटो", en: "Tomato", base: 1500, trend: "stable" as const },
  { key: "sugarcane", mr: "ऊस", en: "Sugarcane", base: 320, trend: "up" as const },
  { key: "soybean", mr: "सोयाबीन", en: "Soybean", base: 4600, trend: "up" as const },
  { key: "cotton", mr: "कापूस", en: "Cotton", base: 7200, trend: "stable" as const },
  { key: "jowar", mr: "ज्वारी", en: "Jowar", base: 2800, trend: "up" as const },
  { key: "tur", mr: "तूर डाळ", en: "Tur Dal", base: 8500, trend: "up" as const },
  { key: "grape", mr: "द्राक्षे", en: "Grapes", base: 4200, trend: "stable" as const },
  { key: "pomegranate", mr: "डाळिंब", en: "Pomegranate", base: 5800, trend: "up" as const },
];

// deterministic mock 7-day price series
export function priceSeries(base: number, seed = 1): { date: string; price: number }[] {
  const arr: { date: string; price: number }[] = [];
  let p = base;
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const noise = ((Math.sin(seed * (i + 1)) + 1) / 2 - 0.5) * base * 0.08;
    p = Math.round(base + noise);
    arr.push({ date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }), price: p });
  }
  return arr;
}

export const KRISHI_KENDRAS = [
  { name: "Sangli Krishi Vigyan Kendra", type: "krishi_kendra", taluka: "Miraj", district: "Sangli", phone: "0233-2234-567", hours: "9:00 – 17:00", distance: "2.3 km" },
  { name: "Warana Seeds & Fertilizer", type: "seed_shop", taluka: "Panhala", district: "Kolhapur", phone: "0231-9876-543", hours: "8:00 – 20:00", distance: "5.1 km" },
  { name: "Baramati Soil Testing Lab", type: "soil_lab", taluka: "Baramati", district: "Pune", phone: "02112-345-678", hours: "10:00 – 16:00", distance: "8.7 km" },
  { name: "Krishi Seva Kendra Nashik", type: "krishi_kendra", taluka: "Niphad", district: "Nashik", phone: "0253-1234-987", hours: "9:00 – 18:00", distance: "3.4 km" },
  { name: "Mahalakshmi Fertilizer Dealer", type: "fertilizer_dealer", taluka: "Karad", district: "Satara", phone: "02164-234-561", hours: "8:30 – 19:30", distance: "6.2 km" },
  { name: "Shivaji Krishi Center", type: "krishi_kendra", taluka: "Solapur North", district: "Solapur", phone: "0217-2345-678", hours: "9:00 – 17:30", distance: "4.5 km" },
  { name: "Kolhapur Beej Bhandar", type: "seed_shop", taluka: "Karvir", district: "Kolhapur", phone: "0231-2233-445", hours: "8:00 – 21:00", distance: "1.8 km" },
  { name: "MPKV Rahuri Soil Lab", type: "soil_lab", taluka: "Rahuri", district: "Ahmednagar", phone: "02426-243-201", hours: "10:00 – 17:00", distance: "12.4 km" },
  { name: "Jai Kisan Fertilizer", type: "fertilizer_dealer", taluka: "Latur", district: "Latur", phone: "02382-234-556", hours: "8:00 – 20:00", distance: "5.8 km" },
  { name: "Nashik Agri Seva", type: "krishi_kendra", taluka: "Nashik Rd", district: "Nashik", phone: "0253-2456-789", hours: "9:00 – 18:00", distance: "7.1 km" },
  { name: "Vidarbha Beej Kendra", type: "seed_shop", taluka: "Wardha", district: "Wardha", phone: "07152-234-567", hours: "8:30 – 19:00", distance: "9.6 km" },
  { name: "Aurangabad Soil Testing", type: "soil_lab", taluka: "Aurangabad", district: "Aurangabad", phone: "0240-234-5678", hours: "10:00 – 16:00", distance: "6.9 km" },
  { name: "Bharat Fertilizer", type: "fertilizer_dealer", taluka: "Amravati", district: "Amravati", phone: "0721-2345-678", hours: "8:00 – 20:00", distance: "4.2 km" },
  { name: "Krishi Bandhu Kendra", type: "krishi_kendra", taluka: "Pandharpur", district: "Solapur", phone: "02186-234-567", hours: "9:00 – 17:00", distance: "8.3 km" },
  { name: "Godavari Seeds", type: "seed_shop", taluka: "Kopargaon", district: "Ahmednagar", phone: "02423-222-333", hours: "8:30 – 19:30", distance: "10.5 km" },
  { name: "Vasantrao Naik KVK", type: "krishi_kendra", taluka: "Yavatmal", district: "Yavatmal", phone: "07232-234-567", hours: "9:00 – 17:30", distance: "11.8 km" },
  { name: "Beed Krishi Center", type: "krishi_kendra", taluka: "Beed", district: "Beed", phone: "02442-234-567", hours: "9:00 – 18:00", distance: "5.4 km" },
  { name: "Osmanabad Fertilizer Hub", type: "fertilizer_dealer", taluka: "Osmanabad", district: "Osmanabad", phone: "02472-234-567", hours: "8:00 – 20:00", distance: "7.7 km" },
  { name: "Ratnagiri Coastal Krishi", type: "krishi_kendra", taluka: "Ratnagiri", district: "Ratnagiri", phone: "02352-234-567", hours: "9:00 – 17:00", distance: "3.9 km" },
  { name: "Konkan Beej Kendra", type: "seed_shop", taluka: "Chiplun", district: "Ratnagiri", phone: "02355-234-567", hours: "8:30 – 19:00", distance: "6.6 km" },
];

export const KENDRA_TYPES: Array<{ key: string; mr: string; en: string }> = [
  { key: "krishi_kendra", mr: "कृषी केंद्र", en: "Krishi Kendra" },
  { key: "seed_shop", mr: "बीज दुकान", en: "Seed Shop" },
  { key: "soil_lab", mr: "माती तपासणी", en: "Soil Testing" },
  { key: "fertilizer_dealer", mr: "खत विक्रेता", en: "Fertilizer Dealer" },
];

export const CLIMATE_CROPS: Array<{
  name: BL; water: BL; heat: BL; yield: string; sow: BL;
}> = [
  { name: { mr: "बाजरी", en: "Pearl Millet" }, water: { mr: "कमी", en: "Low" }, heat: { mr: "उच्च", en: "High" }, yield: "10–15 qtl/acre", sow: { mr: "जून-जुलै", en: "Jun–Jul" } },
  { name: { mr: "तूर", en: "Pigeon Pea" }, water: { mr: "मध्यम", en: "Medium" }, heat: { mr: "उच्च", en: "High" }, yield: "8–12 qtl/acre", sow: { mr: "जून-जुलै", en: "Jun–Jul" } },
  { name: { mr: "मूग", en: "Green Gram" }, water: { mr: "कमी", en: "Low" }, heat: { mr: "मध्यम", en: "Medium" }, yield: "5–8 qtl/acre", sow: { mr: "जुलै", en: "Jul" } },
  { name: { mr: "ज्वारी", en: "Sorghum" }, water: { mr: "कमी", en: "Low" }, heat: { mr: "उच्च", en: "High" }, yield: "12–18 qtl/acre", sow: { mr: "जून", en: "Jun" } },
  { name: { mr: "कारळे / रामतीळ", en: "Niger" }, water: { mr: "कमी", en: "Low" }, heat: { mr: "मध्यम", en: "Medium" }, yield: "3–5 qtl/acre", sow: { mr: "ऑगस्ट", en: "Aug" } },
];

export const DEBT_TIPS: Array<{ title: BL; desc: BL }> = [
  { title: { mr: "बचत गटात सामील व्हा", en: "Join a Self-Help Group (SHG)" },
    desc: { mr: "SHG मधून ६–१२% व्याजाने कर्ज मिळते. सहकारी मदत मिळते.", en: "SHG loans at 6–12% interest. Plus community support." } },
  { title: { mr: "किसान क्रेडिट कार्ड घ्या", en: "Get a Kisan Credit Card" },
    desc: { mr: "४% व्याजदर, ₹३ लाखांपर्यंत. सावकाराच्या २५–४०% व्याजापेक्षा खूप स्वस्त.", en: "4% interest, up to ₹3 lakh. Far cheaper than moneylender's 25–40%." } },
  { title: { mr: "पीक विमा उतरवा", en: "Buy Crop Insurance" },
    desc: { mr: "फक्त १.५–२% प्रीमियम. नैसर्गिक आपत्तीत संपूर्ण नुकसान वाचते.", en: "Only 1.5–2% premium. Saves you from full crop loss in disasters." } },
  { title: { mr: "सावकाराचे कर्ज टाळा", en: "Avoid Moneylenders" },
    desc: { mr: "२५–६०% व्याजामुळे कर्जबाजारीपणा. बँक/सहकारी सोसायटी सर्वोत्तम.", en: "25–60% interest traps you in debt. Bank / co-op society is best." } },
  { title: { mr: "जन धन खाते", en: "Open Jan Dhan Account" },
    desc: { mr: "मोफत खाते, ₹२ लाख विमा, ₹१०,००० ओव्हरड्राफ्ट सुविधा.", en: "Free account, ₹2 lakh insurance, ₹10,000 overdraft facility." } },
  { title: { mr: "मोबाईल बँकिंग वापरा", en: "Use Mobile Banking" },
    desc: { mr: "BHIM/UPI ने विनामूल्य पैसे पाठवा. बँकेत जाण्याची गरज नाही.", en: "Send money free via BHIM/UPI. No need to visit bank." } },
  { title: { mr: "मुद्दल आधी परतफेड करा", en: "Pay Principal First" },
    desc: { mr: "जास्त हप्ता भरून मुद्दल कमी करा. एकूण व्याज खूप वाचते.", en: "Pay extra to reduce principal. Saves lots of interest overall." } },
  { title: { mr: "आपत्कालीन बचत ठेवा", en: "Keep Emergency Savings" },
    desc: { mr: "किमान ३ महिन्यांचा खर्च रोख/RD मध्ये ठेवा.", en: "Keep at least 3 months' expense in cash/RD." } },
  { title: { mr: "FPO मध्ये सामील व्हा", en: "Join an FPO" },
    desc: { mr: "उत्पादक कंपनी सोबत खत/बीज स्वस्त, विक्री जास्त भाव.", en: "Bulk buying discounts, better selling prices via FPO." } },
  { title: { mr: "सरकारी योजना वापरा", en: "Use Govt Schemes" },
    desc: { mr: "PM-Kisan, PMKSY, MahaDBT — मोफत पैसे मिळू शकतात.", en: "PM-Kisan, PMKSY, MahaDBT — free money if you qualify." } },
];

export type SoilInput = { colour: string; texture: string; irrigation: string };
type Level = "Low" | "Medium" | "High";
export function analyseSoil(i: SoilInput): {
  n: Level; p: Level; k: Level; ph: string; recs: { brand: string; dose: string }[]; summary: BL;
} {
  // simple deterministic mapping
  const isDark = i.colour === "dark";
  const isSticky = i.texture === "sticky";
  const isSandy = i.texture === "sandy";
  const n: Level = isDark ? "High" : isSandy ? "Low" : "Medium";
  const p: Level = isSticky ? "Medium" : isSandy ? "Low" : "Medium";
  const k: Level = isDark ? "High" : "Medium";
  const ph = isDark ? "6.8 – 7.4" : isSandy ? "6.0 – 6.6" : "6.4 – 7.0";
  const recs = [
    { brand: "Urea (46-0-0)", dose: n === "Low" ? "50 kg/acre" : n === "Medium" ? "30 kg/acre" : "20 kg/acre" },
    { brand: "SSP / DAP", dose: p === "Low" ? "50 kg/acre" : "30 kg/acre" },
    { brand: "MOP (Potash)", dose: k === "Low" ? "40 kg/acre" : "25 kg/acre" },
    { brand: "Compost / Vermicompost", dose: "1 – 2 ton/acre" },
  ];
  return { n, p, k, ph, recs, summary: {
    mr: `NPK: ${n}/${p}/${k} · pH ${ph}. सल्लानुसार खताचे प्रमाण घ्या.`,
    en: `NPK: ${n}/${p}/${k} · pH ${ph}. Apply fertilizer per recommendation.`
  } };
}
