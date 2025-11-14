import { useContext } from 'react';

import { ModalContext, ZkAccountContext } from 'contexts';
import AccountSetUpModal from 'components/AccountSetUpModal';

export default () => {
  const {
    isAccessAccountModalOpen,
    isCreateAccountModalOpen,
    closeAccessAccountModal,
    closeCreateAccountModal,
  } = useContext(ModalContext);
  const { saveZkAccountMnemonic } = useContext(ZkAccountContext);

  return (
    <AccountSetUpModal
      isOpen={isAccessAccountModalOpen || isCreateAccountModalOpen}
      mode={isAccessAccountModalOpen ? 'access' : isCreateAccountModalOpen ? 'create' : null}
      onClose={isAccessAccountModalOpen ? closeAccessAccountModal : closeCreateAccountModal}
      saveZkAccountMnemonic={saveZkAccountMnemonic}
    />
  );
}
