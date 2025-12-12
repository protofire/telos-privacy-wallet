import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';


import Tabs from 'components/Tabs';

import { ZkAccountContext } from 'contexts';

const tabs = [
  { name: 'Home', path: '/home', i18nKey: 'home.title', dataTour: 'home-overview' },
  { name: 'Deposit', path: '/deposit', i18nKey: 'deposit.title', dataTour: 'deposit-tab' },
  { name: 'Withdraw', path: '/withdraw', i18nKey: 'withdraw.title', dataTour: 'withdraw-tab' },
  { name: 'Transfer', path: '/transfer', i18nKey: 'transfer.title', dataTour: 'transfer-tab' },
  { name: 'History', path: '/history', i18nKey: 'history.title', badge: true, dataTour: 'history-tab' },
  { name: 'Settings', path: '/settings', i18nKey: 'common.settings', dataTour: 'settings-tab' },
]

export default () => {
  const { isPendingIncoming, pendingDirectDeposits } = useContext(ZkAccountContext);
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null);

  const handleTabClick = useCallback(index => {
    history.push(tabs[index].path + location.search);
  }, [history, location]);

  useEffect(() => {
    setActiveTab(tabs.findIndex(item => item.path === location.pathname));
  }, [location]);

  return (
    <>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        showBadge={isPendingIncoming || pendingDirectDeposits.length > 0}
      />
    </>
  );
};
