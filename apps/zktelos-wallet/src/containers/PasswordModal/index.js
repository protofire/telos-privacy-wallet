import { useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalContext, ZkAccountContext } from 'contexts';
import PasswordModal from 'components/PasswordModal';
import usePinValidation from 'hooks/usePinValidation';

export default () => {
  const { t } = useTranslation();
  const {
    isPasswordModalOpen,
    openAccessAccountModal,
    isAccessAccountModalOpen,
    isCreateAccountModalOpen,
    closePasswordModal
  } = useContext(ModalContext);
  const { unlockAccount } = useContext(ZkAccountContext);
  const [pin, setPin] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const { validate, errorKey, setErrorKey, resetValidation } = usePinValidation();

  const handlePinChange = useCallback(nextValue => {
    setSuccessMessage(null);
    setErrorKey(null);
    setPin(nextValue);
  }, [setErrorKey]);

  const confirm = useCallback(() => {
    if (!validate({ pin })) {
      return;
    }
    try {
      const success = unlockAccount(pin);
      if (success) {
        setSuccessMessage(t('pin.success'));
        setTimeout(() => {
          setPin('');
          resetValidation();
          setSuccessMessage(null);
          closePasswordModal();
        }, 500);
      } else {
        setErrorKey('pin.error.invalid');
        setPin('');
      }
    } catch (error) {
      setErrorKey('pin.error.invalid');
      setPin('');
    }
  }, [closePasswordModal, pin, resetValidation, setErrorKey, t, unlockAccount, validate]);

  const reset = useCallback(async () => {
    setPin('');
    resetValidation();
    setSuccessMessage(null);
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
      successMessage={successMessage}
      isAccountSetUpModalOpen={isAccessAccountModalOpen || isCreateAccountModalOpen}
      isLoading={false}
    />
  );
}
