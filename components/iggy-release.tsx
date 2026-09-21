import { ArrowUpRight } from 'lucide-react';

export const IGGY_RELEASE = {
  version: '0.9.0',
  headline: 'Clustering is here.',
  url: 'https://iggy.apache.org/blogs/2026/09/21/release-0.9.0/',
  repo: 'https://github.com/apache/iggy'
};

/** Slim, linkable announcement chip. */
export function IggyReleaseChip({ className = '' }: { className?: string }) {
  return (
    <a
      href={IGGY_RELEASE.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/70 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.06] hover:text-white ${className}`}
    >
      <span className="mono-heading rounded-full bg-ld-lime px-1.5 py-0.5 text-[9px] text-ld-ink">New</span>
      <span>
        Apache Iggy {IGGY_RELEASE.version} — {IGGY_RELEASE.headline}
      </span>
      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
    </a>
  );
}

/**
 * Compact variant. Keeps the release timely without competing with the primary
 * call to action it sits beneath.
 */
export function IggyReleaseStrip() {
  return (
    <a
      href={IGGY_RELEASE.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 py-3 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.05]"
    >
      <span className="mono-heading rounded-full bg-ld-lime px-1.5 py-0.5 text-[9px] text-ld-ink">New</span>
      <span className="text-[13px] text-white/75">
        Apache Iggy {IGGY_RELEASE.version} — {IGGY_RELEASE.headline}
      </span>
      <span className="font-mono text-[11px] text-white/45">
        VSR consensus · p99 ~3 ms replicated, 3-node at 800 MB/s
      </span>
      <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/40 transition-colors group-hover:text-white" />
    </a>
  );
}
