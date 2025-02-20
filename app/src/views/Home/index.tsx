import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    AppealsIcon,
    CloseLineIcon,
    DrefIcon,
    FundingCoverageIcon,
    FundingIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    BlockLoading,
    Container,
    IconButton,
    InfoPopup,
    KeyFigure,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { getPercentage } from '@ifrc-go/ui/utils';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import AppealsTable from '#components/domain/AppealsTable';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import Page from '#components/Page';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        pending: aggregatedAppealPending,
        response: aggregatedAppealResponse,
    } = useRequest({
        url: '/api/v2/appeal/aggregated',
    });

    const pending = aggregatedAppealPending;

    const [
        presentationMode,
        setFullScreenMode,
    ] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleFullScreenChange = useCallback(() => {
        setFullScreenMode(isDefined(document.fullscreenElement));
    }, [setFullScreenMode]);

    const handleFullScreenToggleClick = useCallback(() => {
        if (isNotDefined(containerRef.current)) {
            return;
        }
        const { current: viewerContainer } = containerRef;
        if (!presentationMode && isDefined(viewerContainer?.requestFullscreen)) {
            viewerContainer?.requestFullscreen();
        } else if (presentationMode && isDefined(document.exitFullscreen)) {
            document.exitFullscreen();
        }
    }, [presentationMode]);

    useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return (() => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        });
    }, [handleFullScreenChange]);

    const keyFigures = !pending && aggregatedAppealResponse && (
        <>
            <KeyFigure
                icon={<DrefIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.active_drefs}
                info={(
                    <InfoPopup
                        title={strings.keyFiguresDrefTitle}
                        description={strings.keyFiguresDrefDescription}
                    />
                )}
                label={strings.homeKeyFiguresActiveDrefs}
            />
            <KeyFigure
                icon={<AppealsIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.active_appeals}
                info={(
                    <InfoPopup
                        title={strings.keyFiguresActiveAppealsTitle}
                        description={strings.keyFigureActiveAppealDescription}
                    />
                )}
                label={strings.homeKeyFiguresActiveAppeals}
            />
            <KeyFigure
                icon={<FundingIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.amount_requested_dref_included}
                compactValue
                label={strings.homeKeyFiguresBudget}
            />
            <KeyFigure
                icon={<FundingCoverageIcon />}
                className={styles.keyFigure}
                value={getPercentage(
                    aggregatedAppealResponse?.amount_funded_dref_included,
                    aggregatedAppealResponse?.amount_requested_dref_included,
                )}
                suffix="%"
                compactValue
                label={strings.homeKeyFiguresAppealsFunding}
            />
            <KeyFigure
                icon={<TargetedPopulationIcon />}
                className={styles.keyFigure}
                value={aggregatedAppealResponse.target_population}
                compactValue
                label={strings.homeKeyFiguresTargetPop}
            />
        </>
    );

    return (
        <Page
            title={strings.homeTitle}
            className={styles.home}
            heading={strings.homeHeading}
            description={strings.homeDescription}
            mainSectionClassName={styles.content}
            infoContainerClassName={styles.keyFigureList}
            info={(
                <>
                    {pending && <BlockLoading />}
                    {!pending && keyFigures}
                </>
            )}
        >
            <HighlightedOperations variant="global" />
            <ActiveOperationMap
                variant="global"
                onPresentationModeButtonClick={handleFullScreenToggleClick}
                bbox={undefined}
            />
            <AppealsTable variant="global" />
            <AppealsOverYearsChart />
            <div
                className={_cs(presentationMode && styles.presentationMode)}
                ref={containerRef}
            >
                {presentationMode && (
                    <Container
                        heading={strings.fullScreenHeading}
                        actions={(
                            <IconButton
                                name={undefined}
                                onClick={handleFullScreenToggleClick}
                                title={strings.homeIconButtonLabel}
                                variant="secondary"
                                ariaLabel={strings.homeIconButtonLabel}
                            >
                                <CloseLineIcon />
                            </IconButton>
                        )}
                        headerDescriptionContainerClassName={styles.keyFigureList}
                        headerDescription={keyFigures}
                    >
                        <ActiveOperationMap
                            variant="global"
                            bbox={undefined}
                            presentationMode
                        />
                    </Container>
                )}
            </div>
        </Page>
    );
}

Component.displayName = 'Home';
