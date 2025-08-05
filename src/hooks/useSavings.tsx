import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SavingsAccount {
  id: string;
  account_number: string;
  account_name: string;
  balance: number;
  interest_rate: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SavingsGoal {
  id: string;
  savings_account_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AutoSaveRule {
  id: string;
  savings_account_id: string;
  rule_type: 'fixed_amount' | 'percentage' | 'round_up';
  amount: number;
  percentage: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  trigger_condition: string;
  is_active: boolean;
  next_execution_date: string;
  created_at: string;
  updated_at: string;
}

interface SavingsTransaction {
  id: string;
  savings_account_id: string;
  savings_goal_id?: string;
  auto_save_rule_id?: string;
  transaction_type: 'deposit' | 'withdrawal' | 'interest' | 'auto_save';
  amount: number;
  description: string;
  reference_number: string;
  status: string;
  created_at: string;
}

export const useSavings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [rules, setRules] = useState<AutoSaveRule[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);

  const fetchSavingsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch savings accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsError) throw accountsError;
      setAccounts(accountsData || []);

      if (accountsData && accountsData.length > 0) {
        const accountIds = accountsData.map(acc => acc.id);

        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('savings_goals')
          .select('*')
          .in('savings_account_id', accountIds);

        if (goalsError) throw goalsError;
        setGoals(goalsData || []);

        // Fetch auto-save rules
        const { data: rulesData, error: rulesError } = await supabase
          .from('auto_save_rules')
          .select('*')
          .in('savings_account_id', accountIds);

        if (rulesError) throw rulesError;
        setRules((rulesData || []) as AutoSaveRule[]);

        // Fetch recent transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('savings_transactions')
          .select('*')
          .in('savings_account_id', accountIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (transactionsError) throw transactionsError;
        setTransactions((transactionsData || []) as SavingsTransaction[]);
      }
    } catch (error) {
      console.error('Error fetching savings data:', error);
      toast({
        title: "Error",
        description: "Failed to load savings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSavingsAccount = async (accountName: string = 'My Savings') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .insert({
          user_id: user.id,
          account_number: `SAV${Date.now()}`, // Will be overridden by function
          account_name: accountName
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Savings account created successfully",
      });

      await fetchSavingsData();
      return data;
    } catch (error) {
      console.error('Error creating savings account:', error);
      toast({
        title: "Error",
        description: "Failed to create savings account",
        variant: "destructive",
      });
      return null;
    }
  };

  const createSavingsGoal = async (goalData: {
    savings_account_id: string;
    title: string;
    description?: string;
    target_amount: number;
    target_date?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          ...goalData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Savings goal created successfully",
      });

      await fetchSavingsData();
      return data;
    } catch (error) {
      console.error('Error creating savings goal:', error);
      toast({
        title: "Error",
        description: "Failed to create savings goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const createAutoSaveRule = async (ruleData: {
    savings_account_id: string;
    rule_type: 'fixed_amount' | 'percentage' | 'round_up';
    amount?: number;
    percentage?: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    trigger_condition?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('auto_save_rules')
        .insert({
          user_id: user.id,
          ...ruleData
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Auto-save rule created successfully",
      });

      await fetchSavingsData();
      return data;
    } catch (error) {
      console.error('Error creating auto-save rule:', error);
      toast({
        title: "Error",
        description: "Failed to create auto-save rule",
        variant: "destructive",
      });
      return null;
    }
  };

  const makeDeposit = async (
    savings_account_id: string,
    amount: number,
    description: string = 'Manual deposit',
    savings_goal_id?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .insert({
          user_id: user.id,
          savings_account_id,
          savings_goal_id,
          transaction_type: 'deposit',
          amount,
          description,
          reference_number: `DEP${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deposited ₦${amount.toLocaleString()}`,
      });

      await fetchSavingsData();
      return data;
    } catch (error) {
      console.error('Error making deposit:', error);
      toast({
        title: "Error",
        description: "Failed to make deposit",
        variant: "destructive",
      });
      return null;
    }
  };

  const makeWithdrawal = async (
    savings_account_id: string,
    amount: number,
    description: string = 'Manual withdrawal'
  ) => {
    if (!user) return null;

    try {
      // Check if sufficient balance
      const account = accounts.find(acc => acc.id === savings_account_id);
      if (!account || account.balance < amount) {
        toast({
          title: "Error",
          description: "Insufficient balance",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('savings_transactions')
        .insert({
          user_id: user.id,
          savings_account_id,
          transaction_type: 'withdrawal',
          amount,
          description,
          reference_number: `WTH${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrew ₦${amount.toLocaleString()}`,
      });

      await fetchSavingsData();
      return data;
    } catch (error) {
      console.error('Error making withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to make withdrawal",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavingsData();
    }
  }, [user]);

  return {
    loading,
    accounts,
    goals,
    rules,
    transactions,
    createSavingsAccount,
    createSavingsGoal,
    createAutoSaveRule,
    makeDeposit,
    makeWithdrawal,
    refreshData: fetchSavingsData
  };
};