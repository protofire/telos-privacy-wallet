import { useCallback, useContext, useMemo, useState } from 'react';
import { ethers } from 'ethers';

import { PoolContext, WalletContext } from 'contexts';

const WRAPPED_NATIVE_ABI = [
  'function deposit() payable',
  'function withdraw(uint256 wad)',
  'function balanceOf(address owner) view returns (uint256)',
];

export default () => {
  const { currentPool } = useContext(PoolContext);
  const { signer } = useContext(WalletContext);
  const [isWrapping, setIsWrapping] = useState(false);
  const [isUnwrapping, setIsUnwrapping] = useState(false);

  const contractAddress = useMemo(
    () => (currentPool?.isNative ? currentPool?.tokenAddress : null),
    [currentPool],
  );

  const isSupported = useMemo(
    () => Boolean(contractAddress && currentPool?.isNative),
    [contractAddress, currentPool],
  );

  const wrap = useCallback(async amountWei => {
    if (!isSupported) {
      throw new Error('Wrap is not supported for the current pool');
    }
    if (!signer) {
      throw new Error('Wallet signer is not available');
    }
    setIsWrapping(true);
    try {
      const contract = new ethers.Contract(contractAddress, WRAPPED_NATIVE_ABI, signer);
      const tx = await contract.deposit({ value: amountWei });
      await tx.wait();
      return tx;
    } finally {
      setIsWrapping(false);
    }
  }, [isSupported, signer, contractAddress]);

  const unwrap = useCallback(async amountWei => {
    if (!isSupported) {
      throw new Error('Unwrap is not supported for the current pool');
    }
    if (!signer) {
      throw new Error('Wallet signer is not available');
    }
    setIsUnwrapping(true);
    try {
      const contract = new ethers.Contract(contractAddress, WRAPPED_NATIVE_ABI, signer);
      const tx = await contract.withdraw(amountWei);
      await tx.wait();
      return tx;
    } finally {
      setIsUnwrapping(false);
    }
  }, [isSupported, signer, contractAddress]);

  return {
    supportsWrap: isSupported,
    supportsUnwrap: isSupported,
    wrap,
    unwrap,
    isWrapping,
    isUnwrapping,
    contractAddress,
    contractAbi: WRAPPED_NATIVE_ABI,
  };
};

