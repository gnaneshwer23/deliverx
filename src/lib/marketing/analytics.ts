import { track } from "@vercel/analytics";

export type RoleChipSection = "hero" | "platform";

/** Vercel Web Analytics custom event when a homepage role pill is selected. */
export function trackRoleChipClick(roleId: string, section: RoleChipSection) {
  try {
    track("role_chip_click", { role: roleId, section });
  } catch {
    // Never block role switcher UX if analytics is unavailable.
  }
}
