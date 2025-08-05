import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface KYCVerification {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_review';
  document_type: 'passport' | 'drivers_license' | 'national_id';
  document_number: string;
  document_front_url?: string;
  document_back_url?: string;
  selfie_url?: string;
  full_name: string;
  date_of_birth: string;
  address: string;
  phone_number: string;
  occupation?: string;
  verified_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export const useKYC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [kyc, setKyc] = useState<KYCVerification | null>(null);

  const fetchKYCStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setKyc(data as KYCVerification);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      toast({
        title: "Error",
        description: "Failed to load KYC status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, type: 'front' | 'back' | 'selfie'): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileName = `${user.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      return null;
    }
  };

  const submitKYC = async (kycData: {
    document_type: 'passport' | 'drivers_license' | 'national_id';
    document_number: string;
    full_name: string;
    date_of_birth: string;
    address: string;
    phone_number: string;
    occupation?: string;
    document_front: File;
    document_back?: File;
    selfie: File;
  }) => {
    if (!user) return null;

    setLoading(true);
    try {
      // Upload documents
      const frontUrl = await uploadDocument(kycData.document_front, 'front');
      if (!frontUrl) throw new Error('Failed to upload front document');

      let backUrl = null;
      if (kycData.document_back) {
        backUrl = await uploadDocument(kycData.document_back, 'back');
        if (!backUrl) throw new Error('Failed to upload back document');
      }

      const selfieUrl = await uploadDocument(kycData.selfie, 'selfie');
      if (!selfieUrl) throw new Error('Failed to upload selfie');

      // Submit KYC data
      const { data, error } = await supabase
        .from('kyc_verifications')
        .upsert({
          user_id: user.id,
          document_type: kycData.document_type,
          document_number: kycData.document_number,
          document_front_url: frontUrl,
          document_back_url: backUrl,
          selfie_url: selfieUrl,
          full_name: kycData.full_name,
          date_of_birth: kycData.date_of_birth,
          address: kycData.address,
          phone_number: kycData.phone_number,
          occupation: kycData.occupation,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "KYC verification submitted successfully. Review typically takes 24-48 hours.",
      });

      setKyc(data as KYCVerification);
      return data;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit KYC verification",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const isKYCApproved = () => {
    return kyc?.status === 'approved';
  };

  const isKYCPending = () => {
    return kyc?.status === 'pending' || kyc?.status === 'requires_review';
  };

  const isKYCRejected = () => {
    return kyc?.status === 'rejected';
  };

  useEffect(() => {
    if (user) {
      fetchKYCStatus();
    }
  }, [user]);

  return {
    loading,
    kyc,
    submitKYC,
    isKYCApproved,
    isKYCPending,
    isKYCRejected,
    refreshKYC: fetchKYCStatus
  };
};