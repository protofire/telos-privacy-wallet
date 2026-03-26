import React from 'react';
import styled from 'styled-components';
import { useWindowDimensions } from 'hooks';
import InfoTooltip from 'components/InfoTooltip';

export default ({ title, icon, note, children, style, titleStyle, titleTooltip }) => {
  const { width } = useWindowDimensions();
  const isMobile = width <= 800;
  return (
    <Card style={style} $isMobile={isMobile}>
      {(title || icon) && (
        <Header>
          {icon && <IconWrapper>{icon}</IconWrapper>}
          {title && <Title style={titleStyle}>{title}</Title>}
          {titleTooltip && <InfoTooltip text={titleTooltip} />}
        </Header>
      )}
      {children}
      {note && <Note>{note}</Note>}
    </Card>
  );
};

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  padding: 16px;
  width: ${props => props.$isMobile ? 'fill-available' : '540px'};
  max-width: 100%;
  box-sizing: border-box;
  & > * {
    margin-bottom: 6px;
  }
  & > :last-child {
    margin-bottom: 0;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const IconWrapper = styled.div`
  margin-right: 8px;
  width: 24px;
  height: 24px;

  svg {
    stroke: ${props => props.theme.icon.color.default};
  }
`;

const Title = styled.span`
  color: ${props => props.theme.card.title.color};
  font-weight: ${props => props.theme.text.weight.bold};
`;

const Note = styled.span`
  font-size: 14px;
  line-height: 22px;
  color: ${props => props.theme.card.note.color};
  font-weight: ${props => props.theme.text.weight.normal};
  align-self: center;
  text-align: center;
  padding: 0 10px;
`;
