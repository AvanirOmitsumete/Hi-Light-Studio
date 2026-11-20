import { useEffect, useState } from 'react';

type QrFactory = typeof import('qrcode-generator');
let factory: Promise<QrFactory> | undefined;

/** Loads the QR library only when a QR code is first shown. */
function loadQr(): Promise<QrFactory> {
  factory ??= import('qrcode-generator').then(({ default: qrcode }) => {
    // Names such as "Peña" must survive the trip to the phone.
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    return qrcode;
  });
  return factory;
}

/** Dark modules of a QR code as one SVG path (1 unit per module, 4-module quiet zone). */
function qrPath(qrcode: QrFactory, text: string): { size: number; path: string } {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 4;
  let path = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
    }
  }
  return { size: count + quiet * 2, path };
}

interface SmsQrCodeProps {
  /** Mobile number in 09XXXXXXXXX form. */
  mobile: string;
  message: string;
}

/**
 * A QR code that opens the phone's Messages app with the number and text filled in
 * (SMSTO format, read by the Android and iPhone cameras). Works offline: the
 * cashier scans it with the studio phone and presses Send.
 */
export function SmsQrCode({ mobile, message }: Readonly<SmsQrCodeProps>) {
  const [qr, setQr] = useState<{ size: number; path: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    loadQr()
      .then((qrcode) => { if (active) { setQr(qrPath(qrcode, `SMSTO:${mobile}:${message}`)); setFailed(false); } })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [mobile, message]);

  if (failed) return <p className="text-[10px] text-red-600">The QR code could not be created. Use Copy Message instead.</p>;
  return (
    // QR codes need dark modules on a light background in both themes.
    <div className="theme-paper inline-block bg-white p-1 border border-line">
      {qr ? (
        <svg role="img" aria-label={`QR code: text ${mobile}`} viewBox={`0 0 ${qr.size} ${qr.size}`}
          width={176} height={176} shapeRendering="crispEdges">
          <rect width={qr.size} height={qr.size} fill="#ffffff" />
          <path d={qr.path} fill="#000000" />
        </svg>
      ) : (
        <div className="w-[176px] h-[176px] flex items-center justify-center text-[10px] text-neutral-500">Loading QR…</div>
      )}
    </div>
  );
}
