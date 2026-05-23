import { getOrgAlertQueue } from "@/services/alerts";
import { getDeliveryCoachSuggestions } from "@/services/deliveryCoach";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { AlertQueuePanel } from "@/components/dashboard/alert-queue-panel";
import { DeliveryCoachPanel } from "@/components/dashboard/delivery-coach-panel";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const [alerts, coach] = await Promise.all([
    getOrgAlertQueue(40),
    getDeliveryCoachSuggestions(8),
  ]);

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX OS · Intelligence" title="AI alert" titleEm="queue" />
      <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Active alerts ({alerts.length})</h2>
          <AlertQueuePanel alerts={alerts} />
        </section>
        <section>
          <h2 className="mb-3 font-semibold">Delivery coach</h2>
          <DeliveryCoachPanel suggestions={coach} />
        </section>
      </div>
    </>
  );
}
