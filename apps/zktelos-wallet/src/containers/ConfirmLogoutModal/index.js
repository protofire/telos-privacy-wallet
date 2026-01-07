import { useContext, useCallback } from 'react';

import ConfirmLogoutModal from 'components/ConfirmLogoutModal';

import { ZkAccountContext, ModalContext, WalletContext } from 'contexts';

export default () => {
  const { isConfirmLogoutModalOpen, closeConfirmLogoutModal } = useContext(ModalContext);
  const { removeZkAccountMnemonic } = useContext(ZkAccountContext);
  const { disconnect } = useContext(WalletContext);

  const confirmLogout = useCallback(async () => {
    closeConfirmLogoutModal(false);
    await removeZkAccountMnemonic();
    await disconnect();
  }, [closeConfirmLogoutModal, removeZkAccountMnemonic, disconnect]);

  return (
    <ConfirmLogoutModal
      isOpen={isConfirmLogoutModalOpen}
      onClose={closeConfirmLogoutModal}
      onConfirm={confirmLogout}
    />
  );
}
