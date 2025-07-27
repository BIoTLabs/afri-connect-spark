import { 
  PiggyBank, 
  CreditCard, 
  Shield, 
  MapPin, 
  Users, 
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Services = () => {
  const { toast } = useToast();

  const handleServiceClick = (serviceName: string) => {
    toast({
      title: "Feature coming soon",
      description: `${serviceName} will be available in our next update`,
    });
  };

  const services = [
    {
      title: "Smart Savings",
      description: "Automated savings with competitive interest rates",
      icon: PiggyBank,
      color: "bg-gradient-secondary",
      features: ["Auto-save rules", "Goal tracking", "4.5% annual interest"],
      status: "available",
      rating: 4.8
    },
    {
      title: "Micro-Loans",
      description: "Quick loans based on your transaction history",
      icon: CreditCard,
      color: "bg-gradient-primary",
      features: ["Instant approval", "Flexible repayment", "No collateral"],
      status: "coming_soon",
      rating: 4.6
    },
    {
      title: "Micro-Insurance",
      description: "Affordable insurance for you and your family",
      icon: Shield,
      color: "bg-gradient-warm",
      features: ["Health coverage", "Accident protection", "Low premiums"],
      status: "coming_soon",
      rating: 4.5
    },
    {
      title: "Agent Network",
      description: "Find nearby agents for cash deposits and withdrawals",
      icon: MapPin,
      color: "bg-gradient-sunset",
      features: ["Cash in/out", "Bill payments", "24/7 availability"],
      status: "available",
      rating: 4.7
    },
    {
      title: "Stokvel/Esusu",
      description: "Traditional rotating savings groups, digitized",
      icon: Users,
      color: "bg-gradient-secondary",
      features: ["Group savings", "Transparent records", "Automated payouts"],
      status: "beta",
      rating: 4.4
    },
    {
      title: "Investments",
      description: "Start investing with as little as ₦1,000",
      icon: TrendingUp,
      color: "bg-gradient-primary",
      features: ["Low minimum", "Diversified portfolio", "Expert guidance"],
      status: "coming_soon",
      rating: 4.3
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case "beta":
        return <Badge className="bg-warning text-warning-foreground">Beta</Badge>;
      case "coming_soon":
        return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-warm">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Financial Services</h1>
          <p className="text-primary-foreground/80">
            Empowering your financial future with innovative solutions
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Services Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Our Services</h2>
          <div className="grid grid-cols-1 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              const isAvailable = service.status === "available";
              
              return (
                <Card 
                  key={service.title} 
                  className={`hover:shadow-soft transition-all duration-200 ${isAvailable ? 'hover:scale-105 cursor-pointer' : 'opacity-75'}`}
                  onClick={() => isAvailable && handleServiceClick(service.title)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">{service.rating}</span>
                            </div>
                            {getStatusBadge(service.status)}
                          </div>
                        </div>
                      </div>
                      {isAvailable && (
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Key Features:</h4>
                      <div className="space-y-1">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isAvailable && (
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Learn More
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Information Section */}
        <section className="space-y-4">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Why Choose Our Financial Services?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Regulated and licensed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Transparent pricing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>No hidden fees</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Fast processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Mobile-first experience</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Get Started Today</h3>
              <p className="text-muted-foreground mb-4">
                Join thousands of users who trust Afri-Connect for their financial needs
              </p>
              <Button className="bg-gradient-primary hover:bg-gradient-sunset shadow-warm">
                Open Account
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Services;