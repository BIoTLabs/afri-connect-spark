-- Fix function search path security warnings by setting proper search_path
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN 'SAV' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_savings_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;