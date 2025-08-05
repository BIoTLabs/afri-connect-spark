import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKYC } from '@/hooks/useKYC';
import { AlertCircle, CheckCircle, Clock, Upload, FileText, Camera } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const KYCOnboarding = () => {
  const { kyc, submitKYC, loading, isKYCApproved, isKYCPending, isKYCRejected } = useKYC();
  
  const [formData, setFormData] = useState({
    document_type: '' as 'passport' | 'drivers_license' | 'national_id' | '',
    document_number: '',
    full_name: '',
    date_of_birth: '',
    address: '',
    phone_number: '',
    occupation: ''
  });

  const [files, setFiles] = useState({
    document_front: null as File | null,
    document_back: null as File | null,
    selfie: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.document_type || !files.document_front || !files.selfie) {
      return;
    }

    await submitKYC({
      ...formData,
      document_type: formData.document_type as 'passport' | 'drivers_license' | 'national_id',
      document_front: files.document_front,
      document_back: files.document_back || undefined,
      selfie: files.selfie
    });
  };

  if (isKYCApproved()) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
            <CardHeader className="text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <CardTitle className="text-2xl text-success">Verification Complete!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Your identity has been successfully verified. You now have full access to all financial services.
              </p>
              <Button className="bg-success hover:bg-success/90">
                Continue to Smart Savings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isKYCPending()) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-warning/10 to-primary/10 border-warning/20">
            <CardHeader className="text-center">
              <Clock className="w-16 h-16 text-warning mx-auto mb-4" />
              <CardTitle className="text-2xl text-warning">Verification Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Your KYC documents are under review. This typically takes 24-48 hours.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Submitted on: {new Date(kyc?.created_at || '').toLocaleDateString()}
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We'll notify you via email once the review is complete.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isKYCRejected()) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-destructive/10 to-primary/10 border-destructive/20">
            <CardHeader className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <CardTitle className="text-2xl text-destructive">Verification Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Reason:</strong> {kyc?.rejected_reason || 'Document quality or information mismatch'}
                </AlertDescription>
              </Alert>
              <p className="text-muted-foreground text-center mb-6">
                Please review the requirements and submit new documents.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Resubmit Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Identity Verification (KYC)</CardTitle>
            <p className="text-muted-foreground text-center">
              Complete your verification to access financial services
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Legal Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Identity Document</h3>
                
                <div>
                  <Label>Document Type</Label>
                  <Select onValueChange={(value) => handleInputChange('document_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="passport">International Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="document_number">Document Number</Label>
                  <Input
                    id="document_number"
                    value={formData.document_number}
                    onChange={(e) => handleInputChange('document_number', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Document Upload</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Document Front</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('document_front', e.target.files?.[0] || null)}
                        className="hidden"
                        id="document_front"
                      />
                      <Label htmlFor="document_front" className="cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                          {files.document_front ? files.document_front.name : 'Upload front side'}
                        </span>
                      </Label>
                    </div>
                  </div>

                  {formData.document_type !== 'passport' && (
                    <div>
                      <Label>Document Back</Label>
                      <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('document_back', e.target.files?.[0] || null)}
                          className="hidden"
                          id="document_back"
                        />
                        <Label htmlFor="document_back" className="cursor-pointer">
                          <span className="text-sm text-muted-foreground">
                            {files.document_back ? files.document_back.name : 'Upload back side'}
                          </span>
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Selfie with Document</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                      className="hidden"
                      id="selfie"
                    />
                    <Label htmlFor="selfie" className="cursor-pointer">
                      <span className="text-sm text-muted-foreground">
                        {files.selfie ? files.selfie.name : 'Upload selfie holding document'}
                      </span>
                    </Label>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ensure all documents are clear, well-lit, and all text is readable. 
                  Processing typically takes 24-48 hours.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.document_type || !files.document_front || !files.selfie}
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYCOnboarding;