import { useCallback, useState } from 'react';

export const PIN_LENGTH = 4;
const DIGITS_REGEX = /^[0-9]+$/;

const usePinValidation = () => {
  const [errorKey, setErrorKey] = useState(null);

  const validate = useCallback(({ pin }) => {
    if (!pin || pin.length !== PIN_LENGTH) {
      setErrorKey('pin.error.length');
      return false;
    }
    if (!DIGITS_REGEX.test(pin)) {
      setErrorKey('pin.error.digits');
      return false;
    }

    setErrorKey(null);
    return true;
  }, []);

  const resetValidation = useCallback(() => {
    setErrorKey(null);
  }, []);

  return {
    validate,
    errorKey,
    setErrorKey,
    resetValidation,
  };
};

export default usePinValidation;

