import { ArrowUpRight, Cloud, CreditCard, HardDrive, Server } from 'lucide-react';

export const LASERDATA_CLOUD_URL = 'https://laserdata.cloud';

/**
 * Primary post-quiz call to action. Deliberately shows the free tier's *offer*
 * (what you get) rather than headline throughput numbers -- those describe a
 * different setup from the clustered 0.9.0 benchmark shown alongside it, and
 * putting the two side by side would read as a contradiction.
 */
export function LaserDataCloudCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      <div className="laser-rail" />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mono-heading text-[10px] text-sky-300">Free tier</span>
          <span className="mono-heading text-[10px] text-ld-lime">No credit card</span>
        </div>

        <h3 className="mt-3 text-2xl font-semibold leading-tight text-white">Try LaserData for free.</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
          An enterprise-grade cluster powered by Apache Iggy, ready in minutes. Sign in with GitHub, Google or
          Microsoft — nothing to install.
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <Spec icon={<Server className="h-3.5 w-3.5" />} label="Deployment" value="1 node, 1 GB RAM" />
          <Spec icon={<HardDrive className="h-3.5 w-3.5" />} label="Storage" value="100 GB network disk" />
          <Spec icon={<Cloud className="h-3.5 w-3.5" />} label="Cloud provider" value="AWS or GCP" />
          <Spec icon={<CreditCard className="h-3.5 w-3.5" />} label="Cost" value="$0, no card required" />
        </dl>

        <a
          href={LASERDATA_CLOUD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ld-lime px-5 py-3 text-sm font-medium text-ld-ink transition-colors duration-150 hover:bg-white"
        >
          Start free on laserdata.cloud
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function Spec(props: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-3">
      <dt className="mono-heading flex items-center gap-2 text-[10px] text-white/55">
        <span className="text-sky-300">{props.icon}</span>
        {props.label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-white">{props.value}</dd>
    </div>
  );
}
