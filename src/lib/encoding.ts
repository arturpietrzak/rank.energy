import { TierState, TIER_INDEX, INDEX_TO_TIER, initEmptyTierState, getRankedTiers } from "@/types";

/**
 * Encodes a tier state into a compact base64url string.
 *
 * Binary format:
 *   [bitmask: ceil(maxId/8) bytes] [tier data: ceil(R × 3 / 8) bytes]
 *
 * Bitmask: bit (id-1) = 1 if monster is ranked (not in 'unranked')
 * Tier data: 3-bit tier indices (0-6) for each ranked monster, in ID order, tightly packed
 */
export function encodeTierState(state: TierState, maxId: number): string {
  const maskLen = Math.ceil(maxId / 8);
  const mask = new Uint8Array(maskLen);

  // Collect ranked monster IDs and their tier indices
  const ranked: Array<{ id: number; tierIdx: number }> = [];
  const rankedTiers = getRankedTiers();

  for (const tier of rankedTiers) {
    const ids = state[tier.slug] ?? [];
    const idx = TIER_INDEX[tier.slug];
    for (const id of ids) {
      ranked.push({ id, tierIdx: idx });
    }
  }

  // Sort by ID so decoding is deterministic
  ranked.sort((a, b) => a.id - b.id);

  // If nothing is ranked, return empty string
  if (ranked.length === 0) return "";

  // Build bitmask
  for (const { id } of ranked) {
    const byteIdx = Math.floor((id - 1) / 8);
    const bitIdx = (id - 1) % 8;
    mask[byteIdx] |= 1 << (7 - bitIdx); // MSB-first within each byte
  }

  // Pack tier data: R ranked monsters × 3 bits each
  const tierBits = ranked.length * 3;
  const tierLen = Math.ceil(tierBits / 8);
  const tierData = new Uint8Array(tierLen);

  let bitPos = 0; // current bit position in tierData
  for (const { tierIdx } of ranked) {
    writeBits(tierData, bitPos, tierIdx, 3);
    bitPos += 3;
  }

  // Concatenate mask + tier data
  const combined = new Uint8Array(maskLen + tierLen);
  combined.set(mask);
  combined.set(tierData, maskLen);

  // Base64url encode
  return bytesToBase64Url(combined);
}

/**
 * Decodes a base64url string back into a TierState.
 * Gracefully ignores unknown monster IDs and malformed data.
 */
export function decodeTierState(
  encoded: string,
  validIds: Set<number>,
  maxId: number
): TierState {
  const tiers = initEmptyTierState();
  if (!encoded) return tiers;

  let bytes: Uint8Array;
  try {
    bytes = base64UrlToBytes(encoded);
  } catch {
    return tiers; // malformed
  }

  const maskLen = Math.ceil(maxId / 8);
  if (bytes.length < maskLen) return tiers;

  // Read bitmask
  const rankedIds: number[] = [];
  for (let id = 1; id <= maxId; id++) {
    const byteIdx = Math.floor((id - 1) / 8);
    const bitIdx = (id - 1) % 8;
    if (byteIdx >= maskLen) break;
    if ((bytes[byteIdx] >> (7 - bitIdx)) & 1) {
      if (validIds.has(id)) {
        rankedIds.push(id);
      }
    }
  }

  const rankedCount = rankedIds.length;
  const tierLen = Math.ceil((rankedCount * 3) / 8);

  // Read tier data
  const tierData = bytes.slice(maskLen, maskLen + tierLen);
  let bitPos = 0;
  for (const id of rankedIds) {
    const tierIdx = readBits(tierData, bitPos, 3);
    bitPos += 3;
    const slug = INDEX_TO_TIER[tierIdx];
    if (slug && slug !== 'unranked') {
      tiers[slug].push(id);
    }
  }

  return tiers;
}

// ---- Bit I/O helpers ----

function writeBits(buf: Uint8Array, bitOffset: number, value: number, numBits: number) {
  for (let i = 0; i < numBits; i++) {
    const bit = (value >> (numBits - 1 - i)) & 1;
    const byteIdx = Math.floor((bitOffset + i) / 8);
    const bitIdx = (bitOffset + i) % 8;
    if (byteIdx < buf.length) {
      buf[byteIdx] |= bit << (7 - bitIdx);
    }
  }
}

function readBits(buf: Uint8Array, bitOffset: number, numBits: number): number {
  let value = 0;
  for (let i = 0; i < numBits; i++) {
    const byteIdx = Math.floor((bitOffset + i) / 8);
    const bitIdx = (bitOffset + i) % 8;
    if (byteIdx < buf.length) {
      const bit = (buf[byteIdx] >> (7 - bitIdx)) & 1;
      value = (value << 1) | bit;
    }
  }
  return value;
}

// ---- Base64url (no padding, URL-safe) ----

function bytesToBase64Url(bytes: Uint8Array): string {
  // Use standard btoa by going through a binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBytes(str: string): Uint8Array {
  // Restore standard base64
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (b64.length % 4 !== 0) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
