import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Building, Smartphone, Bitcoin, Globe, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { mockUsers, mockCryptoBalances, mockFiatBalance } from "@/data/mockData";
import { cn } from "@/lib/utils";

const SendMoney = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("crypto");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(searchParams.get('recipient') || "");
  const [description, setDescription] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cryptoType, setCryptoType] = useState("USDT");
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
      }).format(amount);
    }
    return `${amount} ${currency}`;
  };

  const handleSendMoney = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Check crypto balance based on selected currency
    let availableBalance = 0;
    if (activeTab === "crypto" && cryptoType && mockCryptoBalances[cryptoType as keyof typeof mockCryptoBalances]) {
      availableBalance = mockCryptoBalances[cryptoType as keyof typeof mockCryptoBalances].amount;
    } else if (activeTab === "fiat") {
      availableBalance = mockFiatBalance.NGN;
    }

    if (parseFloat(amount) > availableBalance) {
      toast({
        title: "Insufficient funds",
        description: `You don't have enough ${cryptoType || 'NGN'} balance for this transaction`,
        variant: "destructive"
      });
      return;
    }

    if (!recipient && activeTab === "contact") {
      toast({
        title: "Missing recipient",
        description: "Please select a recipient",
        variant: "destructive"
      });
      return;
    }

    // Simulate successful transaction
    const currency = activeTab === "crypto" ? cryptoType : "NGN";
    toast({
      title: "Transaction successful!",
      description: `${parseFloat(amount)} ${currency} sent successfully`,
    });

    // Navigate back to dashboard after a delay
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const tabs = [
    {
      value: "crypto",
      label: "Crypto",
      icon: Bitcoin,
      description: "Send cryptocurrency globally"
    },
    {
      value: "pan-africa",
      label: "Pan-Africa",
      icon: Globe,
      description: "Cross-border to African countries"
    },
    {
      value: "contact",
      label: "Contact",
      icon: User,
      description: "Send to saved contacts"
    },
    {
      value: "fiat",
      label: "FIAT (Legacy)",
      icon: Building,
      description: "Traditional bank/mobile money"
    }
  ];

  const mobileNetworks = [
    "MTN Mobile Money",
    "Airtel Money",
    "9Mobile Money",
    "Glo Mobile Money"
  ];

  const cryptoTypes = [
    "USDT",
    "USDC", 
    "ETH",
    "BTC",
    "BNB"
  ];

  const africanCountries = [
    "Nigeria (NGN)",
    "Ghana (GHS)", 
    "Kenya (KES)",
    "South Africa (ZAR)",
    "Senegal (XOF)",
    "Côte d'Ivoire (XOF)",
    "Egypt (EGP)",
    "Morocco (MAD)",
    "Ethiopia (ETB)",
    "Tanzania (TZS)"
  ];

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
              <h1 className="text-xl font-bold">Send Crypto</h1>
              <p className="text-sm text-muted-foreground">
                Portfolio: ${Object.values(mockCryptoBalances).reduce((sum, bal) => sum + bal.usdValue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Amount Input */}
        <Card>
          <CardHeader>
            <CardTitle>Amount to Send</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ({activeTab === "crypto" ? cryptoType : "NGN"})</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold text-center"
              />
              {activeTab === "crypto" && cryptoType && mockCryptoBalances[cryptoType as keyof typeof mockCryptoBalances] && (
                <p className="text-sm text-muted-foreground mt-1">
                  Available: {mockCryptoBalances[cryptoType as keyof typeof mockCryptoBalances].amount} {cryptoType}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Send To</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className={`flex flex-col space-y-1 h-auto py-3 ${tab.value === "crypto" || tab.value === "pan-africa" ? "border border-primary/20" : ""}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="crypto" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="crypto">Cryptocurrency</Label>
                  <Select value={cryptoType} onValueChange={setCryptoType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoTypes.map((crypto) => (
                        <SelectItem key={crypto} value={crypto}>
                          <div className="flex items-center space-x-2">
                            <Bitcoin className="h-4 w-4" />
                            <span>{crypto}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wallet">Recipient Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="Enter wallet address or select contact"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pan-africa" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="country">Destination Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select African country" />
                    </SelectTrigger>
                    <SelectContent>
                      {africanCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>{country}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient-phone">Recipient Phone</Label>
                  <Input
                    id="recipient-phone"
                    placeholder="e.g., +233 24 567 8901"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="recipient">Select Contact</Label>
                  <Select value={recipient} onValueChange={setRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.name}>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-warm rounded-full flex items-center justify-center text-xs font-semibold text-white">
                              {user.name.charAt(0)}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="fiat" className="space-y-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">⚠️ Legacy Payment Method</p>
                  <p className="text-xs text-muted-foreground">
                    FIAT payments use traditional banking. Crypto payments are faster and cheaper.
                  </p>
                </div>
                <div>
                  <Label htmlFor="network">Payment Method</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileNetworks.map((network) => (
                        <SelectItem key={network} value={network}>
                          {network}
                        </SelectItem>
                      ))}
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="network">Mobile Network</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileNetworks.map((network) => (
                        <SelectItem key={network} value={network}>
                          {network}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone/Account Number</Label>
                  <Input
                    id="phone"
                    placeholder="+234 000 000 0000 or 0123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        {amount && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Transaction Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">{parseFloat(amount || "0")} {activeTab === "crypto" ? cryptoType : "NGN"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee:</span>
                  <span className="font-semibold text-green-600">
                    {activeTab === "crypto" ? "~$0.50" : "₦0.00"}
                  </span>
                </div>
                {activeTab === "crypto" && (
                  <div className="flex justify-between">
                    <span>USD Value:</span>
                    <span className="font-semibold">
                      ${(parseFloat(amount || "0") * (cryptoType === "USDT" || cryptoType === "USDC" ? 1 : cryptoType === "ETH" ? 2400 : cryptoType === "BTC" ? 45000 : 600)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-primary">{parseFloat(amount || "0")} {activeTab === "crypto" ? cryptoType : "NGN"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSendMoney}
          className="w-full bg-gradient-primary hover:bg-gradient-sunset shadow-warm text-lg py-6"
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Send {parseFloat(amount || "0")} {activeTab === "crypto" ? cryptoType : "NGN"}
        </Button>
      </div>
    </div>
  );
};

export default SendMoney;