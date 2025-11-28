import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import PortfolioRow from './PortfolioRow';

const PortfolioTable = ({ rows, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Table>
      <colgroup>
        <Col style={{ width: '25%' }} />
        <Col style={{ width: '18%' }} />
        <Col style={{ width: '18%' }} />
        <Col style={{ width: '18%' }} />
        <Col style={{ width: '21%' }} />
      </colgroup>
      <thead>
        <HeaderRow>
          <AssetHeader scope="col">{t('portfolio.asset')}</AssetHeader>
          <PriceHeader scope="col">{t('portfolio.price')}</PriceHeader>
          <BalanceHeader scope="col">{t('portfolio.balance')}</BalanceHeader>
          <ValueHeader scope="col">{t('portfolio.value')}</ValueHeader>
          <ActionHeader scope="col"></ActionHeader>
        </HeaderRow>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <PortfolioRow
            key={row.key || index}
            asset={row.asset}
            icon={row.icon}
            balance={row.balance}
            price={row.price}
            tokenDecimals={row.tokenDecimals}
            isLoading={isLoading}
            actions={row.actions}
          />
        ))}
      </tbody>
    </Table>
  );
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Col = styled.col``;

const HeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.color.grey || '#E5E5E5'};
`;

const AssetHeader = styled.th`
  font-size: 12px;
  font-weight: ${props => props.theme.text.weight.bold};
  color: ${props => props.theme.text.color.primary};
  text-transform: uppercase;
  text-align: left;
  padding: 8px 8px 8px 0;
`;

const PriceHeader = styled(AssetHeader)`
  text-align: center;
`;

const BalanceHeader = styled(AssetHeader)`
  text-align: center;
`;

const ValueHeader = styled(AssetHeader)`
  text-align: right;
`;

const ActionHeader = styled(AssetHeader)`
  text-align: right;
`;

export default PortfolioTable;

