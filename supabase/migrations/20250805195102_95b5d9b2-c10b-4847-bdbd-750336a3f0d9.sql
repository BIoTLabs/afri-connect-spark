-- Create KYC verification table
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requires_review')),
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'drivers_license', 'national_id')),
  document_number TEXT NOT NULL,
  document_front_url TEXT,
  document_back_url TEXT,
  selfie_url TEXT,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  occupation TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create savings accounts table
CREATE TABLE public.savings_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL DEFAULT 'My Savings',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.045, -- 4.5%
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create savings goals table
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auto-save rules table
CREATE TABLE public.auto_save_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('fixed_amount', 'percentage', 'round_up')),
  amount DECIMAL(15,2), -- For fixed amount rules
  percentage DECIMAL(5,2), -- For percentage rules (e.g., 10.00 for 10%)
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  trigger_condition TEXT, -- e.g., 'salary_deposit', 'any_income'
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_execution_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create savings transactions table
CREATE TABLE public.savings_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  savings_account_id UUID NOT NULL REFERENCES public.savings_accounts(id) ON DELETE CASCADE,
  savings_goal_id UUID REFERENCES public.savings_goals(id) ON DELETE SET NULL,
  auto_save_rule_id UUID REFERENCES public.auto_save_rules(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'interest', 'auto_save')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_save_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for KYC verifications
CREATE POLICY "Users can view their own KYC verification" 
ON public.kyc_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own KYC verification" 
ON public.kyc_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own KYC verification" 
ON public.kyc_verifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for savings accounts
CREATE POLICY "Users can view their own savings accounts" 
ON public.savings_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings accounts" 
ON public.savings_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings accounts" 
ON public.savings_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for savings goals
CREATE POLICY "Users can view their own savings goals" 
ON public.savings_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals" 
ON public.savings_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals" 
ON public.savings_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals" 
ON public.savings_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for auto-save rules
CREATE POLICY "Users can view their own auto-save rules" 
ON public.auto_save_rules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own auto-save rules" 
ON public.auto_save_rules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auto-save rules" 
ON public.auto_save_rules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auto-save rules" 
ON public.auto_save_rules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for savings transactions
CREATE POLICY "Users can view their own savings transactions" 
ON public.savings_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings transactions" 
ON public.savings_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to generate account numbers
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SAV' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update account balance after transactions
CREATE OR REPLACE FUNCTION public.update_savings_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    IF NEW.transaction_type IN ('deposit', 'interest', 'auto_save') THEN
      UPDATE public.savings_accounts 
      SET balance = balance + NEW.amount,
          updated_at = now()
      WHERE id = NEW.savings_account_id;
    ELSIF NEW.transaction_type = 'withdrawal' THEN
      UPDATE public.savings_accounts 
      SET balance = balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.savings_account_id;
    END IF;
    
    -- Update goal progress if applicable
    IF NEW.savings_goal_id IS NOT NULL AND NEW.transaction_type IN ('deposit', 'auto_save') THEN
      UPDATE public.savings_goals 
      SET current_amount = current_amount + NEW.amount,
          updated_at = now()
      WHERE id = NEW.savings_goal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for balance updates
CREATE TRIGGER update_savings_balance_trigger
  AFTER INSERT ON public.savings_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_savings_balance();

-- Create trigger for updated_at columns
CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_accounts_updated_at
  BEFORE UPDATE ON public.savings_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_save_rules_updated_at
  BEFORE UPDATE ON public.auto_save_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();