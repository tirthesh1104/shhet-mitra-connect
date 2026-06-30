export type Disease = {
  key: string;
  name: { mr: string; en: string };
  crops: string[];
  cause: { mr: string; en: string };
  organic: { mr: string; en: string };
  chemical: { mr: string; en: string };
  brands: string[]; // Indian brand examples
  costRange: [number, number]; // INR per acre
};

export const DISEASES: Disease[] = [
  {
    key: "late_blight",
    name: { mr: "करपा रोग (लेट ब्लाइट)", en: "Late Blight" },
    crops: ["Tomato", "Potato"],
    cause: { mr: "ओलावा व थंड हवामानामुळे Phytophthora बुरशी पसरते.", en: "Phytophthora fungus spread by cool, wet weather." },
    organic: { mr: "नीम तेल + गोमूत्र फवारणी, संक्रमित पाने काढून जाळा.", en: "Neem oil + cow urine spray; remove and burn infected leaves." },
    chemical: { mr: "Mancozeb किंवा Metalaxyl ची फवारणी ७ दिवसांच्या अंतराने.", en: "Spray Mancozeb or Metalaxyl every 7 days." },
    brands: ["Indofil M-45", "Ridomil Gold"],
    costRange: [350, 700],
  },
  {
    key: "powdery_mildew",
    name: { mr: "भुरी रोग", en: "Powdery Mildew" },
    crops: ["Grape", "Cucumber", "Wheat"],
    cause: { mr: "Erysiphe बुरशी; उष्ण व कोरडे हवामान.", en: "Erysiphe fungus; warm dry weather." },
    organic: { mr: "दूध + पाणी (१:९) फवारणी, सल्फर धुळणी.", en: "Milk + water (1:9) spray; sulphur dust." },
    chemical: { mr: "Hexaconazole किंवा Sulphur फवारणी.", en: "Spray Hexaconazole or wettable Sulphur." },
    brands: ["Contaf", "Sulfex"],
    costRange: [300, 600],
  },
  {
    key: "leaf_curl",
    name: { mr: "पान कुरतडणारा रोग", en: "Leaf Curl Virus" },
    crops: ["Tomato", "Chilli", "Cotton"],
    cause: { mr: "पांढरी माशी (whitefly) वाहक असलेला विषाणू.", en: "Virus transmitted by whitefly." },
    organic: { mr: "पिवळ्या चिकट सापळे, नीम तेल फवारणी.", en: "Yellow sticky traps; neem oil spray." },
    chemical: { mr: "Imidacloprid किंवा Acetamiprid फवारणी.", en: "Spray Imidacloprid or Acetamiprid." },
    brands: ["Confidor", "Pride"],
    costRange: [400, 800],
  },
  {
    key: "bacterial_spot",
    name: { mr: "जिवाणू ठिपका", en: "Bacterial Spot" },
    crops: ["Tomato", "Capsicum"],
    cause: { mr: "Xanthomonas जिवाणू; पावसाळी हवामान.", en: "Xanthomonas bacteria; rainy weather." },
    organic: { mr: "Bordeaux मिश्रण फवारणी; योग्य अंतर ठेवा.", en: "Bordeaux mixture spray; maintain spacing." },
    chemical: { mr: "Copper Oxychloride + Streptocycline.", en: "Copper Oxychloride + Streptocycline." },
    brands: ["Blitox", "Streptocycline"],
    costRange: [300, 550],
  },
  {
    key: "rust",
    name: { mr: "तांबेरा (रस्ट)", en: "Rust" },
    crops: ["Wheat", "Soybean", "Coffee"],
    cause: { mr: "Puccinia बुरशी; आर्द्र वातावरण.", en: "Puccinia fungus; humid conditions." },
    organic: { mr: "Trichoderma fertigation; प्रतिकारक्षम वाण निवडा.", en: "Trichoderma fertigation; choose resistant varieties." },
    chemical: { mr: "Propiconazole किंवा Tebuconazole फवारणी.", en: "Spray Propiconazole or Tebuconazole." },
    brands: ["Tilt", "Folicur"],
    costRange: [350, 650],
  },
  {
    key: "anthracnose",
    name: { mr: "करपा (ऍन्थ्रॅक्नोज)", en: "Anthracnose" },
    crops: ["Mango", "Chilli", "Banana"],
    cause: { mr: "Colletotrichum बुरशी; ओलसर हवामान.", en: "Colletotrichum fungus; moist weather." },
    organic: { mr: "नीम अर्क + लसूण अर्क फवारणी.", en: "Neem + garlic extract spray." },
    chemical: { mr: "Carbendazim किंवा Mancozeb फवारणी.", en: "Spray Carbendazim or Mancozeb." },
    brands: ["Bavistin", "Indofil M-45"],
    costRange: [300, 600],
  },
  {
    key: "stem_borer",
    name: { mr: "खोडकिडा", en: "Stem Borer" },
    crops: ["Rice", "Sugarcane"],
    cause: { mr: "Scirpophaga अळी खोडात शिरते.", en: "Scirpophaga larvae bore into stems." },
    organic: { mr: "Trichogramma अंडी सोडा; light traps.", en: "Release Trichogramma eggs; use light traps." },
    chemical: { mr: "Cartap Hydrochloride किंवा Chlorantraniliprole.", en: "Cartap Hydrochloride or Chlorantraniliprole." },
    brands: ["Padan", "Coragen"],
    costRange: [500, 900],
  },
  {
    key: "downy_mildew",
    name: { mr: "केवडा रोग", en: "Downy Mildew" },
    crops: ["Grape", "Onion", "Pearl millet"],
    cause: { mr: "Plasmopara बुरशी; थंड व दमट हवा.", en: "Plasmopara fungus; cool humid air." },
    organic: { mr: "Bordeaux मिश्रण; योग्य निचरा.", en: "Bordeaux mixture; ensure drainage." },
    chemical: { mr: "Metalaxyl + Mancozeb फवारणी.", en: "Spray Metalaxyl + Mancozeb." },
    brands: ["Ridomil Gold", "Curzate M8"],
    costRange: [400, 750],
  },
  {
    key: "wilt",
    name: { mr: "मर रोग", en: "Fusarium Wilt" },
    crops: ["Banana", "Tomato", "Cotton"],
    cause: { mr: "Fusarium बुरशी मुळांवर हल्ला करते.", en: "Fusarium fungus attacks roots." },
    organic: { mr: "Trichoderma viride सोलराइझेशन.", en: "Trichoderma viride + soil solarization." },
    chemical: { mr: "Carbendazim drench मुळाभोवती.", en: "Carbendazim drench around roots." },
    brands: ["Bavistin"],
    costRange: [350, 700],
  },
  {
    key: "healthy",
    name: { mr: "निरोगी पीक", en: "Healthy" },
    crops: ["*"],
    cause: { mr: "कोणतीही समस्या आढळली नाही.", en: "No issues detected." },
    organic: { mr: "पीक चांगले आहे — नियमित निरीक्षण ठेवा.", en: "Crop looks healthy — continue regular monitoring." },
    chemical: { mr: "कोणत्याही उपचाराची गरज नाही.", en: "No chemical treatment needed." },
    brands: [],
    costRange: [0, 0],
  },
];
