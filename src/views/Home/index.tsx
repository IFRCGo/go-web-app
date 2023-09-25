import {
    useCallback,
    useState,
    useEffect,
    useRef,
} from 'react';
import {
    DrefIcon,
    AppealsIcon,
    FundingIcon,
    FundingCoverageIcon,
    CloseLineIcon,
    TargetedPopulationIcon,
} from '@ifrc-go/icons';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Page from '#components/Page';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import BlockLoading from '#components/BlockLoading';
import InfoPopup from '#components/InfoPopup';
import KeyFigure from '#components/KeyFigure';
import HighlightedOperations from '#components/domain/HighlightedOperations';
import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import AppealsTable from '#components/domain/AppealsTable';
import AppealsOverYearsChart from '#components/domain/AppealsOverYearsChart';
import useTranslation from '#hooks/useTranslation';
import { useRequest } from '#utils/restRequest';
import { getPercentage } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

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

    const infoBarElements = !pending && aggregatedAppealResponse && (
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
                    aggregatedAppealResponse?.amount_funded,
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
                    {infoBarElements}
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
                                // FIXME: use translations
                                title="Close"
                                variant="secondary"
                                ariaLabel="Close"
                            >
                                <CloseLineIcon />
                            </IconButton>
                        )}
                        headerDescriptionContainerClassName={styles.keyFigureList}
                        headerDescription={infoBarElements}
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
