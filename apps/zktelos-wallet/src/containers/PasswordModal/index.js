import { useContext, useState, useCallback } from 'react';

import { ModalContext, ZkAccountContext } from 'contexts';
import PasswordModal from 'components/PasswordModal';


export default () => {
  const {
    isPasswordModalOpen,
    openAccessAccountModal,
    isAccessAccountModalOpen,
    isCreateAccountModalOpen,
    closePasswordModal
  } = useContext(ModalContext);
  const { unlockAccount, isLoadingZkAccount } = useContext(ZkAccountContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handlePasswordChange = useCallback(e => {
    setError(null);
    setPassword(e.target.value);
  }, []);

  const confirm = useCallback(async () => {
    try {
      const success = await unlockAccount(password);
      if (success) {
        setPassword('');
        closePasswordModal();
      }
    } catch (error) {
      setError(error);
    }
  }, [password, unlockAccount, closePasswordModal]);

  const reset = useCallback(async () => {
    setPassword('');
    openAccessAccountModal();
    closePasswordModal()
  }, [closePasswordModal, openAccessAccountModal]);

  return (
    <PasswordModal
      isOpen={isPasswordModalOpen}
      password={password}
      onPasswordChange={handlePasswordChange}
      confirm={confirm}
      reset={reset}
      error={error}
      isAccountSetUpModalOpen={isAccessAccountModalOpen || isCreateAccountModalOpen}
      isLoading={isLoadingZkAccount}
    />
  );
}
