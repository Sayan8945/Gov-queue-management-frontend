import { QRCodeSVG } from 'qrcode.react';
import { generateQrPayload } from '@/utils/tokenGenerator';

/**
 * Renders a real scannable QR code encoding the token payload.
 * TODO(backend): once tokens are issued server-side, encode a verification
 * URL (e.g. https://.../verify/:tokenId) instead of raw JSON so staff can
 * scan-and-validate against the server.
 */
export default function TokenQrCode({ token, size = 160 }) {
  const value = generateQrPayload(token);
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <QRCodeSVG value={value} size={size} includeMargin bgColor="#ffffff" fgColor="#111827" />
      <p className="text-xs text-gray-500 dark:text-gray-400">Show this at the counter</p>
    </div>
  );
}
