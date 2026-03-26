import { useContext, useCallback, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useWidgetEvents, WidgetEvent } from '@lifi/widget';
import { useTranslation } from 'react-i18next';
import { useSwitchChain } from 'wagmi';
import { EyeOffIcon } from 'lucide-react';

import { ModalContext, PoolContext } from 'contexts';
import LiFiWidget from 'containers/LiFiWidget';
import Modal from 'components/Modal';
import Button from 'components/Button';

export default () => {
  const { t } = useTranslation();
  const { isSwapModalOpen, closeSwapModal } = useContext(ModalContext);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const widgetRef = useRef(null);
  const { currentPool } = useContext(PoolContext);
  const { switchChain } = useSwitchChain();
  const widgetEvents = useWidgetEvents();
  const [isInProgress, setIsInProgress] = useState(false);
  const [isConfirmationShown, setIsConfirmationShown] = useState(false);

  // After LiFi switches the wallet to a source chain (e.g. Ethereum) for bridging,
  // switch back to the pool's chain (Telos) when the bridge completes, fails, or is closed.
  const switchBackToPool = useCallback(() => {
    switchChain({ chainId: currentPool.chainId }, { onError: () => {} });
  }, [switchChain, currentPool.chainId]);

  const tryToClose = useCallback(() => {
    if (isInProgress) {
      setIsConfirmationShown(true);
      return;
    }
    switchBackToPool();
    closeSwapModal();
  }, [isInProgress, closeSwapModal, switchBackToPool]);

  const confirm = useCallback(() => {
    switchBackToPool();
    closeSwapModal();
    setIsConfirmationShown(false);
  }, [closeSwapModal, switchBackToPool]);

  const reject = () => setIsConfirmationShown(false);

  useEffect(() => {
    widgetEvents.on(WidgetEvent.RouteExecutionStarted, () => setIsInProgress(true));
    widgetEvents.on(WidgetEvent.RouteExecutionCompleted, () => {
      setIsInProgress(false);
      switchBackToPool();
    });
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, () => {
      setIsInProgress(false);
      switchBackToPool();
    });
    return () => widgetEvents.all.clear();
  }, [widgetEvents, switchBackToPool]);

  // The LiFi SDK leaks unhandled promise rejections when the user cancels a
  // MetaMask prompt (EIP-1193 code 4001). The widget already shows the error
  // in its own UI via RouteExecutionFailed, so we suppress the rejection here
  // to prevent the CRA dev overlay (and any production error boundaries) from
  // treating it as a crash.
  useEffect(() => {
    if (isSwapModalOpen) setNoticeDismissed(false);
  }, [isSwapModalOpen]);

  useEffect(() => {
    if (!isSwapModalOpen) return;

    const handleUnhandledRejection = (event) => {
      const err = event.reason;
      if (
        err?.code === 4001 ||
        err?.cause?.code === 4001 ||
        err?.message?.toLowerCase().includes('user rejected')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [isSwapModalOpen]);

  return (
    <Modal
      isOpen={isSwapModalOpen}
      onClose={isConfirmationShown ? null : () => tryToClose()}
      width={480}
      style={{ padding: '26px 0 0' }}
      title={isConfirmationShown ? t('swapModal.title') : null}
    >
      {isInProgress && isConfirmationShown && (
        <ConfirmationContainer>
          <Text>{t('swapModal.description')}</Text>
          <Row>
            <NoButton onClick={reject}>{t('buttonText.no')}</NoButton>
            <YesButton onClick={confirm}>{t('buttonText.yes')}</YesButton>
          </Row>
        </ConfirmationContainer>
      )}
      <WidgetContainer $hidden={isConfirmationShown} ref={widgetRef}>
        {!noticeDismissed && (
          <NoticeWrapper>
            <PublicNotice>
              <NoticeBody>
                <EyeOffIcon size={14} style={{flexShrink: 0, marginTop: 2}} />
                <NoticeText>{t('lifi.publicNotice')}</NoticeText>
              </NoticeBody>
              <AcknowledgeButton onClick={() => setNoticeDismissed(true)}>
                {t('lifi.publicNoticeAck')}
              </AcknowledgeButton>
            </PublicNotice>
          </NoticeWrapper>
        )}
        <LiFiWidget />
      </WidgetContainer>
    </Modal>
  );
}

const WidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  visibility: ${props => props.$hidden ? 'hidden' : 'visible' };
  height: ${props => props.$hidden ? '0px' : 'auto' };
`;

const NoticeWrapper = styled.div`
  padding: 8px 24px 4px;
  width: 100%;
  box-sizing: border-box;
`;

const PublicNotice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${props => props.theme.networkLabel.background};
  border: 1px solid ${props => props.theme.color.darkGrey};
`;

const NoticeBody = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: ${props => props.theme.icon.color.default};
`;

const NoticeText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  line-height: 1.5;
`;

const AcknowledgeButton = styled.button`
  align-self: flex-end;
  background: none;
  border: 1px solid ${props => props.theme.color.darkGrey};
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  cursor: pointer;
  font-family: inherit;
  &:hover {
    background: ${props => props.theme.color.darkGrey}44;
  }
`;

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px 30px;
  width: 100%;
  box-sizing: border-box;
  margin-top: -10px;
`;

const Text = styled.span`
  font-size: 16px;
  color: ${props => props.theme.text.color.secondary};
  text-align: center;
  line-height: 24px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  margin-top: 30px;
`;

const YesButton = styled(Button)`
  flex: 1;
  height: 48px;
  font-size: 16px;
`;

const NoButton = styled(YesButton)`
  background: transparent;
  border: 1px solid ${props => props.theme.button.primary.background.default};
  color: ${props => props.theme.button.primary.background.default};
  margin-right: 10px;
`;
