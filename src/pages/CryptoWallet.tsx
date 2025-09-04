import { useState } from "react";
import { ArrowLeft, Wallet, Send, QrCode, Plus, Copy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCrypto } from "@/hooks/useCrypto";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function CryptoWallet() {
  const navigate = useNavigate();
  const { 
    loading, 
    wallets, 
    transactions, 
    exchangeRates,
    createWallet,
    getTotalPortfolioValue,
    getRateForCurrency
  } = useCrypto();

  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [showCreateWallet, setShowCreateWallet] = useState(false);

  const supportedCurrencies = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'cardano'];

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
    }).format(amount);
  };

  const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toFixed(8)} ${symbol.toUpperCase()}`;
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const handleCreateWallet = async (currency: string) => {
    const wallet = await createWallet(currency);
    if (wallet) {
      setShowCreateWallet(false);
    }
  };

  const getWalletValue = (wallet: any) => {
    const rate = getRateForCurrency(wallet.currency);
    return wallet.balance * (rate?.usd_price || 0);
  };

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Crypto Wallet</h1>
              <p className="text-muted-foreground">Manage your cryptocurrency holdings</p>
            </div>
          </div>
          <Dialog open={showCreateWallet} onOpenChange={setShowCreateWallet}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedCurrencies
                      .filter(currency => !wallets.some(w => w.currency === currency))
                      .map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency.charAt(0).toUpperCase() + currency.slice(1)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  className="w-full" 
                  onClick={() => handleCreateWallet(selectedWallet)}
                  disabled={!selectedWallet}
                >
                  Create {selectedWallet ? selectedWallet.toUpperCase() : ''} Wallet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Portfolio Overview */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(getTotalPortfolioValue())}
            </div>
            <p className="text-muted-foreground">
              Across {wallets.length} wallets
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Wallets</h2>
              <Badge variant="secondary">{wallets.length}</Badge>
            </div>

            {wallets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No wallets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first crypto wallet to get started
                  </p>
                  <Button onClick={() => setShowCreateWallet(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => {
                  const rate = getRateForCurrency(wallet.currency);
                  const value = getWalletValue(wallet);
                  
                  return (
                    <Card key={wallet.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-sm">
                                {wallet.currency.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{wallet.currency.toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatCrypto(wallet.balance, wallet.currency)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(value)}</div>
                            {rate && (
                              <div className="text-sm text-muted-foreground">
                                @ {formatCurrency(rate.usd_price)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Wallet Address:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.wallet_address, "Wallet address")}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="text-xs font-mono bg-secondary/50 p-2 rounded break-all">
                            {wallet.wallet_address}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <QrCode className="h-3 w-3 mr-1" />
                            Receive
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                <ExternalLink className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Send className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start trading to see your transaction history
                  </p>
                  <Button onClick={() => navigate('/crypto-exchange')}>
                    Go to Exchange
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                            transaction.transaction_type === 'buy' ? 'bg-green-500' :
                            transaction.transaction_type === 'sell' ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            {transaction.transaction_type === 'buy' ? '↑' : 
                             transaction.transaction_type === 'sell' ? '↓' : '↔'}
                          </div>
                          <div>
                            <div className="font-medium capitalize">
                              {transaction.transaction_type} {transaction.to_currency.toUpperCase()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCrypto(transaction.to_amount, transaction.to_currency)}
                          </div>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'processing' ? 'secondary' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      {transaction.reference_number && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {transaction.reference_number}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}