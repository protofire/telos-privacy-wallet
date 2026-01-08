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

  const mode = isAccessAccountModalOpen ? 'access' : isCreateAccountModalOpen ? 'create' : null;

  return <AccountSetUpModal
    key={mode}
    isOpen={!!mode}
    mode={mode}
    onClose={isAccessAccountModalOpen ? closeAccessAccountModal : closeCreateAccountModal}
    saveZkAccountMnemonic={saveZkAccountMnemonic}
  />
}
