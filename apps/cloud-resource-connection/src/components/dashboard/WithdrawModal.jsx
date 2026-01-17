import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, Loader2, ArrowUpRight, Zap, Clock } from "lucide-react";
import { toast } from "sonner";

export default function WithdrawModal({ profile, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("standard");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount < 1) {
      toast.error("Minimum withdrawal is $1");
      return;
    }

    if (withdrawAmount > profile.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);

    try {
      const { data } = await base44.functions.invoke('requestPayout', {
        profileId: profile.id,
        amount: withdrawAmount,
        method: method
      });

      toast.success(`Withdrawal initiated! Funds will arrive ${method === 'instant' ? 'within 30 minutes' : 'in 2-3 business days'}`);
      queryClient.invalidateQueries(['myProfiles']);
      queryClient.invalidateQueries(['myPayouts']);
      onClose();

    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const instantFee = amount ? (parseFloat(amount) * 0.015).toFixed(2) : '0.00';
  const instantNet = amount ? (parseFloat(amount) - parseFloat(instantFee)).toFixed(2) : '0.00';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Cash Out Your Balance
          </DialogTitle>
          <DialogDescription>
            Withdraw funds to your connected bank account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Available Balance */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <p className="text-sm text-green-700 font-medium mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-green-900">
              ${profile.availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-base font-semibold mb-3 block">
              Withdrawal Amount
            </Label>
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAmount((profile.availableBalance / 2).toFixed(2))}
                className="flex-1"
              >
                Half
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAmount(profile.availableBalance.toFixed(2))}
                className="flex-1"
              >
                All
              </Button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-12 text-lg"
                min="1"
                max={profile.availableBalance}
                step="0.01"
              />
            </div>
          </div>

          {/* Payout Method */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Payout Speed
            </Label>
            <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <RadioGroupItem value="standard" id="standard" />
                <label htmlFor="standard" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">Standard (Free)</span>
                  </div>
                  <p className="text-sm text-slate-600">2-3 business days • No fees</p>
                </label>
              </div>

              <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <RadioGroupItem value="instant" id="instant" />
                <label htmlFor="instant" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-slate-800">Instant</span>
                  </div>
                  <p className="text-sm text-slate-600">Within 30 minutes • 1.5% fee</p>
                  {method === 'instant' && amount && parseFloat(amount) >= 1 && (
                    <p className="text-xs text-amber-700 mt-1">
                      Fee: ${instantFee} • You receive: ${instantNet}
                    </p>
                  )}
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            disabled={loading || !amount || parseFloat(amount) < 1 || parseFloat(amount) > profile.availableBalance}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Withdraw ${amount || '0.00'}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            Funds will be sent to your connected bank account or debit card
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}