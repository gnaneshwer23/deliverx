import type { RoleDashboard, RoleId } from "@/lib/marketing/landing-data";
import { BaPreview } from "./ba-preview";
import { EngineerPreview } from "./engineer-preview";
import { FounderPreview } from "./founder-preview";
import { PmPreview } from "./pm-preview";
import { ProductPreview } from "./product-preview";
import { QaPreview } from "./qa-preview";
import { RolePreviewChrome } from "./role-preview-chrome";
import { ScrumPreview } from "./scrum-preview";

export function RolePreview({
  roleId,
  role,
  accentBorder,
}: {
  roleId: RoleId;
  role: RoleDashboard;
  accentBorder?: string;
}) {
  const content = (() => {
    switch (roleId) {
      case "sponsor":
        return <FounderPreview role={role} />;
      case "pm":
        return <PmPreview role={role} />;
      case "ba":
        return <BaPreview role={role} />;
      case "po":
        return <ProductPreview role={role} />;
      case "eng":
        return <EngineerPreview role={role} />;
      case "qa":
        return <QaPreview role={role} />;
      case "sm":
        return <ScrumPreview role={role} />;
    }
  })();

  return (
    <RolePreviewChrome role={role} accentBorder={accentBorder}>
      {content}
    </RolePreviewChrome>
  );
}

export { RolePreviewChrome } from "./role-preview-chrome";
