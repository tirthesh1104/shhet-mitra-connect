
CREATE TABLE public.krishi_kendras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT,
  hours TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.krishi_kendras TO anon, authenticated;
GRANT ALL ON public.krishi_kendras TO service_role;
ALTER TABLE public.krishi_kendras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read krishi kendras" ON public.krishi_kendras FOR SELECT USING (true);

INSERT INTO public.krishi_kendras (name, type, taluka, district, phone, hours) VALUES
('Sangli Krishi Vigyan Kendra','krishi_kendra','Miraj','Sangli','0233-2234567','9:00 – 17:00'),
('Warana Seeds & Fertilizer','seed_shop','Panhala','Kolhapur','0231-9876543','8:00 – 20:00'),
('Baramati Soil Testing Lab','soil_lab','Baramati','Pune','02112-345678','10:00 – 16:00'),
('Krishi Seva Kendra Nashik','krishi_kendra','Niphad','Nashik','0253-1234987','9:00 – 18:00'),
('Mahalakshmi Fertilizer Dealer','fertilizer_dealer','Karad','Satara','02164-234561','8:30 – 19:30'),
('Shivaji Krishi Center','krishi_kendra','Solapur North','Solapur','0217-2345678','9:00 – 17:30'),
('Kolhapur Beej Bhandar','seed_shop','Karvir','Kolhapur','0231-2233445','8:00 – 21:00'),
('MPKV Rahuri Soil Lab','soil_lab','Rahuri','Ahmednagar','02426-243201','10:00 – 17:00'),
('Jai Kisan Fertilizer','fertilizer_dealer','Latur','Latur','02382-234556','8:00 – 20:00'),
('Nashik Agri Seva','krishi_kendra','Nashik Rd','Nashik','0253-2456789','9:00 – 18:00'),
('Vidarbha Beej Kendra','seed_shop','Wardha','Wardha','07152-234567','8:30 – 19:00'),
('Aurangabad Soil Testing','soil_lab','Aurangabad','Aurangabad','0240-2345678','10:00 – 16:00'),
('Bharat Fertilizer','fertilizer_dealer','Amravati','Amravati','0721-2345678','8:00 – 20:00'),
('Krishi Bandhu Kendra','krishi_kendra','Pandharpur','Solapur','02186-234567','9:00 – 17:00'),
('Godavari Seeds','seed_shop','Kopargaon','Ahmednagar','02423-222333','8:30 – 19:30'),
('Vasantrao Naik KVK','krishi_kendra','Yavatmal','Yavatmal','07232-234567','9:00 – 17:30'),
('Beed Krishi Center','krishi_kendra','Beed','Beed','02442-234567','9:00 – 18:00'),
('Osmanabad Fertilizer Hub','fertilizer_dealer','Osmanabad','Osmanabad','02472-234567','8:00 – 20:00'),
('Ratnagiri Coastal Krishi','krishi_kendra','Ratnagiri','Ratnagiri','02352-234567','9:00 – 17:00'),
('Konkan Beej Kendra','seed_shop','Chiplun','Ratnagiri','02355-234567','8:30 – 19:00');
