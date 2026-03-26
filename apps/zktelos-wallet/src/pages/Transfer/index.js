import React, { useContext, useState, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { HistoryTransactionType } from 'zkbob-client-js';
import { useTranslation } from 'react-i18next';

import PendingAction from 'containers/PendingAction';

import Card from 'components/Card';
import LatestAction from 'components/LatestAction';
import Switch from 'components/Switch';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import { InfoIcon as InfoIconDefault } from 'lucide-react';

import SingleTransfer from './SingleTransfer';
import MultiTransfer from './MultiTransfer';
import PoolSelector from 'components/PoolSelector';

import { ZkAccountContext, PoolContext } from 'contexts';

import { useLatestAction } from 'hooks';


export default () => {
  const { t } = useTranslation();
  const { isPending, switchToPool } = useContext(ZkAccountContext);
  const latestAction = useLatestAction(HistoryTransactionType.TransferOut);
  const [isMulti, setIsMulti] = useState(false);
  const multitransferRef = useRef(null);
  const fileInputRef = useRef(null);
  const { currentPool, availablePools } = useContext(PoolContext);
  // Filter to active chain pools for consistency with the rest of the UI
  const poolOptions = useMemo(
    () => availablePools.map(pool => ({
      alias: pool.alias,
      tokenSymbol: pool.tokenSymbol,
      label: pool.tokenSymbol,
    })),
    [availablePools],
  );

  const handlePoolSelect = useCallback(alias => {
    if (alias === currentPool.alias) return;
    switchToPool(alias);
  }, [currentPool.alias, switchToPool]);

  return isPending ? <PendingAction /> : (
    <ContentContainer>
      <Card>
        <CardTitle>
          <TitleWithPoolSelector>
            {t('transfer.title')}
            <SelectorInline>
              <PoolSelector
                options={poolOptions}
                selectedAlias={currentPool.alias}
                onSelect={handlePoolSelect}
              />
            </SelectorInline>
          </TitleWithPoolSelector>
          <MultiTransferSwitch>
            <Text>{t('multitransfer.title')}</Text>
            <Switch
              checked={isMulti}
              onChange={setIsMulti}
              data-ga-id={`turn-${isMulti ? 'off' : 'on'}-multitransfer`}
            />
            <CsvButtonContainer disabled={!isMulti}>
              <Button
                type="link"
                onClick={() => fileInputRef?.current?.click()}
              >
                {t('multitransfer.uploadCSV')}
              </Button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={e => multitransferRef?.current?.handleFileUpload(e)}
                style={{ display: 'none' }}
              />
              <Tooltip content={t('multitransfer.uploadCSVHint')} placement="right" delay={0} width={180}>
                <InfoIcon />
              </Tooltip>
            </CsvButtonContainer>
          </MultiTransferSwitch>
        </CardTitle>
        <Note>{t('transfer.note')}</Note>
        {isMulti ? <MultiTransfer ref={multitransferRef} /> : (
          <SingleTransfer
            poolOptions={poolOptions}
            onPoolSelect={handlePoolSelect}
          />
        )}
      </Card>
      {latestAction && (
        <LatestAction
          type="transfer"
          shielded={true}
          data={latestAction}
          currentPool={currentPool}
        />
      )}
    </ContentContainer>
  );
};

const CardTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  @media only screen and (max-width: 560px) {
    align-items: flex-start;
    padding-left: 8px;
    flex-direction: column;
  }
`;

const TitleWithPoolSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.card.title.color};
`;

const MultiTransferSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const Title = styled.span`
  color: ${props => props.theme.card.title.color};
  font-size: 20px;
  font-weight: ${props => props.theme.text.weight.normal};
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SelectorInline = styled.span`
  display: inline-flex;
  align-items: center;
`;

const Text = styled(Title)`
  color: ${props => props.theme.card.title.color};
  font-size: 14px;
  font-weight: ${props => props.theme.text.weight.normal};
  margin-right: 6px;
`;

const Note = styled.p`
  font-size: 14px;
  color: ${props => props.theme.card.note.color};
  margin: 0 4px 16px;
`;

const InfoIcon = styled(InfoIconDefault)`
  margin-left: 4px;
  color: ${props => props.theme.icon.color.default};

  &:hover {
    color: ${props => props.theme.icon.color.hover};
  }
  width: 14px;
  height: 14px;
`;

const CsvButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  opacity: ${props => props.disabled ? 0.2 : 1};
  position: relative;
  ${props => props.disabled && `
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
  `}
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.color.white};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.color.black};

  @media only screen and (max-width: 560px) {
    margin: 15px 0;
  }
`;
