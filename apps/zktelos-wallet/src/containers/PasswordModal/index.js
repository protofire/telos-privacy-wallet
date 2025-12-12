import { useContext, useState, useCallback } from 'react';

import { ModalContext, ZkAccountContext } from 'contexts';
import PasswordModal from 'components/PasswordModal';
import usePinValidation from 'hooks/usePinValidation';

export default () => {
  const {
    isPasswordModalOpen,
    openAccessAccountModal,
    isAccessAccountModalOpen,
    isCreateAccountModalOpen,
    closePasswordModal
  } = useContext(ModalContext);
  const { unlockAccount, isLoadingZkAccount } = useContext(ZkAccountContext);
  const [pin, setPin] = useState('');
  const { validate, errorKey, setErrorKey, resetValidation } = usePinValidation();

  const handlePinChange = useCallback(nextValue => {
    setErrorKey(null);
    setPin(nextValue);
  }, [setErrorKey]);

  const confirm = useCallback(async () => {
    if (!validate({ pin })) {
      return;
    }
    try {
      const success = await unlockAccount(pin);
      if (success) {
        setPin('');
        resetValidation();
        closePasswordModal();
      } else {
        setErrorKey('pin.error.invalid');
        setPin('');
      }
    } catch (error) {
      setErrorKey('pin.error.invalid');
      setPin('');
    }
  }, [closePasswordModal, pin, resetValidation, setErrorKey, unlockAccount, validate]);

  const reset = useCallback(async () => {
    setPin('');
    resetValidation();
    openAccessAccountModal();
    closePasswordModal()
  }, [closePasswordModal, openAccessAccountModal, resetValidation]);

  return (
    <PasswordModal
      isOpen={isPasswordModalOpen}
      pin={pin}
      onPinChange={handlePinChange}
      confirm={confirm}
      reset={reset}
      errorKey={errorKey}
      isAccountSetUpModalOpen={isAccessAccountModalOpen || isCreateAccountModalOpen}
      isLoading={isLoadingZkAccount}
    />
  );
}
