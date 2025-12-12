import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import Tooltip from 'components/Tooltip';

import { CopyIcon, CheckIcon } from 'lucide-react';

import { shortAddress } from 'utils';

export default ({
  children,
  formatType = '0x',
  prefixIcon,
  onPrefixClick,
  $noBorder,
  $borderRadius,
  $background,
  $fontSize,
  $height,
  $padding,
  $maxWidth,
  ...rest
}) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const onCopy = useCallback((text, result) => {
    if (result) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, []);

  const handlePrefixClick = useCallback((e) => {
    e.stopPropagation();
    if (onPrefixClick) {
      onPrefixClick();
    }
  }, [onPrefixClick]);

  return (

    <PrivateAddressContainer
      $noBorder={$noBorder}
      $borderRadius={$borderRadius}
      $background={$background}
      $fontSize={$fontSize}
      $height={$height}
      $padding={$padding}
      $maxWidth={$maxWidth}
      {...rest}
    >
      {prefixIcon && (
        <PrefixIconWrapper onClick={handlePrefixClick} $clickable={!!onPrefixClick}>
          {prefixIcon}
        </PrefixIconWrapper>
      )}
      <Address>
        {formatType === '0x' ? shortAddress(children, 25) : children}
      </Address>
      <CopyToClipboard text={children} onCopy={onCopy}>
        <Tooltip content={t('common.copied')} placement="right" visible={isCopied}>
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </Tooltip>
      </CopyToClipboard>
    </PrivateAddressContainer>
  );
}



const PrefixIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  path {
    fill: ${props => props.theme.icon.color.default};
  }
  &:hover {
    path {
      fill: ${props => props.theme.icon.color.hover};
    }
  }
`;

const PrivateAddressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  border: ${props => props.$noBorder ? 'none' : `1px solid ${props.theme.input.border.color.default}`};
  border-radius: ${props => props.$borderRadius || '16px'};
  background: ${props => props.$background || props.theme.input.background.secondary};
  color: ${props => props.theme.text.color.primary};
  font-size: ${props => props.$fontSize || '16px'};
  font-weight: 400;
  height: ${props => props.$height || '60px'};
  box-sizing: border-box;
  padding: ${props => props.$padding || '0 24px'};
  outline: none;
  max-width: ${props => props.$maxWidth || '100%'};
  
  svg {
    cursor: pointer;
    width: 16px;
    height: 16px;
    color: ${props => props.theme.icon.color.default};

    &:hover {
      color: ${props => props.theme.icon.color.hover};
    }
  }
  
  &::placeholder {
    color: ${props => props.theme.text.color.secondary};
  }
`;

const Address = styled.span`
  flex: 1;
  max-width: 100%;
  padding-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
`;
