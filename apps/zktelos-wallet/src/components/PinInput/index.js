import React, { useEffect, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';

const CELL_COUNT = 4;

const PinInput = ({
  value = '',
  onChange,
  autoFocus = false,
  disabled = false,
  error = false,
  success = false,
  helperText = null,
}) => {
  const inputsRef = useRef([]);

  const paddedValue = useMemo(() => (value || '').slice(0, CELL_COUNT), [value]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const updateValueAt = (index, digit) => {
    const next = paddedValue.split('');
    next[index] = digit;
    const cleaned = next.join('').replace(/\D/g, '').slice(0, CELL_COUNT);
    onChange?.(cleaned);
  };

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, '');
    if (!raw) {
      updateValueAt(index, '');
      return;
    }
    const digit = raw.slice(-1);
    updateValueAt(index, digit);
    const nextInput = inputsRef.current[index + 1];
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    const { key } = event;
    const current = paddedValue[index] || '';
    if (key === 'Backspace') {
      if (current) {
        updateValueAt(index, '');
      } else if (index > 0) {
        const prev = inputsRef.current[index - 1];
        updateValueAt(index - 1, '');
        prev?.focus();
      }
      event.preventDefault();
      return;
    }
    if (key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
      event.preventDefault();
    }
    if (key === 'ArrowRight' && index < CELL_COUNT - 1) {
      inputsRef.current[index + 1]?.focus();
      event.preventDefault();
    }
  };

  const handlePaste = event => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CELL_COUNT);
    if (pasted) {
      onChange?.(pasted);
      inputsRef.current[Math.min(pasted.length, CELL_COUNT) - 1]?.focus();
      event.preventDefault();
    }
  };

  return (
    <Wrapper>
      <Inputs>
        {Array.from({ length: CELL_COUNT }).map((_, index) => (
          <CellInput
            key={index}
            ref={el => { inputsRef.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={paddedValue[index] || ''}
            onChange={event => handleChange(index, event)}
            onKeyDown={event => handleKeyDown(index, event)}
            onPaste={handlePaste}
            disabled={disabled}
            $error={error}
            $success={success}
            autoFocus={autoFocus && index === 0}
          />
        ))}
      </Inputs>
      {helperText && (
        <Helper $error={error} $success={success}>
          {helperText}
        </Helper>
      )}
    </Wrapper>
  );
};

export default PinInput;

const stateStyles = {
  error: css`
    border-color: ${({ theme }) => theme.text.color.error};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.text.color.error}22;
  `,
  success: css`
    border-color: ${({ theme }) => theme.text.color.success};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.text.color.success}22;
  `,
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Inputs = styled.div`
  display: grid;
  grid-template-columns: repeat(${CELL_COUNT}, 72px);
  gap: 12px;
  justify-content: center;
  width: 100%;
`;

const CellInput = styled.input`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.text.color.muted || '#e0e0e0'};
  background: ${({ theme }) => theme.background?.primary || '#fff'};
  color: ${({ theme }) => theme.text.color.primary};
  font-size: 32px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.text.color.blue || theme.text.color.link || '#4d7cff'};
    box-shadow: 0 0 0 4px ${({ theme }) => (theme.text.color.blue || theme.text.color.link || '#4d7cff')}22;
  }

  ${({ $error }) => $error && stateStyles.error};
  ${({ $success }) => $success && stateStyles.success};
`;

const Helper = styled.span`
  margin-top: 12px;
  font-size: 14px;
  color: ${({ theme, $error, $success }) => {
    if ($error) return theme.text.color.error;
    if ($success) return theme.text.color.success;
    return theme.text.color.secondary;
  }};
  text-align: center;
`;

