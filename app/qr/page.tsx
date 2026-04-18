import Image from 'next/image';

export default function QRPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0b1220] p-10">
      <Image
        src="/laserdata-logo.svg"
        alt="LaserData logo"
        width={200}
        height={50}
        className="h-auto"
        priority
      />
      <h1 className="text-3xl font-semibold text-slate-50">Can You Think in Streams?</h1>
      <p className="text-lg text-slate-400">Scan, solve &amp; score — win exclusive Iggy swag!</p>
      <div className="rounded-3xl bg-white p-8">
        <Image
          src="/quiz-qr.png"
          alt="QR code to start the quiz"
          width={400}
          height={400}
          className="h-auto w-full"
          priority
        />
      </div>
      <p className="mono-heading text-lg text-sky-300">Scan to Play</p>
    </main>
  );
}
