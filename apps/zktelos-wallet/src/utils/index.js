import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Trans } from 'react-i18next';

import LinkDefault from 'components/Link';

import { SUPPORT_URL } from 'constants';

const { parseUnits, formatUnits, commify } = ethers.utils;

export const shortAddress = (string, length = 10) => {
  if (!string) {
    return string;
  }
  if (string.length <= length) {
    return string;
  }

  const left = Math.floor((length - 3) / 2);
  const right = Math.ceil((length - 3) / 2);
  return string.substring(0, left) + '...' + string.substring(string.length - right);
}

export const formatNumber = (wei, tokenDecimals, customNumberDecimals) => {
  if (!wei) return '0';
  if (wei.isZero()) return '0';
  if (tokenDecimals > 4 && wei.lte(parseUnits('0.0001', tokenDecimals))) return '≈ 0';

  const numberDecimals = typeof customNumberDecimals === 'number'
    ? customNumberDecimals
    : (wei.gt(parseUnits('1', tokenDecimals)) ? 2 : 4);
  const formatted = commify(formatUnits(wei, tokenDecimals));
  let [prefix, suffix] = formatted.split('.');
  if (suffix === '0' || numberDecimals === 0) {
    suffix = '';
  } else {
    suffix = '.' + suffix.slice(0, numberDecimals);
  }
  return prefix + suffix;
};

export const minBigNumber = (...numbers) =>
  numbers.reduce((p, v) => (p.lt(v) ? p : v));

export const maxBigNumber = (...numbers) =>
  numbers.reduce((p, v) => (p.gt(v) ? p : v));

export const normalizeAddress = (address) => {
  if (!address) return '';
  return address.replace(/\/$/, '').trim();
};

export const convertDataToUint8Array = (data) => {
  if (data instanceof Uint8Array) {
    return data;
  }
  if (Array.isArray(data)) {
    return new Uint8Array(data);
  }
  return null;
};

export const decodeTextFromData = (data) => {
  const dataToDecode = convertDataToUint8Array(data);
  if (!dataToDecode) {
    return null;
  }

  try {
    const decoder = new TextDecoder();
    const decoded = decoder.decode(dataToDecode);
    return decoded.trim() || null;
  } catch (error) {
    console.warn('Failed to decode text from data:', error);
    return null;
  }
};

export const showLoadingError = cause => {
  toast.error(
    <span>
      <b><Trans i18nKey={`loadingError.titles.${cause}`} /></b><br />
      <Trans i18nKey={`loadingError.description`} components={{ 1: <Link href={SUPPORT_URL} /> }} />
    </span>
  );
};

const Link = styled(LinkDefault)`
  color: inherit;
  text-decoration: underline;
`;
