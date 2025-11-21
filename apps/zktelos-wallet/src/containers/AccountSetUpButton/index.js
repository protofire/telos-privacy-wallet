import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalContext, ZkAccountContext } from 'contexts';

import CreatePrivateAccountButton from 'components/CreatePrivateAccount';

export default () => {
  const { t } = useTranslation();
  const { openCreateAccountModal } = useContext(ModalContext);
  const { isLoadingZkAccount } = useContext(ZkAccountContext);
  return (
    <CreatePrivateAccountButton
      loading={isLoadingZkAccount}
      contrast
      disabled={isLoadingZkAccount}
      onClick={openCreateAccountModal}
      data-ga-id="zkaccount-get-started"
    >
      {isLoadingZkAccount ? t('buttonText.loading') : t('buttonText.getStarted')}
    </CreatePrivateAccountButton>
  );
}
