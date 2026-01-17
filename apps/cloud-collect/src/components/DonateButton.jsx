import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function DonateButton({ 
  profileId, 
  amount, 
  className = "",
  size = "default",
  children 
}) {
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    
    try {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        profileId,
        amount: parseFloat(amount),
        donorName: 'Anonymous',
        donorEmail: '',
        donorMessage: '',
      });

      if (!data.url) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.message || 'Could not process donation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleDonate} 
      disabled={loading}
      className={className}
      size={size}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || (
          <>
            <Heart className="w-4 h-4 mr-2" />
            Donate ${parseFloat(amount).toFixed(2)}
          </>
        )
      )}
    </Button>
  );
}