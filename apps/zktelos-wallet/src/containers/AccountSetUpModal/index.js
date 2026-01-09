import { useContext, useCallback } from 'react';

import { ModalContext, ZkAccountContext, TokenBalanceContext, PoolContext } from 'contexts';
import AccountSetUpModal from 'components/AccountSetUpModal';

export default () => {
  const {
    isAccessAccountModalOpen,
    isCreateAccountModalOpen,
    closeAccessAccountModal,
    closeCreateAccountModal,
  } = useContext(ModalContext);
  const { saveZkAccountMnemonic } = useContext(ZkAccountContext);
  const { updateBalance } = useContext(TokenBalanceContext);
  const { availablePools } = useContext(PoolContext);

  const handleSaveZkAccountMnemonic = useCallback((mnemonic, password, isNewAccount) => {
    saveZkAccountMnemonic(mnemonic, password, isNewAccount);
    availablePools.forEach(pool => updateBalance(pool.alias));
  }, [saveZkAccountMnemonic, updateBalance, availablePools]);

  const mode = isAccessAccountModalOpen ? 'access' : isCreateAccountModalOpen ? 'create' : null;

  return <AccountSetUpModal
    key={mode}
    isOpen={!!mode}
    mode={mode}
    onClose={isAccessAccountModalOpen ? closeAccessAccountModal : closeCreateAccountModal}
    saveZkAccountMnemonic={handleSaveZkAccountMnemonic}
  />
}
