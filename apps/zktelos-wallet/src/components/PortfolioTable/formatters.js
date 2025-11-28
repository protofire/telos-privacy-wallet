import { ethers } from 'ethers';
import { formatNumber } from 'utils';

export const calculateValue = (balance, price, tokenDecimals) => {
  if (!balance || !price) return null;
  const balanceInToken = parseFloat(ethers.utils.formatUnits(balance, tokenDecimals));
  return balanceInToken * price;
};

export const formatBalance = (balance, tokenDecimals) => {
  return balance ? formatNumber(balance, tokenDecimals, 2) : '0';
};

export const formatPrice = (price) => {
  return price ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';
};

export const formatValue = (value) => {
  if (value == null) return '--';
  if (value < 0.01 && value > 0) return '< $0.01';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatFullValue = (value) => {
  return value ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : '--';
};

export const sortRowsByAsset = (rows) => {
  return [...rows].sort((a, b) => {
    return a.asset.localeCompare(b.asset, 'en', { sensitivity: 'base', numeric: true });
  });
};

