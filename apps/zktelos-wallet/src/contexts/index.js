import React from 'react';

import ZkAccountContext, { ZkAccountContextProvider } from 'contexts/ZkAccountContext';
import TokenBalanceContext, { TokenBalanceContextProvider } from 'contexts/TokenBalanceContext';
import TransactionModalContext, { TransactionModalContextProvider } from 'contexts/TransactionModalContext';
import ModalContext, { ModalContextProvider } from 'contexts/ModalContext';
import SupportIdContext, { SupportIdContextProvider } from 'contexts/SupportIdContext';
import IncreasedLimitsContext, { IncreasedLimitsContextProvider } from 'contexts/IncreasedLimitsContext';
import PoolContext, { PoolContextProvider } from 'contexts/PoolContext';
import LanguageContext, { LanguageContextProvider } from 'contexts/LanguageContext';
import WalletContext, { WalletContextProvider } from 'contexts/WalletContext';
import OnboardingTutorialContext, { OnboardingTutorialProvider } from 'contexts/OnboardingTutorialContext';
import TokenPriceLiQuestContext, { TokenPriceLiQuestProvider } from 'contexts/TokenPriceLiQuestContext';
import BalanceVisibilityContext, { BalanceVisibilityProvider } from 'contexts/BalanceVisibilityContext';

const ContextsProvider = ({ children }) => (
  <SupportIdContextProvider>
    <TransactionModalContextProvider>
      <ModalContextProvider>
        <PoolContextProvider>
          <WalletContextProvider>
            <TokenPriceLiQuestProvider>
              <BalanceVisibilityProvider>
                <TokenBalanceContextProvider>
                  <ZkAccountContextProvider>
                    <IncreasedLimitsContextProvider>
                      <LanguageContextProvider>
                        <OnboardingTutorialProvider>
                          {children}
                        </OnboardingTutorialProvider>
                      </LanguageContextProvider>
                    </IncreasedLimitsContextProvider>
                  </ZkAccountContextProvider>
                </TokenBalanceContextProvider>
              </BalanceVisibilityProvider>
            </TokenPriceLiQuestProvider>
          </WalletContextProvider>
        </PoolContextProvider>
      </ModalContextProvider>
    </TransactionModalContextProvider>
  </SupportIdContextProvider>
);

export default ContextsProvider;
export {
  ZkAccountContext, TokenBalanceContext, TransactionModalContext,
  ModalContext, SupportIdContext, IncreasedLimitsContext, PoolContext,
  LanguageContext, WalletContext, OnboardingTutorialContext,
  TokenPriceLiQuestContext, BalanceVisibilityContext,
};
