import { useState } from "react";
import { ArrowLeft, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useKYC } from "@/hooks/useKYC";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function CrossBorder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kyc, isKYCApproved } = useKYC();
  
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState('NGN');
  const [recipientCountry, setRecipientCountry] = useState('');
  const [recipientCurrency, setRecipientCurrency] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const africanCountries = [
    { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
    { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦' },
    { code: 'UG', name: 'Uganda', currency: 'UGX', flag: '🇺🇬' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿' },
    { code: 'RW', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼' },
    { code: 'ET', name: 'Ethiopia', currency: 'ETB', flag: '🇪🇹' },
    { code: 'SN', name: 'Senegal', currency: 'XOF', flag: '🇸🇳' },
    { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', flag: '🇨🇮' },
    { code: 'MA', name: 'Morocco', currency: 'MAD', flag: '🇲🇦' },
    { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
    { code: 'ZM', name: 'Zambia', currency: 'ZMW', flag: '🇿🇲' },
  ];

  const sendCurrencies = [
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'EUR', name: 'Euro' },
  ];

  const transferPurposes = [
    'Family Support',
    'Education',
    'Medical Expenses',
    'Business',
    'Investment',
    'Property Purchase',
    'Travel',
    'Other',
  ];

  const getExchangeRate = (from: string, to: string) => {
    // Mock exchange rates - in production, this would come from a real API
    const rates: Record<string, Record<string, number>> = {
      'NGN': {
        'KES': 0.32,
        'GHS': 0.07,
        'ZAR': 0.03,
        'UGX': 8.5,
        'TZS': 5.2,
        'RWF': 2.1,
        'ETB': 0.15,
        'XOF': 1.8,
        'MAD': 0.025,
        'EGP': 0.08,
        'ZMW': 0.04,
      },
      'USD': {
        'KES': 130,
        'GHS': 16,
        'ZAR': 18,
        'UGX': 3700,
        'TZS': 2300,
        'RWF': 1320,
        'ETB': 120,
        'XOF': 600,
        'MAD': 10,
        'EGP': 49,
        'ZMW': 27,
      }
    };

    return rates[from]?.[to] || 1;
  };

  const calculateReceiveAmount = () => {
    if (!sendAmount || !sendCurrency || !recipientCurrency) return 0;
    const rate = getExchangeRate(sendCurrency, recipientCurrency);
    const amount = parseFloat(sendAmount);
    return amount * rate;
  };

  const calculateTransactionFee = () => {
    if (!sendAmount) return 0;
    const amount = parseFloat(sendAmount);
    return Math.max(amount * 0.02, 5); // 2% or minimum $5
  };

  const handleCountryChange = (countryCode: string) => {
    setRecipientCountry(countryCode);
    const country = africanCountries.find(c => c.code === countryCode);
    if (country) {
      setRecipientCurrency(country.currency);
    }
  };

  const handleSendMoney = async () => {
    if (!user || !isKYCApproved()) {
      toast.error('KYC verification required for international transfers');
      navigate('/kyc-onboarding');
      return;
    }

    if (!sendAmount || !recipientCountry || !recipientName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        user_id: user.id,
        kyc_verification_id: kyc?.id,
        recipient_name: recipientName,
        recipient_phone: recipientPhone || null,
        recipient_country: recipientCountry,
        recipient_currency: recipientCurrency,
        send_amount: parseFloat(sendAmount),
        send_currency: sendCurrency,
        receive_amount: calculateReceiveAmount(),
        exchange_rate: getExchangeRate(sendCurrency, recipientCurrency),
        transaction_fee: calculateTransactionFee(),
        purpose_of_transfer: transferPurpose,
        provider: 'internal',
        reference_number: `CBT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const { error } = await supabase
        .from('cross_border_transactions')
        .insert(transactionData);

      if (error) throw error;

      toast.success('Cross-border transfer initiated successfully');
      navigate('/transactions');
    } catch (error: any) {
      console.error('Error sending money:', error);
      toast.error('Failed to initiate transfer');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cross-Border Payments</h1>
            <p className="text-muted-foreground">Send money across Africa instantly</p>
          </div>
        </div>

        {/* KYC Status Alert */}
        {!isKYCApproved() && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>KYC verification is required for international transfers.</span>
                <Button variant="outline" size="sm" onClick={() => navigate('/kyc-onboarding')}>
                  Complete KYC
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Money Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Send Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Send Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>You Send</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={sendCurrency} onValueChange={setSendCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sendCurrencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recipient Details */}
                <Separator />
                
                <div>
                  <Label>Recipient Country</Label>
                  <Select value={recipientCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name} ({country.currency})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Recipient Name *</Label>
                    <Input
                      placeholder="Full name as on ID"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Recipient Phone</Label>
                    <Input
                      placeholder="Phone number (optional)"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Purpose of Transfer *</Label>
                  <Select value={transferPurpose} onValueChange={setTransferPurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {transferPurposes.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSendMoney}
                  disabled={loading || !isKYCApproved() || !sendAmount || !recipientCountry || !recipientName}
                >
                  {loading ? 'Processing...' : 'Send Money'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You send:</span>
                    <span className="font-medium">
                      {sendAmount ? formatCurrency(parseFloat(sendAmount), sendCurrency) : '--'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction fee:</span>
                    <span className="font-medium">
                      {sendAmount ? formatCurrency(calculateTransactionFee(), sendCurrency) : '--'}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">
                      {sendAmount ? formatCurrency(parseFloat(sendAmount) + calculateTransactionFee(), sendCurrency) : '--'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange rate:</span>
                    <span className="text-sm">
                      {recipientCurrency ? `1 ${sendCurrency} = ${getExchangeRate(sendCurrency, recipientCurrency)} ${recipientCurrency}` : '--'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">Recipient gets:</span>
                    <span className="font-bold">
                      {recipientCurrency && sendAmount ? formatCurrency(calculateReceiveAmount(), recipientCurrency) : '--'}
                    </span>
                  </div>
                </div>

                {recipientCountry && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Funds delivered within 1 hour</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Countries */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {africanCountries.map((country) => (
                    <div 
                      key={country.code} 
                      className={`p-2 text-xs rounded border cursor-pointer transition-colors ${
                        recipientCountry === country.code 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => handleCountryChange(country.code)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{country.flag}</span>
                        <span className="truncate">{country.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}