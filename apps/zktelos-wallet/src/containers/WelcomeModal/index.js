import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { Link2, ShieldCheck, ArrowDownToLine } from 'lucide-react';

import Modal from 'components/Modal';
import Button from 'components/Button';
import ThemeContext from 'contexts/ThemeContext';
import welcomeImage from 'assets/telos-wallet-logo.svg';
import welcomeImageDark from 'assets/telos-wallet-logo-dark.svg';

const TOTAL_STEPS = 3;

const WelcomeModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const { theme } = useContext(ThemeContext);

  const handleClose = () => {
    localStorage.setItem('welcomeSeen', 'true');
    onClose();
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else handleClose();
  };

  const back = () => setStep(s => s - 1);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} width={460}>
      <Container>

        <Dots>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <Dot key={i} $active={i === step} onClick={() => setStep(i)} />
          ))}
        </Dots>

        {step === 0 && (
          <>
            <Logo
              src={theme === 'dark' ? welcomeImageDark : welcomeImage}
              alt="zkTelos Wallet"
            />
            <StepTitle>Welcome to zkTelos Wallet</StepTitle>
            <StepBody>
              The first privacy wallet on Telos EVM. Your balance and
              transactions are visible only to you — shielded by
              zero-knowledge proofs.
            </StepBody>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle>How it works</StepTitle>
            <HowItWorksList>
              <HowItWorksItem>
                <IconWrap><Link2 size={18} /></IconWrap>
                <ItemText>
                  <ItemTitle>Connect your wallet</ItemTitle>
                  <ItemDesc>Link MetaMask or WalletConnect to fund your private account.</ItemDesc>
                </ItemText>
              </HowItWorksItem>
              <HowItWorksItem>
                <IconWrap><ShieldCheck size={18} /></IconWrap>
                <ItemText>
                  <ItemTitle>Create a private account</ItemTitle>
                  <ItemDesc>Generates a shielded address that only you control.</ItemDesc>
                </ItemText>
              </HowItWorksItem>
              <HowItWorksItem>
                <IconWrap><ArrowDownToLine size={18} /></IconWrap>
                <ItemText>
                  <ItemTitle>Deposit & shield tokens</ItemTitle>
                  <ItemDesc>Move tokens from your public wallet into your private account.</ItemDesc>
                </ItemText>
              </HowItWorksItem>
            </HowItWorksList>
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle>Your privacy guarantee</StepTitle>
            <StepBody>
              Every transaction is protected by zero-knowledge proofs —
              amounts and participants are invisible on the public blockchain.
            </StepBody>
            <StepBody>
              You can also receive tokens directly from other zkTelos users
              by sharing your private address, with no public wallet needed.
            </StepBody>
          </>
        )}

        <Actions>
          {step > 0 && (
            <BackButton onClick={back}>Back</BackButton>
          )}
          <Button onClick={next}>
            {step === TOTAL_STEPS - 1 ? 'Get Started' : 'Next'}
          </Button>
        </Actions>

        {step < TOTAL_STEPS - 1 && (
          <SkipLink onClick={handleClose}>Skip intro</SkipLink>
        )}

      </Container>
    </Modal>
  );
};

export default WelcomeModal;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  background: ${props => props.$active
    ? props.theme.button.primary.background.default
    : props.theme.color.darkGrey};
  transform: ${props => props.$active ? 'scale(1.2)' : 'scale(1)'};
`;

const Logo = styled.img`
  width: 180px;
  height: 80px;
  object-fit: contain;
  margin: 8px auto 4px;
`;

const StepTitle = styled.span`
  font-size: 20px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  text-align: center;
`;

const StepBody = styled.p`
  font-size: 15px;
  line-height: 22px;
  color: ${props => props.theme.text.color.secondary};
  text-align: center;
  margin: 0;
`;

const HowItWorksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 4px 0;
`;

const HowItWorksItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.theme.button.primary.background.default}22;
  color: ${props => props.theme.button.primary.background.default};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemTitle = styled.span`
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
`;

const ItemDesc = styled.span`
  font-size: 13px;
  line-height: 19px;
  color: ${props => props.theme.text.color.secondary};
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 8px;

  button {
    flex: 1;
  }
`;

const BackButton = styled.button`
  flex: 1;
  background: transparent;
  border: 1px solid ${props => props.theme.color.darkGrey};
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-family: inherit;
  color: ${props => props.theme.text.color.primary};
  cursor: pointer;
  font-weight: ${props => props.theme.text.weight.bold};
  &:hover {
    background: ${props => props.theme.color.darkGrey}44;
  }
`;

const SkipLink = styled.span`
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  cursor: pointer;
  text-decoration: underline;
  opacity: 0.7;
  &:hover { opacity: 1; }
`;
