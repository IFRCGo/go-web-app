import { useContext, useCallback, useMemo } from 'react';
import { randomString } from '@togglecorp/fujs';

import AlertContext, {
    AlertVariant,
    DEFAULT_ALERT_DISMISS_DURATION,
} from '#contexts/alert';

interface AddAlertOption {
    name?: string;
    variant?: AlertVariant;
    duration?: number;
    nonDismissable?: boolean;
    debugMessage?: string;
}

function useAlertContext() {
    const {
        addAlert,
        // removeAlert,
        // updateAlert,
    } = useContext(AlertContext);

    const show = useCallback((children: React.ReactNode, options?: AddAlertOption) => {
        const name = options?.name ?? randomString(16);
        addAlert({
            variant: options?.variant ?? 'info',
            duration: options?.duration ?? DEFAULT_ALERT_DISMISS_DURATION,
            name: options?.name ?? name,
            children,
            nonDismissable: options?.nonDismissable ?? false,
            debugMessage: options?.debugMessage,
        });

        return name;
    }, [addAlert]);

    return useMemo(() => ({
        show,
    }), [show]);
}

export default useAlertContext;
