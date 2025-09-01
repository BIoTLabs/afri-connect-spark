import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, Smartphone, Filter, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBillsAndAirtime } from "@/hooks/useBillsAndAirtime";
import { cn } from "@/lib/utils";

const Transactions = () => {
  const navigate = useNavigate();
  const { loading, getTransactionHistory, getSpendingAnalytics } = useBillsAndAirtime();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const transactions = getTransactionHistory();
  const analytics = getSpendingAnalytics();

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'bill':
        return <Receipt className="h-4 w-4" />;
      case 'airtime':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
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
              <h1 className="text-xl font-bold">Transaction History</h1>
              <p className="text-sm text-muted-foreground">
                Bills & Airtime Purchases
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">₦{analytics.thisMonth.total.toLocaleString()}</p>
                </div>
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-success/10 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bills Paid</p>
                  <p className="text-2xl font-bold">{analytics.thisMonth.bills.count}</p>
                  <p className="text-xs text-muted-foreground">₦{analytics.thisMonth.bills.amount.toLocaleString()}</p>
                </div>
                <Receipt className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-warning/10 to-accent/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Airtime Bought</p>
                  <p className="text-2xl font-bold">{analytics.thisMonth.airtime.count}</p>
                  <p className="text-xs text-muted-foreground">₦{analytics.thisMonth.airtime.amount.toLocaleString()}</p>
                </div>
                <Smartphone className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bill">Bills</SelectItem>
                  <SelectItem value="airtime">Airtime</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center p-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterType !== "all" || filterStatus !== "all" 
                    ? "Try adjusting your filters" 
                    : "Start by paying a bill or buying airtime"
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        transaction.type === 'bill' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                      )}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(transaction.status)} variant="secondary">
                            {transaction.status}
                          </Badge>
                          {transaction.reference && (
                            <span className="text-xs text-muted-foreground">
                              Ref: {transaction.reference}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">
                        -₦{transaction.amount.toLocaleString()}
                      </p>
                      {transaction.fee > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Fee: ₦{transaction.fee.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => navigate("/pay/bills")}
            className="bg-gradient-primary hover:bg-gradient-sunset shadow-warm py-6"
          >
            <Receipt className="h-5 w-5 mr-2" />
            Pay Bills
          </Button>
          <Button 
            onClick={() => navigate("/pay/airtime")}
            className="bg-gradient-success hover:bg-gradient-primary shadow-warm py-6"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Buy Airtime
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;