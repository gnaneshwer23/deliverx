import { describe, expect, it } from "vitest";
import {
  appendRoleToPath,
  marketingRoleToDbRole,
  parseSignupRoleParam,
  roleMissionControlCta,
  roleSignupLabel,
  signupHrefForRole,
  signupRoleQueryValue,
} from "@/lib/marketing/role-signup";

describe("role-signup", () => {
  it("parses marketing and database role query values", () => {
    expect(parseSignupRoleParam("pm")).toBe("pm");
    expect(parseSignupRoleParam("sponsor")).toBe("executive");
    expect(parseSignupRoleParam("executive")).toBe("executive");
    expect(parseSignupRoleParam("po")).toBe("product_manager");
    expect(parseSignupRoleParam("product_manager")).toBe("product_manager");
    expect(parseSignupRoleParam("eng")).toBe("engineer");
    expect(parseSignupRoleParam("sm")).toBe("scrum_master");
    expect(parseSignupRoleParam("invalid")).toBeNull();
    expect(parseSignupRoleParam(null)).toBeNull();
  });

  it("maps marketing roles to database roles", () => {
    expect(marketingRoleToDbRole("sponsor")).toBe("executive");
    expect(marketingRoleToDbRole("pm")).toBe("pm");
    expect(marketingRoleToDbRole("po")).toBe("product_manager");
  });

  it("builds signup hrefs with role preselect", () => {
    expect(signupHrefForRole("pm")).toBe("/signup?role=pm");
    expect(signupHrefForRole("sponsor", { invite: "abc" })).toBe(
      "/signup?role=sponsor&invite=abc",
    );
    expect(signupRoleQueryValue("ba")).toBe("ba");
  });

  it("appends role to onboarding paths", () => {
    expect(appendRoleToPath("/onboarding/role", "pm")).toBe("/onboarding/role?role=pm");
    expect(appendRoleToPath("/onboarding/role?foo=1", null)).toBe("/onboarding/role?foo=1");
  });

  it("provides marketing CTA copy", () => {
    expect(roleMissionControlCta("pm")).toBe("See PM mission control →");
    expect(roleSignupLabel("ba")).toBe("Start as Business Analyst");
  });
});
