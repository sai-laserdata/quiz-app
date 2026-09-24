import { Linkedin } from 'lucide-react';

/** One definition, used by the results screen and the footer. */
export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/laserdata/',
  x: 'https://x.com/laserdatainc'
} as const;

/**
 * lucide ships no X brand mark -- its `X` export is the generic close icon --
 * so the glyph lives here as a path rather than pulling in a second icon set.
 */
export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Deliberately not on the start screen: a player who taps an outbound link
 * mid-run loses the run. This is the after-the-quiz ask, and both links open in
 * a new tab so the claim code stays on screen behind them.
 */
export function FollowRow({ firstName }: { firstName?: string }) {
  return (
    <div className="space-y-4">
      <p className="max-w-xl text-sm leading-relaxed text-white/60">
        {firstName ? `Nice run, ${firstName}. ` : 'Nice run. '}
        We pull these scenarios from real incidents &mdash; we write them up as they happen.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <FollowButton href={SOCIAL_LINKS.linkedin} label="LinkedIn">
          <Linkedin className="h-4 w-4" />
        </FollowButton>
        <FollowButton href={SOCIAL_LINKS.x} label="X">
          <XIcon className="h-3.5 w-3.5" />
        </FollowButton>
      </div>
    </div>
  );
}

function FollowButton(props: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70 transition-colors duration-150 hover:border-white/25 hover:text-white"
    >
      {props.children}
      {props.label}
    </a>
  );
}
