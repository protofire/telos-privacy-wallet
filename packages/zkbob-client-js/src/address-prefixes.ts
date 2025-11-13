import { ZkAddressPrefix } from "./config";

export const GENERIC_ADDRESS_PREFIX = "zkbob";
export const PREFIXED_ADDR_REGEX: RegExp = /^[a-zA-Z][a-zA-Z0-9+_\-\,@&]+:([1-9A-HJ-NP-Za-km-z]{62,63})$/;
export const NAKED_ADDR_REGEX: RegExp = /^([1-9A-HJ-NP-Za-km-z]{62,63})$/;

export const hardcodedPrefixes: ZkAddressPrefix[] = [];
