import { useContext, useCallback, useMemo } from 'react';
import { randomString } from '@togglecorp/fujs';

import AlertContext, { AlertType } from '#contexts/alert';
import { DURATION_DEFAULT_ALERT_DISMISS } from '#utils/constants';

interface AddAlertOption {
    name?: string;
    variant?: AlertType;
    duration?: number;
    description?: React.ReactNode;
    nonDismissable?: boolean;
    debugMessage?: string;
}

function useAlert() {
    const {
        addAlert,
        // removeAlert,
        // updateAlert,
    } = useContext(AlertContext);

    const show = useCallback((title: React.ReactNode, options?: AddAlertOption) => {
        const name = options?.name ?? randomString(16);
        addAlert({
            variant: options?.variant ?? 'info',
            duration: options?.duration ?? DURATION_DEFAULT_ALERT_DISMISS,
            name: options?.name ?? name,
            title,
            description: options?.description,
            nonDismissable: options?.nonDismissable ?? false,
            debugMessage: options?.debugMessage,
        });

        return name;
    }, [addAlert]);

    return useMemo(() => ({
        show,
    }), [show]);
}

export default useAlert;
