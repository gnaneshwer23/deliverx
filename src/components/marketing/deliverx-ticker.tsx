import {
  TICKER_CAPABILITIES,
  TICKER_ROLES,
  type TickerRole,
} from "@/lib/marketing/landing-data";
import styles from "./DeliverXTicker.module.css";

function RoleItems({ roles }: { roles: TickerRole[] }) {
  return (
    <>
      {roles.map((item, index) => (
        <span key={`${item.role}-${index}`} className={styles.r1item}>
          <span className={styles.symbol} aria-hidden>
            {item.symbol}
          </span>
          <span className={styles.role}>{item.role}</span>
          <span className={styles.sep} aria-hidden>
            ·
          </span>
          <span className={styles.meaning}>{item.meaning}</span>
          <span className={styles.divider} aria-hidden>
            ◆
          </span>
        </span>
      ))}
    </>
  );
}

function CapabilityItems({ capabilities }: { capabilities: readonly string[] }) {
  return (
    <>
      {capabilities.map((term, index) => (
        <span key={`${term}-${index}`} className={styles.r2item}>
          {term}
          <span className={styles.dot} aria-hidden>
            ·
          </span>
        </span>
      ))}
    </>
  );
}

export function DeliverXTicker() {
  return (
    <section className={styles.band} aria-label="DeliverX roles and platform capabilities">
      <p className="sr-only">
        DeliverX connects seven delivery personas — Sponsor, Project Manager, Business Analyst,
        Product Manager, Engineer, QA, and Scrum Master — with capabilities including Delivery
        Brain, AI Review Queue, meeting intelligence, and organisational memory.
      </p>

      <div className={styles.row}>
        <div className={`${styles.track} ${styles.trackLeft}`}>
          <RoleItems roles={TICKER_ROLES} />
          <RoleItems roles={TICKER_ROLES} />
        </div>
      </div>

      <div className={styles.row}>
        <div className={`${styles.track} ${styles.trackRight}`}>
          <CapabilityItems capabilities={TICKER_CAPABILITIES} />
          <CapabilityItems capabilities={TICKER_CAPABILITIES} />
        </div>
      </div>
    </section>
  );
}
