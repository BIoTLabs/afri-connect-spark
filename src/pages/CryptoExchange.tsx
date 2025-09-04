import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Refresh, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useCrypto } from "@/hooks/useCrypto";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function CryptoExchange() {
  const navigate = useNavigate();
  const { 
    loading, 
    exchangeRates, 
    wallets, 
    executeTrade, 
    fetchExchangeRates,
    createWallet,
    getRateForCurrency 
  } = useCrypto();

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [amount, setAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);

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

  const handleTrade = async () => {
    if (!amount || !selectedCrypto) return;

    setIsTrading(true);
    
    const rate = getRateForCurrency(selectedCrypto);
    if (!rate) {
      setIsTrading(false);
      return;
    }

    const numericAmount = parseFloat(amount);
    let fromAmount: number;
    let toAmount: number;
    let fromCurrency: string;
    let toCurrency: string;

    if (tradeType === 'buy') {
      fromAmount = numericAmount; // USD amount
      toAmount = numericAmount / rate.usd_price; // Crypto amount
      fromCurrency = 'usd';
      toCurrency = selectedCrypto;
    } else {
      fromAmount = numericAmount; // Crypto amount
      toAmount = numericAmount * rate.usd_price; // USD amount
      fromCurrency = selectedCrypto;
      toCurrency = 'usd';
    }

    // Create wallet if it doesn't exist
    const wallet = wallets.find(w => w.currency === selectedCrypto);
    if (!wallet && tradeType === 'buy') {
      await createWallet(selectedCrypto);
    }

    const success = await executeTrade(
      tradeType,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      rate.usd_price
    );

    if (success) {
      setAmount('');
    }
    
    setIsTrading(false);
  };

  const getCurrentRate = () => {
    const rate = getRateForCurrency(selectedCrypto);
    return rate ? rate.usd_price : 0;
  };

  const getEstimatedAmount = () => {
    if (!amount) return 0;
    const rate = getCurrentRate();
    const numericAmount = parseFloat(amount);
    
    if (tradeType === 'buy') {
      return numericAmount / rate; // USD to crypto
    } else {
      return numericAmount * rate; // Crypto to USD
    }
  };

  const getTransactionFee = () => {
    if (!amount) return 0;
    return parseFloat(amount) * 0.005; // 0.5% fee
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
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
              <h1 className="text-3xl font-bold">Crypto Exchange</h1>
              <p className="text-muted-foreground">Buy and sell cryptocurrencies</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchExchangeRates(true)}>
            <Refresh className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trade Type Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Trade Cryptocurrency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    variant={tradeType === 'buy' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setTradeType('buy')}
                  >
                    Buy Crypto
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setTradeType('sell')}
                  >
                    Sell Crypto
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Select Cryptocurrency</Label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exchangeRates.map((rate) => (
                          <SelectItem key={rate.currency} value={rate.currency}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rate.currency.toUpperCase()}</span>
                              <span className="text-muted-foreground">
                                {formatCurrency(rate.usd_price)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>
                      Amount ({tradeType === 'buy' ? 'USD' : selectedCrypto.toUpperCase()})
                    </Label>
                    <Input
                      type="number"
                      placeholder={`Enter ${tradeType === 'buy' ? 'USD' : selectedCrypto.toUpperCase()} amount`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  {amount && (
                    <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                      <div className="flex justify-between">
                        <span>You will {tradeType === 'buy' ? 'receive' : 'get'}:</span>
                        <span className="font-medium">
                          {tradeType === 'buy' 
                            ? formatCrypto(getEstimatedAmount(), selectedCrypto)
                            : formatCurrency(getEstimatedAmount())
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Transaction fee (0.5%):</span>
                        <span>
                          {tradeType === 'buy' 
                            ? formatCurrency(getTransactionFee())
                            : formatCrypto(getTransactionFee(), selectedCrypto)
                          }
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Exchange Rate:</span>
                        <span>1 {selectedCrypto.toUpperCase()} = {formatCurrency(getCurrentRate())}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleTrade}
                    disabled={!amount || isTrading}
                  >
                    {isTrading ? 'Processing...' : `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} ${selectedCrypto.toUpperCase()}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Data */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Prices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exchangeRates.map((rate) => (
                  <div 
                    key={rate.currency} 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCrypto === rate.currency ? 'bg-primary/10 border-primary' : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => setSelectedCrypto(rate.currency)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{rate.currency.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(rate.usd_price)}
                        </div>
                      </div>
                      <Badge variant={rate.price_change_24h >= 0 ? "default" : "destructive"}>
                        <div className="flex items-center gap-1">
                          {rate.price_change_24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(rate.price_change_24h).toFixed(2)}%
                        </div>
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: {formatCurrency(rate.volume_24h / 1000000)}M
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}