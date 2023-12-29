import '@ifrc-go/ui/index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    createRoutesFromChildren,
    matchRoutes,
    useLocation,
    useNavigationType,
} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    api,
    appCommitHash,
    appTitle,
    appVersion,
    environment,
    sentryAppDsn,
    sentryReplaysOnErrorSampleRate,
    sentryReplaysSessionSampleRate,
    sentryTracesSampleRate,
} from '#config';

import App from './App/index.tsx';

if (isDefined(sentryAppDsn)) {
    Sentry.init({
        dsn: sentryAppDsn,
        release: `${appTitle}@${appVersion}+${appCommitHash}`,
        environment,
        integrations: [
            new Sentry.BrowserTracing({
                routingInstrumentation: Sentry.reactRouterV6Instrumentation(
                    React.useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                ),
            }),
            new Sentry.Replay(),
        ],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        tracesSampleRate: Number(sentryTracesSampleRate),

        // Set `tracePropagationTargets` to control for which URLs distributed
        // tracing should be enabled
        tracePropagationTargets: [
            api,
            // riskApi, TODO: let's add this once sentry is configured for risk server
        ],

        // Capture Replay for (sentryReplaysSessionSampleRate)% of all sessions,
        // plus for (sentryReplaysOnErrorSampleRate)% of sessions with an error
        replaysSessionSampleRate: Number(sentryReplaysSessionSampleRate),
        replaysOnErrorSampleRate: Number(sentryReplaysOnErrorSampleRate),
    });
}

const webappRootId = 'webapp-root';
const webappRootElement = document.getElementById(webappRootId);

if (isNotDefined(webappRootElement)) {
    // eslint-disable-next-line no-console
    console.error(`Could not find html element with id '${webappRootId}'`);
} else {
    ReactDOM.createRoot(webappRootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
