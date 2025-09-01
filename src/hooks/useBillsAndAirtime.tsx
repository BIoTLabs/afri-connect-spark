import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Bill {
  id: string;
  user_id: string;
  bill_type: string;
  provider_name: string;
  account_number: string;
  customer_name?: string;
  amount: number;
  reference_number?: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_fee: number;
  payment_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AirtimePurchase {
  id: string;
  user_id: string;
  network_provider: string;
  phone_number: string;
  amount: number;
  reference_number?: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_fee: number;
  created_at: string;
  updated_at: string;
}

export interface BillProvider {
  id: string;
  provider_name: string;
  bill_type: string;
  is_active: boolean;
  logo_url?: string;
  created_at: string;
}

export interface MobileNetwork {
  id: string;
  network_name: string;
  network_code: string;
  is_active: boolean;
  logo_url?: string;
  created_at: string;
}

export const useBillsAndAirtime = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [airtimePurchases, setAirtimePurchases] = useState<AirtimePurchase[]>([]);
  const [billProviders, setBillProviders] = useState<BillProvider[]>([]);
  const [mobileNetworks, setMobileNetworks] = useState<MobileNetwork[]>([]);

  // Fetch all data
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's bills
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (billsError) throw billsError;
      setBills((billsData || []) as Bill[]);

      // Fetch user's airtime purchases
      const { data: airtimeData, error: airtimeError } = await supabase
        .from('airtime_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (airtimeError) throw airtimeError;
      setAirtimePurchases((airtimeData || []) as AirtimePurchase[]);

      // Fetch bill providers
      const { data: providersData, error: providersError } = await supabase
        .from('bill_providers')
        .select('*')
        .eq('is_active', true)
        .order('provider_name');

      if (providersError) throw providersError;
      setBillProviders(providersData || []);

      // Fetch mobile networks
      const { data: networksData, error: networksError } = await supabase
        .from('mobile_networks')
        .select('*')
        .eq('is_active', true)
        .order('network_name');

      if (networksError) throw networksError;
      setMobileNetworks(networksData || []);

    } catch (error) {
      console.error('Error fetching bills and airtime data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Pay a bill
  const payBill = async (billData: {
    bill_type: string;
    provider_name: string;
    account_number: string;
    customer_name?: string;
    amount: number;
    due_date?: string;
  }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to pay bills',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const referenceNumber = `BILL${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const transactionFee = Math.max(50, billData.amount * 0.01); // Minimum ₦50 or 1%

      const { data, error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          bill_type: billData.bill_type,
          provider_name: billData.provider_name,
          account_number: billData.account_number,
          customer_name: billData.customer_name,
          amount: billData.amount,
          reference_number: referenceNumber,
          status: 'completed', // In real app, would start as 'pending'
          transaction_fee: transactionFee,
          payment_date: new Date().toISOString(),
          due_date: billData.due_date
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh bills data
      await fetchData();

      toast({
        title: 'Bill Payment Successful!',
        description: `₦${billData.amount.toLocaleString()} paid to ${billData.provider_name}`,
      });

      return data;
    } catch (error) {
      console.error('Error paying bill:', error);
      toast({
        title: 'Payment Failed',
        description: 'Unable to process bill payment. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Purchase airtime
  const purchaseAirtime = async (airtimeData: {
    network_provider: string;
    phone_number: string;
    amount: number;
  }) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to purchase airtime',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const referenceNumber = `AIR${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const transactionFee = Math.max(10, airtimeData.amount * 0.01); // Minimum ₦10 or 1%

      const { data, error } = await supabase
        .from('airtime_purchases')
        .insert({
          user_id: user.id,
          network_provider: airtimeData.network_provider,
          phone_number: airtimeData.phone_number,
          amount: airtimeData.amount,
          reference_number: referenceNumber,
          status: 'completed', // In real app, would start as 'pending'
          transaction_fee: transactionFee,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh airtime purchases data
      await fetchData();

      toast({
        title: 'Airtime Purchase Successful!',
        description: `₦${airtimeData.amount.toLocaleString()} airtime sent to ${airtimeData.phone_number}`,
      });

      return data;
    } catch (error) {
      console.error('Error purchasing airtime:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Unable to process airtime purchase. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Get transaction history (bills + airtime combined)
  const getTransactionHistory = () => {
    const billTransactions = bills.map(bill => ({
      id: bill.id,
      type: 'bill' as const,
      description: `${bill.provider_name} - ${bill.account_number}`,
      amount: bill.amount,
      fee: bill.transaction_fee,
      status: bill.status,
      reference: bill.reference_number,
      date: bill.created_at,
      provider: bill.provider_name
    }));

    const airtimeTransactions = airtimePurchases.map(airtime => ({
      id: airtime.id,
      type: 'airtime' as const,
      description: `${airtime.network_provider} - ${airtime.phone_number}`,
      amount: airtime.amount,
      fee: airtime.transaction_fee,
      status: airtime.status,
      reference: airtime.reference_number,
      date: airtime.created_at,
      provider: airtime.network_provider
    }));

    return [...billTransactions, ...airtimeTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get spending analytics
  const getSpendingAnalytics = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthBills = bills.filter(bill => {
      const billDate = new Date(bill.created_at);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });

    const thisMonthAirtime = airtimePurchases.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
    });

    const totalBillsAmount = thisMonthBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
    const totalAirtimeAmount = thisMonthAirtime.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
    const totalSpent = totalBillsAmount + totalAirtimeAmount;

    return {
      thisMonth: {
        bills: {
          count: thisMonthBills.length,
          amount: totalBillsAmount
        },
        airtime: {
          count: thisMonthAirtime.length,
          amount: totalAirtimeAmount
        },
        total: totalSpent
      },
      byProvider: {
        bills: billProviders.map(provider => ({
          name: provider.provider_name,
          amount: thisMonthBills
            .filter(bill => bill.provider_name === provider.provider_name)
            .reduce((sum, bill) => sum + Number(bill.amount), 0)
        })).filter(item => item.amount > 0),
        airtime: mobileNetworks.map(network => ({
          name: network.network_name,
          amount: thisMonthAirtime
            .filter(purchase => purchase.network_provider === network.network_name)
            .reduce((sum, purchase) => sum + Number(purchase.amount), 0)
        })).filter(item => item.amount > 0)
      }
    };
  };

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    loading,
    bills,
    airtimePurchases,
    billProviders,
    mobileNetworks,
    payBill,
    purchaseAirtime,
    getTransactionHistory,
    getSpendingAnalytics,
    refreshData: fetchData
  };
};