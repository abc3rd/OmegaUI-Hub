import { useState, useEffect } from 'react';

/**
 * useAffiliateTracking Hook
 * Captures and persists affiliate/referral codes and UTM parameters from URL
 * 
 * Usage:
 * const { referralCode, utmParams, hasReferral } = useAffiliateTracking();
 */
export default function useAffiliateTracking() {
  const [referralCode, setReferralCode] = useState('');
  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  });
  const [landingPage, setLandingPage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Capture referral code from multiple possible parameters
    const ref = urlParams.get('ref') || 
                urlParams.get('referral') || 
                urlParams.get('affiliate') || 
                urlParams.get('partner') ||
                urlParams.get('source') || '';
    
    setReferralCode(ref);
    
    // Capture all UTM parameters
    setUtmParams({
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || ''
    });
    
    // Capture landing page URL
    setLandingPage(window.location.href);
    
    // Store in sessionStorage for persistence across page navigations
    if (ref) {
      sessionStorage.setItem('ucrash_referral', ref);
    }
    
    const existingRef = sessionStorage.getItem('ucrash_referral');
    if (existingRef && !ref) {
      setReferralCode(existingRef);
    }
  }, []);

  // Returns tracking data ready for form submission
  const getTrackingData = () => ({
    referral_code: referralCode,
    utm_source: utmParams.utm_source,
    utm_medium: utmParams.utm_medium,
    utm_campaign: utmParams.utm_campaign,
    utm_term: utmParams.utm_term,
    utm_content: utmParams.utm_content,
    landing_page_url: landingPage,
    first_visit_at: new Date().toISOString()
  });

  return {
    referralCode,
    utmParams,
    landingPage,
    hasReferral: !!referralCode,
    getTrackingData
  };
}