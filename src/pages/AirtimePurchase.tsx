import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MobileNetwork {
  id: string;
  network_name: string;
  network_code: string;
  is_active: boolean;
  logo_url?: string;
}

const AirtimePurchase = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [networks, setNetworks] = useState<MobileNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Predefined amounts for quick selection
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const { data, error } = await supabase
        .from('mobile_networks')
        .select('*')
        .eq('is_active', true)
        .order('network_name');

      if (error) throw error;
      setNetworks(data || []);
    } catch (error) {
      console.error('Error fetching networks:', error);
      toast({
        title: "Error",
        description: "Failed to load mobile networks",
        variant: "destructive"
      });
    }
  };

  const detectNetwork = (phone: string) => {
    // Remove country code and spaces
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^234/, '');
    
    // Nigerian network prefixes
    const networkPrefixes = {
      'MTN': ['0803', '0806', '0813', '0816', '0810', '0814', '0903', '0906', '0703', '0706', '0704'],
      'AIRTEL': ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'],
      'GLO': ['0805', '0807', '0815', '0811', '0705', '0905'],
      '9MOBILE': ['0809', '0818', '0817', '0908', '0909']
    };

    for (const [networkCode, prefixes] of Object.entries(networkPrefixes)) {
      for (const prefix of prefixes) {
        if (cleanPhone.startsWith(prefix)) {
          const network = networks.find(n => n.network_code === networkCode);
          if (network) {
            setSelectedNetwork(network.id);
            return network.network_name;
          }
        }
      }
    }
    return null;
  };

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone);
    if (phone.length >= 4) {
      detectNetwork(phone);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as +234 XXX XXX XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return `+234 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
    } else if (cleaned.startsWith('234')) {
      return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 13)}`;
    }
    return phone;
  };

  const handlePurchaseAirtime = async () => {
    if (!user || !selectedNetwork || !phoneNumber || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) < 50) {
      toast({
        title: "Invalid Amount",
        description: "Minimum airtime purchase is ₦50",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) > 50000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum airtime purchase is ₦50,000",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const network = networks.find(n => n.id === selectedNetwork);
      const referenceNumber = `AIR${Date.now()}`;

      const { error } = await supabase
        .from('airtime_purchases')
        .insert({
          user_id: user.id,
          network_provider: network?.network_name || '',
          phone_number: formatPhoneNumber(phoneNumber),
          amount: parseFloat(amount),
          reference_number: referenceNumber,
          status: 'completed', // In real app, this would be 'pending' until API confirms
          transaction_fee: Math.max(10, parseFloat(amount) * 0.01) // Minimum ₦10 or 1%
        });

      if (error) throw error;

      toast({
        title: "Airtime Purchase Successful!",
        description: `₦${parseFloat(amount).toLocaleString()} airtime sent to ${formatPhoneNumber(phoneNumber)}`,
      });

      // Reset form
      setSelectedNetwork("");
      setPhoneNumber("");
      setAmount("");

      // Navigate back after delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error('Error purchasing airtime:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to process airtime purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNetworkColor = (networkCode: string) => {
    switch (networkCode) {
      case 'MTN': return 'bg-yellow-500';
      case 'AIRTEL': return 'bg-red-500';
      case 'GLO': return 'bg-green-500';
      case '9MOBILE': return 'bg-green-600';
      default: return 'bg-primary';
    }
  };

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
              <h1 className="text-xl font-bold">Buy Airtime</h1>
              <p className="text-sm text-muted-foreground">
                Top up any Nigerian mobile number
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Phone Number Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Phone Number</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08123456789"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter Nigerian mobile number (e.g., 08123456789)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Network Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Select Network</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {networks.map((network) => (
                <Card 
                  key={network.id}
                  className={`cursor-pointer hover:shadow-soft transition-all ${
                    selectedNetwork === network.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedNetwork(network.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-full ${getNetworkColor(network.network_code)} flex items-center justify-center mx-auto mb-2`}>
                      <Smartphone className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-medium">{network.network_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {network.network_code}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amount Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Amounts */}
            <div>
              <Label>Quick Select</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount.toString() ? "default" : "outline"}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="text-sm"
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Label htmlFor="amount">Custom Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold"
                min={50}
                max={50000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: ₦50 • Maximum: ₦50,000
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Summary */}
        {amount && parseFloat(amount) >= 50 && (
          <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Purchase Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Phone Number:</span>
                  <span className="font-semibold">{formatPhoneNumber(phoneNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-semibold">
                    {networks.find(n => n.id === selectedNetwork)?.network_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Airtime Amount:</span>
                  <span className="font-semibold">₦{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="font-semibold">
                    ₦{Math.max(10, parseFloat(amount) * 0.01).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-success">
                    ₦{(parseFloat(amount) + Math.max(10, parseFloat(amount) * 0.01)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Button */}
        {selectedNetwork && phoneNumber && amount && parseFloat(amount) >= 50 && (
          <Button 
            onClick={handlePurchaseAirtime}
            className="w-full bg-gradient-success hover:bg-gradient-primary shadow-warm text-lg py-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing Purchase...
              </>
            ) : (
              `Purchase ₦${parseFloat(amount).toLocaleString()} Airtime`
            )}
          </Button>
        )}

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Your recent purchases will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirtimePurchase;