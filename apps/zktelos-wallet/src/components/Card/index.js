import React from 'react';
import styled from 'styled-components';

export default ({ title, note, children, style, titleStyle }) => (
  <Card style={style}>
    {title && <Title style={titleStyle}>{title}</Title>}
    {children}
    {note && <Note>{note}</Note>}
  </Card>
);

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  padding: 8px 6px 6px;
  width: 480px;
  max-width: 100%;
  box-sizing: border-box;
  & > * {
    margin-bottom: 6px;
  }
  & > :last-child {
    margin-bottom: 0;
  }
`;

const Title = styled.span`
  color: ${props => props.theme.card.title.color};
  font-weight: ${props => props.theme.text.weight.bold};
  padding: 0 10px;
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
