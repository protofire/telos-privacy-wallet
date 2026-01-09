import { useCallback, useContext, useMemo, useState } from 'react';

import { PoolContext, WalletContext } from 'contexts';

const WRAPPED_NATIVE_ABI = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'wad',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export default () => {
  const { currentPool } = useContext(PoolContext);
  const { callContract } = useContext(WalletContext);
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

    setIsWrapping(true);
    try {
      return await callContract(contractAddress, WRAPPED_NATIVE_ABI, 'deposit', [amountWei], true);
    } finally {
      setIsWrapping(false);
    }
  }, [isSupported, contractAddress, callContract]);

  const unwrap = useCallback(async amountWei => {
    if (!isSupported) {
      throw new Error('Unwrap is not supported for the current pool');
    }

    setIsUnwrapping(true);
    try {
      return await callContract(contractAddress, WRAPPED_NATIVE_ABI, 'withdraw', [amountWei], true);
    } finally {
      setIsUnwrapping(false);
    }
  }, [isSupported, contractAddress, callContract]);

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

