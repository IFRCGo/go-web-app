import {
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    AlertContext,
    type AlertType,
} from '@ifrc-go/ui/contexts';
import { DURATION_DEFAULT_ALERT_DISMISS } from '@ifrc-go/ui/utils';
import { randomString } from '@togglecorp/fujs';

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
