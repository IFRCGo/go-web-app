import React, { useState } from 'react';

import {
  getHashFromBrowser,
  setHashToBrowser,
} from '#utils/common';

function useHash(value?: string, use?: boolean) {
  const [initialValue] = useState<string | undefined>(value);
  const [hash, setHash] = useState(getHashFromBrowser());

  React.useEffect(() => {
    if (use) {
      setHashToBrowser(initialValue);
      console.info('setting hash', initialValue);
    }
  }, [initialValue, use]);

  const handleHashChange = React.useCallback(() => {
    setHash(getHashFromBrowser());
  }, [setHash]);

  React.useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);

  return hash;
}

export default useHash;