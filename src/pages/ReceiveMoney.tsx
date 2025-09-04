import { useState, useEffect } from "react";
import { ArrowLeft, QrCode, Copy, Share, Download, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QRCode from 'qrcode';
import { Separator } from "@/components/ui/separator";

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  description: string;
  qr_code_data: string;
  expires_at: string;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function ReceiveMoney() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('fiat');
  const [expiresIn, setExpiresIn] = useState('24'); // hours
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedRequest, setGeneratedRequest] = useState<PaymentRequest | null>(null);

  const currencies = [
    { value: 'NGN', label: 'Nigerian Naira (NGN)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'bitcoin', label: 'Bitcoin (BTC)' },
    { value: 'ethereum', label: 'Ethereum (ETH)' },
    { value: 'tether', label: 'Tether (USDT)' },
  ];

  const paymentMethods = [
    { value: 'fiat', label: 'Bank Transfer / Mobile Money' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'mobile_money', label: 'Mobile Money Only' },
  ];

  const formatCurrency = (amount: number, curr: string) => {
    if (['bitcoin', 'ethereum', 'tether'].includes(curr)) {
      return `${amount.toFixed(8)} ${curr.toUpperCase()}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr === 'NGN' ? 'NGN' : curr,
      minimumFractionDigits: curr === 'NGN' ? 0 : 2,
    }).format(amount);
  };

  const generatePaymentRequest = async () => {
    if (!user || !amount || !currency) return;

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));

      // Create payment request data
      const paymentData = {
        recipient: user.email || user.id,
        amount: parseFloat(amount),
        currency: currency,
        description: description || 'Payment Request',
        payment_method: paymentMethod,
        expires_at: expiresAt.toISOString(),
      };

      // Generate QR code data (this would contain payment info)
      const qrData = JSON.stringify(paymentData);
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Save to database
      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          currency: currency,
          description: description || 'Payment Request',
          qr_code_data: qrData,
          expires_at: expiresAt.toISOString(),
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (error) throw error;

      setQrCodeUrl(qrCodeDataUrl);
      setGeneratedRequest(data);
      await fetchPaymentRequests();
      toast.success('Payment request generated successfully');
    } catch (error: any) {
      console.error('Error generating payment request:', error);
      toast.error('Failed to generate payment request');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPaymentRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching payment requests:', error);
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${description} copied to clipboard`);
  };

  const sharePaymentRequest = async (request: PaymentRequest) => {
    const shareData = {
      title: 'Payment Request',
      text: `Please pay ${formatCurrency(request.amount, request.currency)} for: ${request.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        copyToClipboard(shareData.text, 'Payment request details');
      }
    } else {
      copyToClipboard(shareData.text, 'Payment request details');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'payment-qr-code.png';
    link.href = qrCodeUrl;
    link.click();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  useEffect(() => {
    fetchPaymentRequests();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Receive Money</h1>
            <p className="text-muted-foreground">Generate payment requests with QR codes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate Payment Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Create Payment Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="What is this payment for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label>Expires In</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="72">3 Days</SelectItem>
                    <SelectItem value="168">1 Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={generatePaymentRequest}
                disabled={!amount || !currency || loading}
              >
                {loading ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Display */}
          <Card>
            <CardHeader>
              <CardTitle>Payment QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedRequest ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="Payment QR Code" 
                      className="w-64 h-64 border rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      {formatCurrency(generatedRequest.amount, generatedRequest.currency)}
                    </div>
                    <div className="text-muted-foreground">
                      {generatedRequest.description}
                    </div>
                    <Badge variant="secondary">
                      <Timer className="h-3 w-3 mr-1" />
                      {getTimeRemaining(generatedRequest.expires_at)}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => copyToClipboard(generatedRequest.qr_code_data, 'Payment data')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => sharePaymentRequest(generatedRequest)}
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={downloadQRCode}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                    <QrCode className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No QR Code Generated</h3>
                  <p className="text-muted-foreground">
                    Fill in the details and click "Generate QR Code" to create a payment request
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Payment Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payment Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Payment Requests</h3>
                <p className="text-muted-foreground">
                  Create your first payment request to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {formatCurrency(request.amount, request.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.description || 'Payment Request'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={
                        request.status === 'active' ? 'default' :
                        request.status === 'paid' ? 'default' : 'secondary'
                      }>
                        {request.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {getTimeRemaining(request.expires_at)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => sharePaymentRequest(request)}
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}