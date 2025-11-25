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
import { ReactComponent as InfoIconDefault } from 'assets/info.svg';

import SingleTransfer from './SingleTransfer';
import MultiTransfer from './MultiTransfer';
import PoolSelector from 'components/PoolSelector';

import { ZkAccountContext, PoolContext } from 'contexts';
import config from 'config';

import { useLatestAction } from 'hooks';


export default () => {
  const { t } = useTranslation();
  const { isPending, switchToPool } = useContext(ZkAccountContext);
  const latestAction = useLatestAction(HistoryTransactionType.TransferOut);
  const [isMulti, setIsMulti] = useState(false);
  const multitransferRef = useRef(null);
  const fileInputRef = useRef(null);
  const { currentPool } = useContext(PoolContext);
  const poolOptions = useMemo(
    () => Object.entries(config.pools).map(([alias, pool]) => ({
      alias,
      tokenSymbol: pool.tokenSymbol,
      label: pool.tokenSymbol,
    })),
    [],
  );

  const handlePoolSelect = useCallback(alias => {
    if (alias === currentPool.alias) return;
    switchToPool(alias);
  }, [currentPool.alias, switchToPool]);

  return isPending ? <PendingAction /> : (
    <ContentContainer>
      <Card style={{ width: '550px' }}>
        <TitleRow>
          <Title>
            {t('transfer.title')}
            <SelectorInline>
              <PoolSelector
                options={poolOptions}
                selectedAlias={currentPool.alias}
                onSelect={handlePoolSelect}
              />
            </SelectorInline>
            {t('transfer.suffix')}
          </Title>
          <Row>
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
          </Row>
        </TitleRow>
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

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const TitleRow = styled(Row)`
  flex-wrap: wrap;
  margin-bottom: 12px;
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
  &:hover {
    & > path {
      fill: ${props => props.theme.color.purple};
    }
  }
`;

const CsvButtonContainer = styled(Row)`
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
  padding: 16px 12px;

  @media only screen and (max-width: 560px) {
    margin: 30px 0;
  }
`;
