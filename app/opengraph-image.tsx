import { ImageResponse } from 'next/og';
import { CORRECT_TO_WIN, QUESTIONS_PER_QUIZ } from '@/lib/quiz/config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Can You Think in Streams? — a LaserData systems quiz';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#070c0f',
          padding: 72,
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#52eafd'
            }}
          >
            LaserData
          </div>
          <div style={{ display: 'flex', width: 1, height: 22, background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ display: 'flex', fontSize: 20, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>
            APACHE IGGY
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 82, fontWeight: 600, color: '#ffffff', lineHeight: 1.05 }}>
            Can You Think in Streams?
          </div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 30, color: 'rgba(255,255,255,0.65)' }}>
            {CORRECT_TO_WIN} of {QUESTIONS_PER_QUIZ} right and the Iggy tee is yours.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              background: '#b8ff52',
              color: '#07111a',
              fontSize: 24,
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: 10
            }}
          >
            Take the Challenge
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(255,255,255,0.4)' }}>
            laserdata.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
