
import { useEffect, useState } from 'react';

const useAutoReset = (timeout = 2_000) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        setActive(false);
      }, timeout);

      return () => {
        clearTimeout(timer);
      };
    }

    return undefined;
  }, [active, timeout]);

  return [active, setActive];
};

export default useAutoReset;