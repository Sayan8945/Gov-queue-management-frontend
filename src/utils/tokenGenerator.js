// Utilities for generating human-readable token numbers and IDs.
// TODO(backend): token numbering should ultimately be assigned atomically by the server.

let counter = 1000;

export function generateTokenId() {
  counter += 1;
  return `tok-${Date.now()}-${counter}`;
}

/**
 * Produces a display token number like "PSP-014"
 */
export function generateTokenNumber(departmentCode, sequence) {
  return `${departmentCode}-${String(sequence).padStart(3, '0')}`;
}

export function generateQrPayload(token) {
  return JSON.stringify({
    tokenNumber: token.tokenNumber,
    department: token.departmentId,
    service: token.serviceId,
    slot: token.slot,
    issuedAt: token.createdAt,
  });
}
