import { useState, useEffect } from "react";

export const usePinLock = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const pinEnabled = localStorage.getItem("pin_lock_enabled") === "true";
    const hasPin = localStorage.getItem("app_pin_hash");

    if (!pinEnabled) {
      setIsLocked(false);
      setNeedsSetup(false);
    } else if (!hasPin) {
      setIsLocked(true);
      setNeedsSetup(true);
    } else {
      setIsLocked(true);
      setNeedsSetup(false);
    }
  }, []);

  const unlock = () => {
    setIsLocked(false);
  };

  const lock = () => {
    setIsLocked(true);
    setNeedsSetup(false);
  };

  const enablePinLock = () => {
    localStorage.setItem("pin_lock_enabled", "true");
    const hasPin = localStorage.getItem("app_pin_hash");
    if (!hasPin) {
      setNeedsSetup(true);
    }
    setIsLocked(true);
  };

  const disablePinLock = () => {
    localStorage.removeItem("pin_lock_enabled");
    setIsLocked(false);
  };

  const changePin = () => {
    setNeedsSetup(true);
    setIsLocked(true);
  };

  const isPinEnabled = localStorage.getItem("pin_lock_enabled") === "true";

  return {
    isLocked,
    needsSetup,
    unlock,
    lock,
    enablePinLock,
    disablePinLock,
    changePin,
    isPinEnabled,
  };
};