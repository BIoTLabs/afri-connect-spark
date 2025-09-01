import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, Zap, Wifi, Tv, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BillProvider {
  id: string;
  provider_name: string;
  bill_type: string;
  is_active: boolean;
  logo_url?: string;
}

const BillPayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [providers, setProviders] = useState<BillProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [billType, setBillType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('bill_providers')
        .select('*')
        .eq('is_active', true)
        .order('provider_name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load bill providers",
        variant: "destructive"
      });
    }
  };

  const validateAccount = async () => {
    if (!selectedProvider || !accountNumber) return;
    
    setValidating(true);
    try {
      // Simulate account validation - in real app, this would call provider APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock customer name based on provider
      const provider = providers.find(p => p.id === selectedProvider);
      if (provider) {
        setCustomerName(`Customer for ${provider.provider_name}`);
        toast({
          title: "Account Validated",
          description: "Customer details retrieved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: "Could not validate account number",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handlePayBill = async () => {
    if (!user || !selectedProvider || !accountNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const provider = providers.find(p => p.id === selectedProvider);
      const referenceNumber = `BILL${Date.now()}`;

      const { error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          bill_type: provider?.bill_type || 'utility',
          provider_name: provider?.provider_name || '',
          account_number: accountNumber,
          customer_name: customerName,
          amount: parseFloat(amount),
          reference_number: referenceNumber,
          status: 'completed', // In real app, this would be 'pending' until payment confirms
          transaction_fee: parseFloat(amount) * 0.01, // 1% fee
          payment_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `Bill payment of ₦${parseFloat(amount).toLocaleString()} completed successfully`,
      });

      // Reset form
      setSelectedProvider("");
      setBillType("");
      setAccountNumber("");
      setCustomerName("");
      setAmount("");

      // Navigate back after delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error('Error paying bill:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getBillTypeIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="h-5 w-5" />;
      case 'internet': return <Wifi className="h-5 w-5" />;
      case 'cable_tv': return <Tv className="h-5 w-5" />;
      default: return <Receipt className="h-5 w-5" />;
    }
  };

  const groupedProviders = providers.reduce((acc, provider) => {
    if (!acc[provider.bill_type]) {
      acc[provider.bill_type] = [];
    }
    acc[provider.bill_type].push(provider);
    return acc;
  }, {} as Record<string, BillProvider[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border shadow-soft">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Pay Bills</h1>
              <p className="text-sm text-muted-foreground">
                Electricity, Water, Internet & More
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Bill Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Bill Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(groupedProviders).map(([type, typeProviders]) => (
                <Card 
                  key={type}
                  className={`cursor-pointer hover:shadow-soft transition-all ${billType === type ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setBillType(type)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {getBillTypeIcon(type)}
                    </div>
                    <h3 className="font-medium capitalize">{type.replace('_', ' ')}</h3>
                    <p className="text-xs text-muted-foreground">
                      {typeProviders.length} providers
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Provider Selection */}
        {billType && (
          <Card>
            <CardHeader>
              <CardTitle>Select Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupedProviders[billType]?.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center space-x-2">
                          {getBillTypeIcon(provider.bill_type)}
                          <span>{provider.provider_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Details */}
        {selectedProvider && (
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="account">Account Number / Meter Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="account"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={validateAccount}
                    disabled={!accountNumber || validating}
                  >
                    {validating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {customerName && (
                <div>
                  <Label>Customer Name</Label>
                  <Input value={customerName} disabled />
                </div>
              )}

              <div>
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        {amount && parseFloat(amount) > 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bill Amount:</span>
                  <span className="font-semibold">₦{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="font-semibold">₦{(parseFloat(amount) * 0.01).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-primary">
                    ₦{(parseFloat(amount) * 1.01).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pay Button */}
        {selectedProvider && accountNumber && amount && (
          <Button 
            onClick={handlePayBill}
            className="w-full bg-gradient-primary hover:bg-gradient-sunset shadow-warm text-lg py-6"
            disabled={loading || parseFloat(amount) <= 0}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing Payment...
              </>
            ) : (
              `Pay ₦${(parseFloat(amount) * 1.01).toLocaleString()}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BillPayments;