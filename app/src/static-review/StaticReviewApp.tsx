import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    createHashRouter,
    Navigate,
    RouterProvider,
} from 'react-router-dom';
import { AlertContainer } from '@ifrc-go/ui';
import {
    AlertContext,
    type AlertContextProps,
    type AlertParams,
    type Language,
    LanguageContext,
    type LanguageContextProps,
    type LanguageNamespaceStatus,
} from '@ifrc-go/ui/contexts';
import { isDefined } from '@togglecorp/fujs';

import PERPerformanceDashboard from '#views/PERDashboard/PERPerformanceDashboard';
import PERSummaryDashboard from '#views/PERDashboard/PERSummaryDashboard';

import StaticPreparednessPage from './StaticPreparednessPage';

const router = createHashRouter([
    {
        path: '/',
        element: <StaticPreparednessPage />,
        children: [
            {
                index: true,
                element: <Navigate to="/preparedness/global-summary" replace />,
            },
            {
                path: 'preparedness/global-summary',
                element: <PERSummaryDashboard />,
            },
            {
                path: 'preparedness/global-performance',
                element: <PERPerformanceDashboard />,
            },
        ],
    },
]);

function StaticReviewApp() {
    const [alerts, setAlerts] = useState<AlertParams[]>([]);
    const [strings, setStrings] = useState<LanguageContextProps['strings']>({});
    const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
    const [languageNamespaceStatus, setLanguageNamespaceStatus] = useState<
        Record<string, LanguageNamespaceStatus>
    >({});

    const addAlert = useCallback((alert: AlertParams) => {
        setAlerts((previousAlerts) => [
            ...previousAlerts.filter((item) => item.name !== alert.name),
            alert,
        ]);
    }, []);

    const removeAlert = useCallback((name: string) => {
        setAlerts((previousAlerts) => previousAlerts.filter((alert) => alert.name !== name));
    }, []);

    const updateAlert = useCallback((name: string, params: Omit<AlertParams, 'name'>) => {
        setAlerts((previousAlerts) => previousAlerts.map((alert) => (
            alert.name === name ? { ...alert, ...params } : alert
        )));
    }, []);

    const alertContextValue = useMemo<AlertContextProps>(() => ({
        alerts,
        addAlert,
        updateAlert,
        removeAlert,
    }), [addAlert, alerts, removeAlert, updateAlert]);

    const registerLanguageNamespace = useCallback(
        (namespace: string, fallbackStrings: Record<string, string>) => {
            setStrings((previousStrings) => ({
                ...previousStrings,
                [namespace]: {
                    ...fallbackStrings,
                    ...(previousStrings[namespace] ?? {}),
                },
            }));
            setLanguageNamespaceStatus((previousStatus) => {
                if (isDefined(previousStatus[namespace])) {
                    return previousStatus;
                }

                return {
                    ...previousStatus,
                    [namespace]: 'fetched',
                };
            });
        },
        [],
    );

    const languageContextValue = useMemo<LanguageContextProps>(
        () => ({
            languageNamespaceStatus,
            setLanguageNamespaceStatus,
            currentLanguage,
            setCurrentLanguage,
            strings,
            setStrings,
            registerNamespace: registerLanguageNamespace,
        }),
        [
            currentLanguage,
            languageNamespaceStatus,
            registerLanguageNamespace,
            strings,
        ],
    );

    return (
        <AlertContext.Provider value={alertContextValue}>
            <LanguageContext.Provider value={languageContextValue}>
                <RouterProvider router={router} />
                <AlertContainer />
            </LanguageContext.Provider>
        </AlertContext.Provider>
    );
}

export default StaticReviewApp;
