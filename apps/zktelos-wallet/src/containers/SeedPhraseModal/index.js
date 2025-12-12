import { useContext, useState, useCallback, useEffect } from 'react';

import { ModalContext, ZkAccountContext } from 'contexts';
import SeedPhraseModal from 'components/SeedPhraseModal';
import usePinValidation from 'hooks/usePinValidation';

export default () => {
  const { isSeedPhraseModalOpen, closeSeedPhraseModal } = useContext(ModalContext);
  const { decryptMnemonic, getSeed } = useContext(ZkAccountContext);
  const [pin, setPin] = useState('');
  const [mnemonic, setMnemonic] = useState(null);
  const { validate, errorKey, setErrorKey, resetValidation } = usePinValidation();

  const { seed, hasPassword } = getSeed();

  useEffect(() => {
    if (isSeedPhraseModalOpen && seed && !hasPassword) {
      setMnemonic(seed);
    }
  }, [seed, hasPassword, isSeedPhraseModalOpen]);

  const handlePinChange = useCallback(value => {
    resetValidation();
    setPin(value);
  }, [resetValidation]);

  const confirm = useCallback(async () => {
    if (!validate({ pin })) {
      return;
    }
    try {
      const mnemonic = await decryptMnemonic(pin);
      setMnemonic(mnemonic);
    } catch (error) {
      setErrorKey('pin.error.invalid');
      setPin('');
    }
  }, [pin, decryptMnemonic, validate, setErrorKey]);

  const handleKeyPress = useCallback(event => {
    if(event.key === 'Enter'){
      confirm();
    }
  }, [confirm]);

  const onClose = useCallback(() => {
    closeSeedPhraseModal();
    setPin('');
    setMnemonic(null);
    resetValidation();
  }, [closeSeedPhraseModal, resetValidation]);

  return (
    <SeedPhraseModal
      isOpen={isSeedPhraseModalOpen}
      onClose={onClose}
      confirm={confirm}
      onPinChange={handlePinChange}
      onKeyPress={handleKeyPress}
      pin={pin}
      error={!!errorKey}
      mnemonic={mnemonic}
    />
  );
}
