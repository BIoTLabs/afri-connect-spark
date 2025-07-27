import { Link } from "react-router-dom";
import { 
  Send, 
  Download, 
  Receipt, 
  Smartphone, 
  CreditCard, 
  TrendingUp,
  Shield,
  Zap,
  Globe,
  ArrowUpDown,
  Bitcoin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockCryptoBalances, mockFiatBalance } from "@/data/mockData";

const PayHub = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const paymentServices = [
    {
      title: "Send Crypto",
      description: "Cross-border payments across Africa with crypto",
      icon: Send,
      link: "/pay/send",
      color: "bg-gradient-primary",
      featured: true
    },
    {
      title: "Crypto Exchange", 
      description: "Swap between crypto and local currencies",
      icon: ArrowUpDown,
      link: "/pay/exchange",
      color: "bg-gradient-secondary",
      featured: true
    },
    {
      title: "Pan-Africa Transfer",
      description: "Fast transfers to 54+ African countries",
      icon: Globe,
      link: "/pay/cross-border",
      color: "bg-gradient-warm"
    },
    {
      title: "Receive Crypto",
      description: "Generate wallet address & payment requests",
      icon: Download,
      link: "/pay/receive",
      color: "bg-gradient-sunset"
    },
    {
      title: "Pay Bills (FIAT)",
      description: "Local bills with converted crypto",
      icon: Receipt,
      link: "/pay/bills",
      color: "bg-gradient-cool"
    },
    {
      title: "Buy Airtime",
      description: "Top up with crypto across Africa",
      icon: Smartphone,
      link: "/pay/airtime",
      color: "bg-gradient-accent"
    }
  ];

  const features = [
    {
      title: "Blockchain Security",
      description: "Decentralized & immutable transactions",
      icon: Shield
    },
    {
      title: "Pan-African Network",
      description: "Connect with 54+ countries instantly",
      icon: Globe
    },
    {
      title: "Crypto-First Design",
      description: "Built for the future of African finance",
      icon: Bitcoin
    },
    {
      title: "Lightning Fast",
      description: "Cross-border in seconds, not days",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-warm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Crypto Wallet</h1>
          <p className="text-primary-foreground/80">Pan-African blockchain payments</p>
        </div>

        {/* Crypto Portfolio Display */}
        <div className="space-y-3">
          <Card className="bg-white/10 border-white/20 text-primary-foreground">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-primary-foreground/80">Total Portfolio Value</p>
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <p className="text-2xl font-bold">
                ${Object.values(mockCryptoBalances).reduce((sum, bal) => sum + bal.usdValue, 0).toLocaleString()}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <p className="text-primary-foreground/60">BTC</p>
                  <p className="font-semibold">{mockCryptoBalances.BTC.amount}</p>
                </div>
                <div>
                  <p className="text-primary-foreground/60">ETH</p>
                  <p className="font-semibold">{mockCryptoBalances.ETH.amount}</p>
                </div>
                <div>
                  <p className="text-primary-foreground/60">USDT</p>
                  <p className="font-semibold">{mockCryptoBalances.USDT.amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 text-primary-foreground">
            <CardContent className="p-3">
              <p className="text-xs text-primary-foreground/60 mb-1">FIAT Balance</p>
              <p className="text-sm font-semibold">₦{mockFiatBalance.NGN.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Payment Services */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Crypto Services</h2>
          <div className="grid grid-cols-1 gap-4">
            {paymentServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.title} to={service.link}>
                  <Card className={`hover:shadow-soft transition-all duration-200 hover:scale-105 active:scale-95 ${service.featured ? 'ring-2 ring-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {service.title}
                            {service.featured && (
                              <span className="ml-2 text-xs bg-gradient-primary text-white px-2 py-1 rounded-full">
                                Core
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Why Choose Afri-Connect Crypto?</h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-gradient-to-r from-muted/50 to-transparent">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Pan-African Network */}
        <section>
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Pan-African Network</h3>
              <p className="text-muted-foreground mb-4">
                Connect with crypto users across all 54 African countries
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-primary">54+</p>
                  <p className="text-muted-foreground">Countries</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">15+</p>
                  <p className="text-muted-foreground">Currencies</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-primary">24/7</p>
                  <p className="text-muted-foreground">Support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PayHub;