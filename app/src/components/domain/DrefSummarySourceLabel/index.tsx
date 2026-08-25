import { Description } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import {
    DREF_SUMMARY_SOURCE_FINAL_REPORT,
    DREF_SUMMARY_SOURCE_OPERATIONAL_UPDATE,
    type DrefSummarySource,
} from '#utils/domain/emergency';

import i18n from './i18n.json';

interface Props {
    className?: string;
    // regenerated from the latest approved revision, so the caption must name
    // that revision rather than always the application
    source: DrefSummarySource | undefined;
    // localised name of the field the summary was built from
    section: string;
}

function DrefSummarySourceLabel(props: Props) {
    const {
        className,
        source,
        section,
    } = props;

    const strings = useTranslation(i18n);

    if (isNotDefined(source)) {
        return null;
    }

    let sourceName = strings.sourceApplication;
    if (source === DREF_SUMMARY_SOURCE_OPERATIONAL_UPDATE) {
        sourceName = strings.sourceOperationalUpdate;
    } else if (source === DREF_SUMMARY_SOURCE_FINAL_REPORT) {
        sourceName = strings.sourceFinalReport;
    }

    return (
        <Description
            className={className}
            textSize="sm"
            withLightText
        >
            {resolveToString(strings.template, { source: sourceName, section })}
        </Description>
    );
}

export default DrefSummarySourceLabel;
