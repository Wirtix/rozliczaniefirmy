import { COMPANY_INFO } from "./company";
import { SignatureInfo } from "./types";

function fallbackId() {
  return `sign-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
}

export function createSignatureInfo(seed?: string): SignatureInfo {
  const signerName = COMPANY_INFO.signerName || COMPANY_INFO.name;
  const baseId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : fallbackId();
  const signatureId = seed ? `${baseId}-${seed}` : baseId;
  return {
    signerName,
    signatureId,
    signedAtISO: new Date().toISOString(),
  };
}
