-- Create crypto wallets table
CREATE TABLE public.crypto_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  currency TEXT NOT NULL, -- BTC, ETH, USDT, etc.
  balance NUMERIC NOT NULL DEFAULT 0.00,
  wallet_address TEXT NOT NULL,
  private_key_encrypted TEXT, -- Store encrypted private keys
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Enable RLS
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own crypto wallets" 
ON public.crypto_wallets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto wallets" 
ON public.crypto_wallets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto wallets" 
ON public.crypto_wallets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create crypto transactions table
CREATE TABLE public.crypto_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'buy', 'sell', 'send', 'receive', 'exchange'
  from_currency TEXT,
  to_currency TEXT NOT NULL,
  from_amount NUMERIC,
  to_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC,
  transaction_fee NUMERIC DEFAULT 0.00,
  network_fee NUMERIC DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  transaction_hash TEXT,
  reference_number TEXT,
  recipient_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own crypto transactions" 
ON public.crypto_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto transactions" 
ON public.crypto_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto transactions" 
ON public.crypto_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create payment requests table (for QR code generation)
CREATE TABLE public.payment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  qr_code_data TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paid', 'expired', 'cancelled'
  payment_method TEXT NOT NULL, -- 'crypto', 'fiat', 'mobile_money'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payment requests" 
ON public.payment_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment requests" 
ON public.payment_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment requests" 
ON public.payment_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create crypto exchange rates table (cached from CoinGecko)
CREATE TABLE public.crypto_exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  currency TEXT NOT NULL,
  usd_price NUMERIC NOT NULL,
  ngn_price NUMERIC NOT NULL,
  price_change_24h NUMERIC DEFAULT 0.00,
  market_cap NUMERIC,
  volume_24h NUMERIC,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(currency)
);

-- Enable RLS
ALTER TABLE public.crypto_exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view exchange rates (public data)
CREATE POLICY "Anyone can view crypto exchange rates" 
ON public.crypto_exchange_rates 
FOR SELECT 
USING (true);

-- Create cross-border transactions table
CREATE TABLE public.cross_border_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kyc_verification_id UUID,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_country TEXT NOT NULL,
  recipient_currency TEXT NOT NULL,
  send_amount NUMERIC NOT NULL,
  send_currency TEXT NOT NULL,
  receive_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  transaction_fee NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'kyc_required', 'processing', 'completed', 'failed'
  reference_number TEXT,
  provider TEXT, -- 'internal', 'remitly', etc.
  provider_transaction_id TEXT,
  purpose_of_transfer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cross_border_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cross-border transactions" 
ON public.cross_border_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cross-border transactions" 
ON public.cross_border_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cross-border transactions" 
ON public.cross_border_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_crypto_wallets_updated_at
BEFORE UPDATE ON public.crypto_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_transactions_updated_at
BEFORE UPDATE ON public.crypto_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cross_border_transactions_updated_at
BEFORE UPDATE ON public.cross_border_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial crypto exchange rates (will be updated by CoinGecko API)
INSERT INTO public.crypto_exchange_rates (currency, usd_price, ngn_price) VALUES
('bitcoin', 43500.00, 67282500.00),
('ethereum', 2650.00, 4097500.00),
('tether', 1.00, 1545.00),
('binancecoin', 315.00, 486675.00),
('cardano', 0.45, 695.25);