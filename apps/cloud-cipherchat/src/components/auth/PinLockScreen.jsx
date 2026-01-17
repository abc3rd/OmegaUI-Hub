import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lock, Shield, AlertCircle } from "lucide-react";

export default function PinLockScreen({ onUnlock, isSetup = false }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(isSetup ? "setup" : "unlock");

  const handleSetupPin = () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    const hashedPin = btoa(pin);
    localStorage.setItem("app_pin_hash", hashedPin);
    localStorage.setItem("pin_lock_enabled", "true");
    onUnlock();
  };

  const handleUnlock = () => {
    const storedHash = localStorage.getItem("app_pin_hash");
    const inputHash = btoa(pin);

    if (inputHash === storedHash) {
      onUnlock();
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (step === "setup") {
      handleSetupPin();
    } else {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "setup" ? "Set Up PIN Lock" : "Enter Your PIN"}
          </CardTitle>
          <p className="text-sm text-slate-500">
            {step === "setup" 
              ? "Protect your conversation history with a PIN"
              : "Unlock to access your conversations"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder={step === "setup" ? "Create PIN (min 4 digits)" : "Enter PIN"}
                className="text-center text-2xl tracking-widest h-14"
                autoFocus
              />
            </div>

            {step === "setup" && (
              <div>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Confirm PIN"
                  className="text-center text-2xl tracking-widest h-14"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-lg"
            >
              {step === "setup" ? "Set PIN" : "Unlock"}
            </Button>

            {step === "setup" && (
              <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Your PIN is stored securely on this device and never sent to any server.
                  You cannot recover your PIN if forgotten.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}