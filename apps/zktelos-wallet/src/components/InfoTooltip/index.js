import React from 'react';
import styled, { useTheme } from 'styled-components';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';

const InfoTooltip = ({ text, placement = 'top' }) => {
  const theme = useTheme();
  return (
    <Tooltip
      placement={placement}
      trigger={['hover', 'click']}
      overlayStyle={{ maxWidth: '260px', zIndex: 9999 }}
      overlayInnerStyle={{
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        lineHeight: '1.5',
        backgroundColor: theme.dropdown.background,
        color: theme.text.color.primary,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.color.darkGrey}`,
      }}
      overlay={<span>{text}</span>}
      showArrow={false}
    >
      <IconButton type="button" aria-label="More info">ⓘ</IconButton>
    </Tooltip>
  );
};

export default InfoTooltip;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0 0 0 4px;
  cursor: pointer;
  font-size: 13px;
  color: ${props => props.theme.text.color.secondary};
  opacity: 0.6;
  line-height: 1;
  vertical-align: middle;
  font-family: inherit;
  &:hover { opacity: 1; }
`;
