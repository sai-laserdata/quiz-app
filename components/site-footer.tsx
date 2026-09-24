import { Linkedin } from 'lucide-react';

import { SOCIAL_LINKS, XIcon } from '@/components/follow-links';
import { IGGY_RELEASE } from '@/components/iggy-release';
import { LASERDATA_CLOUD_URL } from '@/components/laserdata-cloud';

/**
 * Present on every page. States the LaserData <-> Apache Iggy relationship,
 * which nothing in the app previously explained.
 */
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-6 pb-10 pt-16 lg:px-10">
      <div className="laser-rail mb-6" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <a href="https://laserdata.com" target="_blank" rel="noopener noreferrer" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/laserdata-logo.svg" alt="LaserData" className="h-4 w-auto opacity-80 transition hover:opacity-100" />
          </a>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/50">
            Real-time data infrastructure for streams and agents. Built on the{' '}
            <a
              href="https://iggy.apache.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 transition-colors hover:text-white"
            >
              Apache Iggy
            </a>{' '}
            streaming engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/50">
          <a href="https://laserdata.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            laserdata.com
          </a>
          <a href={LASERDATA_CLOUD_URL} target="_blank" rel="noopener noreferrer" className="text-sky-300 transition-colors hover:text-white">
            Try free
          </a>
          <a href="https://iggy.apache.org" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            iggy.apache.org
          </a>
          <a href={IGGY_RELEASE.repo} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            github.com/apache/iggy
          </a>
          <span className="mono-heading text-[10px] text-white/50">Iggy v{IGGY_RELEASE.version}</span>
          <span className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LaserData on LinkedIn"
              className="transition-colors hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LaserData on X"
              className="transition-colors hover:text-white"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
