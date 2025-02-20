import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import Sources from '../Sources';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    id: number;
    summaryType: 'sector' | 'component';
    summaryTitle: string;
    extractsCount: number;
    summaryContent: string | null | undefined;
}

function Summary(props: Props) {
    const {
        id,
        summaryType,
        summaryTitle,
        extractsCount,
        summaryContent,
    } = props;

    const strings = useTranslation(i18n);

    const [
        isExpanded,
        {
            toggle: toggleExpansion,
        },
    ] = useBooleanState(false);

    return (
        <Container
            className={styles.summary}
            headingContainerClassName={styles.heading}
            heading={summaryTitle}
            headingDescription={(extractsCount > 1) ? (
                resolveToString(
                    strings.summaryExtractsCount,
                    { count: extractsCount },
                )
            ) : (
                resolveToString(
                    strings.summaryExtractCount,
                    { count: extractsCount },
                )
            )}
            withInternalPadding
            childrenContainerClassName={styles.content}
            footerClassName={styles.footer}
            footerActions={(
                <Button
                    name={id}
                    variant="tertiary"
                    onClick={toggleExpansion}
                    actions={(isExpanded
                        ? <ArrowUpSmallFillIcon />
                        : <ArrowDownSmallFillIcon />
                    )}
                >
                    {isExpanded ? strings.closeSources : strings.seeSources}
                </Button>
            )}
        >
            {summaryContent}
            {isExpanded && (
                <Sources summaryId={id} summaryType={summaryType} />
            )}
        </Container>
    );
}

export default Summary;
