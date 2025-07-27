import { Link } from "react-router-dom";
import { 
  Send, 
  Download, 
  Receipt, 
  Smartphone, 
  CreditCard, 
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockBalance } from "@/data/mockData";

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
      title: "Send Money",
      description: "Transfer to contacts, mobile money, banks, or crypto",
      icon: Send,
      link: "/pay/send",
      color: "bg-gradient-primary",
      featured: true
    },
    {
      title: "Receive Money", 
      description: "Create payment links and QR codes",
      icon: Download,
      link: "/pay/receive",
      color: "bg-gradient-secondary"
    },
    {
      title: "Pay Bills",
      description: "Electricity, water, TV, internet & more",
      icon: Receipt,
      link: "/pay/bills",
      color: "bg-gradient-warm"
    },
    {
      title: "Buy Airtime/Data",
      description: "Top up your phone or internet",
      icon: Smartphone,
      link: "/pay/airtime",
      color: "bg-gradient-sunset"
    }
  ];

  const features = [
    {
      title: "Instant Transfers",
      description: "Send money in seconds",
      icon: Zap
    },
    {
      title: "Bank-Level Security",
      description: "Your money is protected",
      icon: Shield
    },
    {
      title: "Low Fees",
      description: "More money in your pocket",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-warm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Payment Hub</h1>
          <p className="text-primary-foreground/80">Fast, secure, and affordable payments</p>
        </div>

        {/* Balance Display */}
        <Card className="bg-white/10 border-white/20 text-primary-foreground">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-primary-foreground/80 mb-1">Available Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(mockBalance)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 space-y-8">
        {/* Payment Services */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Payment Services</h2>
          <div className="grid grid-cols-1 gap-4">
            {paymentServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.title} to={service.link}>
                  <Card className={`hover:shadow-soft transition-all duration-200 hover:scale-105 active:scale-95 ${service.featured ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {service.title}
                            {service.featured && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Popular
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
          <h2 className="text-xl font-semibold mb-4">Why Choose Afri-Connect Pay?</h2>
          <div className="grid grid-cols-1 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-gradient-to-r from-muted/50 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help you with any payment questions
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PayHub;