import { useContext } from 'react';

import IconsContext, { type IconsContextValue } from './context';

/**
 * Returns the current IconsContext value set by the nearest IconsProvider ancestor.
 * Used internally by every icon component to pick up provider defaults.
 */
function useIconsContext(): IconsContextValue {
    return useContext(IconsContext);
}

export default useIconsContext;
