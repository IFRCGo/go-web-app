import {
    useEffect,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    factories,
    type IEmbedConfiguration,
    models,
    service,
} from 'powerbi-client';

import styles from './styles.module.css';

type PowerBiEmbedProps = {
    embedUrl: string;
    accessToken: string;
    reportId?: string;
    className?: string;
};

function PowerBiEmbed(props: PowerBiEmbedProps) {
    const {
        embedUrl,
        accessToken,
        reportId,
        className,
    } = props;

    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) {
            return undefined;
        }
        if (!embedUrl || !accessToken) {
            // Do not attempt to embed without required fields
            return undefined;
        }

        const powerBiService = new service.Service(
            factories.hpmFactory,
            factories.wpmpFactory,
            factories.routerFactory,
        );

        const config: IEmbedConfiguration = {
            type: 'report',
            id: reportId,
            embedUrl,
            accessToken,
            tokenType: models.TokenType.Embed,
            settings: {
                panes: {
                    filters: { visible: false },
                },
                layoutType: models.LayoutType.Custom,
                customLayout: {
                    displayOption: models.DisplayOption.FitToWidth,
                },
                // Enable/disable parts of the UI as needed
                navContentPaneEnabled: true,
            },
        };

        // Embed the report
        powerBiService.embed(element, config);

        // Cleanup on unmount
        return () => {
            try {
                powerBiService.reset(element as HTMLElement);
            } catch {
                // ignore
            }
        };
    }, [embedUrl, accessToken, reportId]);

    return (
        <div
            className={_cs(styles.sparkEmbed, className)}
            ref={containerRef}
        />
    );
}

export default PowerBiEmbed;
