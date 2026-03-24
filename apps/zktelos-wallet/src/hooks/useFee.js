import { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

import { ZkAccountContext, PoolContext } from 'contexts';
import { TxType } from 'zkbob-client-js';

const calculateDynamicDepositFee = (amount, directDepositFee, depositFeeBps) => {
  if (!directDepositFee || directDepositFee.isZero()) return ethers.constants.Zero;
  if (amount.eq(ethers.constants.Zero)) return ethers.constants.Zero;

  // Mirror the contract formula: fee = max(amount * feeBps / 10000, directDepositFee)
  let feeApplied = amount.mul(depositFeeBps).div(10000);

  if (feeApplied.lt(directDepositFee)) {
    feeApplied = directDepositFee;
  }

  return feeApplied;
}

export default (amount, txType, amountToConvert) => {
  const { estimateFee } = useContext(ZkAccountContext);
  const { currentPool } = useContext(PoolContext);
  const [fee, setFee] = useState(ethers.constants.Zero);
  const [relayerFee, setRelayerFee] = useState(null);
  const [directDepositFee, setDirectDepositFee] = useState(ethers.constants.Zero);
  const [numberOfTxs, setNumberOfTxs] = useState(ethers.constants.Zero);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  useEffect(() => {
    async function updateFee() {
      const timeout = setTimeout(() => setIsLoadingFee(true), 100);
      const data = await estimateFee(
        amount instanceof Array ? amount.map(item => item.amount) : [amount],
        txType,
        amountToConvert,
      );

      let fee = ethers.constants.Zero;
      // Dynamic fee only for deposits
      if (txType === TxType.Deposit || txType === TxType.BridgeDeposit) {
        fee = calculateDynamicDepositFee(amount, data?.directDepositFee, currentPool.depositFeeBps);
      } else {
        fee = data?.fee;
      }
      const numberOfTxs = data?.numberOfTxs;
      setFee(fee || ethers.constants.Zero);
      setRelayerFee(data?.relayerFee);
      setDirectDepositFee(data?.directDepositFee || ethers.constants.Zero);
      setNumberOfTxs(numberOfTxs || ethers.constants.Zero);
      clearTimeout(timeout);
      setIsLoadingFee(false);
    }
    updateFee();
    const interval = setInterval(updateFee, 5000);
    return () => clearInterval(interval);
  }, [amount, txType, estimateFee, currentPool, amountToConvert]);

  return { fee, numberOfTxs, isLoadingFee, relayerFee, directDepositFee };
};
