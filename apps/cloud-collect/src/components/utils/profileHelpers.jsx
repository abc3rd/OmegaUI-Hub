import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * Gets or creates a Profile for the authenticated user
 * @returns {Promise<Object|null>} Profile object or null if user not authenticated
 */
export async function getOrCreateProfile() {
  try {
    // Get authenticated user
    const user = await base44.auth.me();
    
    if (!user) {
      // User not authenticated - do not attempt to create Profile
      toast.error("Please sign in to continue");
      base44.auth.redirectToLogin();
      return null;
    }

    // Query for existing profile by created_by (user's email)
    const existingProfiles = await base44.entities.Profile.filter({ 
      created_by: user.email 
    });

    // If profile exists, return it
    if (existingProfiles && existingProfiles.length > 0) {
      return existingProfiles[0];
    }

    // Create new profile with minimal required fields
    const newProfile = await base44.entities.Profile.create({
      publicName: user.full_name || user.email.split('@')[0],
      story: "",
      goalAmount: 0,
      dailyGoal: 50,
      totalRaised: 0,
      availableBalance: 0,
      pendingBalance: 0,
      stripeAccountStatus: 'not_started',
      isDraft: true,
      isActive: false,
      completionPercentage: 0,
      verificationStatus: 'unverified',
      verificationBadges: [],
      enableProximityAlerts: false,
      publicProfileUrl: `${user.email.split('@')[0]}-${Math.random().toString(36).substring(2, 8)}`
    });

    return newProfile;
    
  } catch (error) {
    console.error("Profile creation error:", error);
    toast.error(`Could not create profile: ${error.message || error.toString()}`);
    return null;
  }
}

/**
 * Checks if user is authenticated before proceeding
 * @returns {Promise<Object|null>} User object or null
 */
export async function requireAuth() {
  try {
    const user = await base44.auth.me();
    if (!user) {
      toast.error("Please sign in to continue");
      base44.auth.redirectToLogin();
      return null;
    }
    return user;
  } catch (error) {
    console.error("Auth check error:", error);
    toast.error("Authentication error. Please sign in.");
    base44.auth.redirectToLogin();
    return null;
  }
}