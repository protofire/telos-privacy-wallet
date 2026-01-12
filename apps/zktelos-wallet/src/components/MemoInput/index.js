import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';

import Tooltip from 'components/Tooltip';

import { InfoIcon as InfoIconDefault } from 'lucide-react';

import useAutosizeTextArea from 'components/MultilineInput/hooks/useAutosizeTextArea';

const MAX_LENGTH = 200;

export default ({ value, onChange, hint, placeholder }) => {
  const textAreaRef = useRef(null);
  useAutosizeTextArea(textAreaRef.current, value);

  const handleChange = useCallback(e => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_LENGTH) {
      onChange(newValue);
    }
  }, [onChange]);

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const characterCount = value ? value.length : 0;
  const isNearLimit = characterCount > MAX_LENGTH * 0.8;

  return (
    <Container hint={hint} onClick={() => textAreaRef.current?.focus()}>
      <TextArea
        ref={textAreaRef}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        spellCheck={false}
        rows={1}
        maxLength={MAX_LENGTH}
      />
      <RightSection>
        {hint && (
          <Tooltip content={hint} placement="right" delay={0} width={180}>
            <InfoIcon />
          </Tooltip>
        )}
        <CharacterCount isNearLimit={isNearLimit}>
          {characterCount}/{MAX_LENGTH}
        </CharacterCount>
      </RightSection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border: 1px solid ${props => props.theme.input.border.color.default};
  border-radius: 16px;
  background: ${props => props.theme.input.background.secondary};
  box-sizing: border-box;
  min-height: 60px;
  max-height: 60px;
  padding: 9px 24px;
  padding-right: ${props => props.hint ? '90px' : '70px'};
  outline: none;
  cursor: text;
  overflow: hidden;
  &:focus-within {
    border-color: ${props => props.theme.input.border.color[props.error ? 'error' : 'focus']};
  }
  @media only screen and (max-width: 500px) {
    max-height: 80px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  color: ${props => props.theme.text.color.primary};
  font-size: 16px;
  background: transparent;
  line-height: 20px;
  font-weight: 400;
  max-height: 40px;
  resize: none;
  padding: 0;
  &::placeholder {
    color: ${props => props.theme.text.color.secondary};
    opacity: 0.6;
  }
  @media only screen and (max-width: 500px) {
    max-height: 60px;
  }
`;

const RightSection = styled.div`
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoIcon = styled(InfoIconDefault)`
  cursor: default;
  color: ${props => props.theme.icon.color.default};

  &:hover {
    color: ${props => props.theme.icon.color.hover};
  }
  width: 14px;
  height: 14px;
`;

const CharacterCount = styled.span`
  font-size: 12px;
  color: ${props => props.isNearLimit
    ? props.theme.text.color.error || props.theme.text.color.secondary
    : props.theme.text.color.secondary};
  font-weight: 400;
  white-space: nowrap;
`;
