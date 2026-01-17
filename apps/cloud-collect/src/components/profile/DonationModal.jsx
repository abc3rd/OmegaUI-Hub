import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Heart, AlertCircle, Sparkles, LocateFixed } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

export default function DonationModal({ profile, isOpen, onClose, preselectedItem }) {
  const [amount, setAmount] = useState(preselectedItem ? preselectedItem.itemCost.toString() : "");
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationData, setLocationData] = useState(null);

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.success("Location enabled for this contribution.");
          setLocationEnabled(true);
          setLocating(false);
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          toast.error("Could not access location. You can still contribute.");
          setLocationEnabled(false);
          setLocating(false);
          setLocationData(null);
        },
        { timeout: 5000 }
      );
    } else {
      toast.warning("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const donationAmount = parseFloat(amount);
    if (!donationAmount || donationAmount < 2) {
      toast.error("Minimum contribution is $2.00");
      return;
    }

    setLoading(true);

    try {
      const { data } = await base44.functions.invoke('createCheckoutSession', {
        profileId: profile.id,
        amount: donationAmount,
        donorName: donorInfo.name || 'Anonymous',
        donorEmail: donorInfo.email,
        donorMessage: donorInfo.message,
        wishlistItemId: preselectedItem?.id,
        isRecurring,
        frequency,
        ...(locationData && { latitude: locationData.latitude, longitude: locationData.longitude })
      });

      if (!data.sessionId || !data.url) {
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

  const handleModalClose = (open) => {
    if (!open && !loading) {
      setAmount(preselectedItem ? preselectedItem.itemCost.toString() : "");
      setDonorInfo({ name: "", email: "", message: "" });
      setIsRecurring(false);
      setFrequency("monthly");
      setLocating(false);
      setLocationEnabled(false);
      setLocationData(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Support {profile.publicName}
          </DialogTitle>
          <DialogDescription>
            Your contribution makes a real difference. 100% goes directly to the recipient (after payment processing fees).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="text-center">
            {preselectedItem ? (
              <>
                <p className="text-lg font-semibold text-slate-800">You're funding:</p>
                <p className="text-2xl font-bold text-teal-600">{preselectedItem.itemName}</p>
              </>
            ) : (
              <p className="text-lg font-semibold text-slate-800">How much would you like to contribute?</p>
            )}
          </div>

          {!preselectedItem && (
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant={!isRecurring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsRecurring(false)}
                disabled={loading}
              >
                One-Time
              </Button>
              <Button
                type="button"
                variant={isRecurring ? "default" : "outline"}
                size="sm"
                onClick={() => setIsRecurring(true)}
                disabled={loading}
              >
                Recurring
              </Button>
            </div>
          )}

          {isRecurring && !preselectedItem && (
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant={frequency === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setFrequency("weekly")}
                disabled={loading}
              >
                Weekly
              </Button>
              <Button
                type="button"
                variant={frequency === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setFrequency("monthly")}
                disabled={loading}
              >
                Monthly
              </Button>
              <Button
                type="button"
                variant={frequency === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => setFrequency("yearly")}
                disabled={loading}
              >
                Yearly
              </Button>
            </div>
          )}
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400">$</span>
            <Input 
              type="number"
              placeholder="25.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="h-16 pl-10 text-4xl font-bold text-center"
              disabled={!!preselectedItem || loading}
              step="0.01"
              min="2"
              required
            />
          </div>
          
          <div className="space-y-4">
            <Input 
              placeholder="Your Name (optional)" 
              value={donorInfo.name} 
              onChange={e => setDonorInfo({...donorInfo, name: e.target.value})}
              disabled={loading}
            />
            <Input 
              placeholder="Your Email (for receipt)" 
              type="email" 
              value={donorInfo.email} 
              onChange={e => setDonorInfo({...donorInfo, email: e.target.value})}
              disabled={loading}
            />
            <Textarea 
              placeholder="Leave a message (optional)" 
              value={donorInfo.message} 
              onChange={e => setDonorInfo({...donorInfo, message: e.target.value})}
              disabled={loading}
            />
          </div>

          <Alert variant="secondary" className="flex items-center gap-3">
            <LocateFixed className="w-5 h-5 text-slate-500" />
            <div className="flex-1">
              <AlertDescription>
                Enable location to help create a contribution heatmap. This is optional.
              </AlertDescription>
            </div>
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              onClick={handleLocationRequest} 
              disabled={locating || locationEnabled || loading}
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : locationEnabled ? "Enabled" : "Enable"}
            </Button>
          </Alert>

          <Button 
            type="submit"
            disabled={loading || !amount || parseFloat(amount) < 2} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 mr-2" />
                {isRecurring ? `Subscribe $${parseFloat(amount || 0).toFixed(2)}/${frequency === 'yearly' ? 'year' : frequency === 'weekly' ? 'week' : 'month'}` : `Contribute $${parseFloat(amount || 0).toFixed(2)}`}
              </>
            )}
          </Button>

          {parseFloat(amount) > 0 && parseFloat(amount) < 2 && (
            <p className="text-red-500 text-sm text-center">Minimum contribution is $2.00</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}