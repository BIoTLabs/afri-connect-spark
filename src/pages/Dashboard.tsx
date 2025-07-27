import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Send, 
  Download, 
  CreditCard, 
  Smartphone,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCryptoBalances, mockFiatBalance, mockTransactions } from "@/data/mockData";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'received':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'bill':
        return <Receipt className="h-4 w-4 text-warning" />;
      case 'airtime':
        return <Smartphone className="h-4 w-4 text-primary" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const quickActions = [
    {
      title: "Send Money",
      icon: Send,
      description: "Transfer to anyone",
      link: "/pay/send",
      color: "bg-gradient-primary"
    },
    {
      title: "Receive Money", 
      icon: Download,
      description: "Generate payment link",
      link: "/pay/receive",
      color: "bg-gradient-secondary"
    },
    {
      title: "Pay Bills",
      icon: Receipt,
      description: "Utilities & more",
      link: "/pay/bills",
      color: "bg-gradient-warm"
    },
    {
      title: "Buy Airtime",
      icon: Smartphone,
      description: "Top up your phone",
      link: "/pay/airtime",
      color: "bg-gradient-sunset"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-warm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-primary-foreground/80">Here's your financial overview</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-white/10 border-white/20 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-foreground/80">Total Balance</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-primary-foreground hover:bg-white/10 rounded-full h-8 w-8"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-3xl font-bold">
              {showBalance ? `$${Object.values(mockCryptoBalances).reduce((sum, bal) => sum + bal.usdValue, 0).toLocaleString()}` : "••••••"}
            </div>
            <p className="text-sm text-primary-foreground/60 mt-1">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.link}>
                  <Card className="hover:shadow-soft transition-all duration-200 hover:scale-105 active:scale-95">
                    <CardContent className="p-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", action.color)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {mockTransactions.slice(0, 5).map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-muted/50 transition-colors",
                    index !== mockTransactions.slice(0, 5).length - 1 && "border-b border-border"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimestamp(transaction.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold",
                      transaction.type === 'sent' || transaction.type === 'bill' || transaction.type === 'airtime' 
                        ? "text-destructive" 
                        : "text-success"
                    )}>
                      {transaction.type === 'sent' || transaction.type === 'bill' || transaction.type === 'airtime' ? '-' : '+'}
                      {transaction.currency}{transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Financial Insights */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Financial Insights</h2>
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-success">This Month's Savings</h3>
                    <p className="text-2xl font-bold text-success">₦5,200</p>
                    <p className="text-sm text-muted-foreground">+12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-warning">Quick Tip</h3>
                    <p className="text-sm text-foreground">Set up automatic savings to reach your goals faster</p>
                  </div>
                  <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;