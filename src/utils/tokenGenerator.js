// QR payload builder for a real (backend-issued) token document.
// Token numbers/sequencing are generated atomically server-side
// (Server/src/helpers/tokenNumberHelper.js) — nothing here invents IDs.

export function generateQrPayload(token) {
  return JSON.stringify({
    tokenId: token._id,
    tokenNumber: token.tokenNumber,
    department: token.departmentId?.departmentName || token.departmentId,
    service: token.serviceId?.serviceName || token.serviceId,
    bookingDate: token.bookingDate,
    issuedAt: token.createdAt,
  });
}
