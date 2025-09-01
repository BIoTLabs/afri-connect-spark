-- Create bills and airtime transactions tables

-- Bills table to store bill payment information
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_type TEXT NOT NULL, -- 'electricity', 'water', 'internet', 'cable_tv', etc.
  provider_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  customer_name TEXT,
  amount DECIMAL(15,2) NOT NULL,
  reference_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_fee DECIMAL(10,2) DEFAULT 0.00,
  payment_date TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Airtime purchases table
CREATE TABLE public.airtime_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  network_provider TEXT NOT NULL, -- 'MTN', 'Airtel', 'Glo', '9Mobile', etc.
  phone_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_fee DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bill providers reference table for supported providers
CREATE TABLE public.bill_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  bill_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mobile networks reference table
CREATE TABLE public.mobile_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network_name TEXT NOT NULL,
  network_code TEXT,
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airtime_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_networks ENABLE ROW LEVEL SECURITY;

-- RLS policies for bills
CREATE POLICY "Users can view their own bills" ON public.bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills" ON public.bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" ON public.bills
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for airtime_purchases
CREATE POLICY "Users can view their own airtime purchases" ON public.airtime_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own airtime purchases" ON public.airtime_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own airtime purchases" ON public.airtime_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for reference tables (public read access)
CREATE POLICY "Anyone can view bill providers" ON public.bill_providers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view mobile networks" ON public.mobile_networks
  FOR SELECT USING (true);

-- Insert some sample bill providers
INSERT INTO public.bill_providers (provider_name, bill_type) VALUES
  ('EKEDC', 'electricity'),
  ('IKEDC', 'electricity'),
  ('KEDCO', 'electricity'),
  ('PHCN', 'electricity'),
  ('Lagos Water Corporation', 'water'),
  ('FCT Water Board', 'water'),
  ('MTN Nigeria', 'internet'),
  ('Airtel Nigeria', 'internet'),
  ('DSTV', 'cable_tv'),
  ('GOTV', 'cable_tv'),
  ('StarTimes', 'cable_tv');

-- Insert mobile networks
INSERT INTO public.mobile_networks (network_name, network_code) VALUES
  ('MTN Nigeria', 'MTN'),
  ('Airtel Nigeria', 'AIRTEL'), 
  ('Glo Mobile', 'GLO'),
  ('9Mobile', '9MOBILE');

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION public.generate_reference_number(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN prefix || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$;

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_airtime_purchases_updated_at
  BEFORE UPDATE ON public.airtime_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();