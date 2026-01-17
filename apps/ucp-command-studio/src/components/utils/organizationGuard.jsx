import { toast } from "sonner";

/**
 * Organization Guard Utility
 * 
 * Ensures user is loaded and has a valid organization_id before allowing
 * create/update operations on entities.
 * 
 * Usage:
 *   const orgId = requireOrganizationId(user);
 *   if (!orgId) return; // Operation blocked
 *   
 *   // Proceed with write operation
 *   await base44.entities.MyEntity.create({ organization_id: orgId, ... });
 */

/**
 * Validates and returns organization ID
 * @param {Object} user - User object from base44.auth.me()
 * @param {boolean} showToast - Whether to show error toast (default: true)
 * @returns {string|null} - Valid organization_id or null if missing
 */
export function requireOrganizationId(user, showToast = true) {
  if (!user) {
    if (showToast) {
      toast.error("Authentication required. Please log in.");
    }
    return null;
  }

  if (!user.organization_id) {
    if (showToast) {
      toast.error("Organization context missing. Please contact support.");
    }
    console.error("User missing organization_id:", user);
    return null;
  }

  return user.organization_id;
}

/**
 * React hook for organization guard
 * Returns organization ID and a boolean indicating if it's valid
 */
export function useOrganizationGuard(user) {
  const orgId = user?.organization_id || null;
  const isValid = !!orgId;

  return { organizationId: orgId, hasOrganization: isValid };
}