import {
    Fragment,
    useMemo,
} from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';

import Link from '#components/Link';

import i18n from './i18n.json';

function CountryRiskSourcesOutput() {
    const strings = useTranslation(i18n);

    const riskByMonthSources = useMemo(
        () => [
            {
                key: 'inform',
                link: 'https://drmkc.jrc.ec.europa.eu/inform-index/INFORM-Risk',
                label: strings.inform,
                description: strings.sourceINFORM,
            },
            {
                key: 'undrr',
                link: 'https://www.undrr.org/',
                label: strings.undrr,
                description: strings.sourceUNDRR,
            },
            {
                key: 'idmc',
                link: 'https://www.internal-displacement.org/',
                label: strings.idmc,
                description: strings.sourceIDMC,
            },
            {
                key: 'ipc',
                link: 'https://www.ipcinfo.org/',
                label: strings.ipc,
                description: strings.sourceIPC,
            },
        ],
        [strings],
    );

    return (
        <TextOutput
            label={strings.source}
            value={
                riskByMonthSources.map((source, i) => (
                    <Fragment key={source.key}>
                        {resolveToComponent(
                            source.description,
                            {
                                link: (
                                    <Link
                                        variant="tertiary"
                                        href={source.link}
                                        external
                                        withUnderline
                                    >
                                        {source.label}
                                    </Link>
                                ),
                            },
                        )}
                        {i < (riskByMonthSources.length - 1) && <br />}
                    </Fragment>
                ))
            }
        />
    );
}

export default CountryRiskSourcesOutput;
