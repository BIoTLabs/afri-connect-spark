import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CryptoWallet {
  id: string;
  currency: string;
  balance: number;
  wallet_address: string;
  created_at: string;
}

interface CryptoTransaction {
  id: string;
  transaction_type: string;
  from_currency?: string;
  to_currency: string;
  from_amount?: number;
  to_amount: number;
  exchange_rate?: number;
  transaction_fee: number;
  network_fee: number;
  status: string;
  transaction_hash?: string;
  reference_number?: string;
  recipient_address?: string;
  created_at: string;
}

interface ExchangeRate {
  currency: string;
  usd_price: number;
  ngn_price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  last_updated: string;
}

export const useCrypto = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  const fetchWallets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWallets(data || []);
    } catch (error: any) {
      console.error('Error fetching crypto wallets:', error);
      toast.error('Failed to load crypto wallets');
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching crypto transactions:', error);
      toast.error('Failed to load crypto transactions');
    }
  };

  const fetchExchangeRates = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        // Call edge function to refresh rates from CoinGecko
        const { data: refreshData, error: refreshError } = await supabase.functions.invoke('coingecko-rates');
        
        if (refreshError) {
          console.error('Error refreshing rates:', refreshError);
          toast.error('Failed to refresh exchange rates');
        } else {
          setExchangeRates(refreshData.rates || []);
          return;
        }
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('crypto_exchange_rates')
        .select('*')
        .order('currency');

      if (error) throw error;
      setExchangeRates(data || []);
    } catch (error: any) {
      console.error('Error fetching exchange rates:', error);
      toast.error('Failed to load exchange rates');
    }
  };

  const createWallet = async (currency: string): Promise<CryptoWallet | null> => {
    if (!user) return null;

    try {
      // Generate a mock wallet address (in a real app, this would be more sophisticated)
      const walletAddress = `${currency.toUpperCase()}_${user.id.substring(0, 8)}_${Date.now()}`;

      const walletData = {
        user_id: user.id,
        currency: currency.toLowerCase(),
        balance: 0,
        wallet_address: walletAddress,
      };

      const { data, error } = await supabase
        .from('crypto_wallets')
        .insert(walletData)
        .select()
        .single();

      if (error) throw error;

      await fetchWallets();
      toast.success(`${currency.toUpperCase()} wallet created successfully`);
      return data;
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      toast.error(`Failed to create ${currency.toUpperCase()} wallet`);
      return null;
    }
  };

  const executeTrade = async (
    transactionType: 'buy' | 'sell' | 'exchange',
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number,
    toAmount: number,
    exchangeRate: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);

      const transactionFee = fromAmount * 0.005; // 0.5% fee
      const networkFee = transactionType === 'buy' ? 0 : 0.001; // Mock network fee
      const referenceNumber = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transactionData = {
        user_id: user.id,
        transaction_type: transactionType,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        from_amount: fromAmount,
        to_amount: toAmount,
        exchange_rate: exchangeRate,
        transaction_fee: transactionFee,
        network_fee: networkFee,
        status: 'processing',
        reference_number: referenceNumber,
      };

      const { error: transactionError } = await supabase
        .from('crypto_transactions')
        .insert(transactionData);

      if (transactionError) throw transactionError;

      // Update wallet balances (simplified - in production would be more complex)
      if (transactionType === 'buy') {
        // Add to crypto wallet
        const { error: updateError } = await supabase.rpc('update_crypto_balance', {
          p_user_id: user.id,
          p_currency: toCurrency,
          p_amount: toAmount
        });

        if (updateError) {
          console.error('Error updating crypto balance:', updateError);
        }
      }

      // Simulate processing delay
      setTimeout(async () => {
        await supabase
          .from('crypto_transactions')
          .update({ status: 'completed' })
          .eq('reference_number', referenceNumber);
      }, 2000);

      await Promise.all([fetchWallets(), fetchTransactions()]);
      toast.success(`${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} order submitted successfully`);
      return true;
    } catch (error: any) {
      console.error('Error executing trade:', error);
      toast.error(`Failed to execute ${transactionType}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTotalPortfolioValue = () => {
    return wallets.reduce((total, wallet) => {
      const rate = exchangeRates.find(r => r.currency === wallet.currency);
      return total + (wallet.balance * (rate?.usd_price || 0));
    }, 0);
  };

  const getWalletByurrency = (currency: string) => {
    return wallets.find(w => w.currency === currency.toLowerCase());
  };

  const getRateForCurrency = (currency: string) => {
    return exchangeRates.find(r => r.currency === currency.toLowerCase());
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWallets(),
        fetchTransactions(),
        fetchExchangeRates()
      ]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    loading,
    wallets,
    transactions,
    exchangeRates,
    createWallet,
    executeTrade,
    fetchExchangeRates,
    getTotalPortfolioValue,
    getWalletByurrency,
    getRateForCurrency,
    refreshData: async () => {
      await Promise.all([
        fetchWallets(),
        fetchTransactions(),
        fetchExchangeRates(true)
      ]);
    }
  };
};