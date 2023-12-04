import {
    useCallback,
    useState,
    useEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { useParams, useOutletContext } from 'react-router-dom';
import getBbox from '@turf/bbox';
import {
    CloseLineIcon,
} from '@ifrc-go/icons';

import ActiveOperationMap from '#components/domain/ActiveOperationMap';
import Container from '#components/Container';
import IconButton from '#components/IconButton';
import useTranslation from '#hooks/useTranslation';
import { CountryOutletContext } from '#utils/outletContext';
import { useRequest } from '#utils/restRequest';
import type { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type District = NonNullable<GoApiResponse<'/api/v2/district/'>['results']>[number];
const emptyDistrictList: District[] = [];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const { countryId } = useParams<{ countryId: string }>();
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const bbox = countryResponse ? getBbox(countryResponse.bbox) : undefined;

    const [
        presentationMode,
        setFullScreenMode,
    ] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const {
        response: districtListResponse,
    } = useRequest({
        skip: isNotDefined(countryResponse?.id),
        url: '/api/v2/district/',
        query: {
            country: countryResponse?.id,
            limit: 9999,
        },
    });

    const districtList = districtListResponse?.results ?? emptyDistrictList;

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

    return (
        <div className={styles.countryOperations}>
            <ActiveOperationMap
                variant="country"
                onPresentationModeButtonClick={handleFullScreenToggleClick}
                countryId={Number(countryId)}
                districtList={districtList}
                bbox={bbox}
            />
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
                                title={strings.countryCloseButton}
                                variant="secondary"
                                ariaLabel={strings.countryCloseButton}
                            >
                                <CloseLineIcon />
                            </IconButton>
                        )}
                        headerDescriptionContainerClassName={styles.keyFigureList}
                    >
                        <ActiveOperationMap
                            variant="country"
                            onPresentationModeButtonClick={handleFullScreenToggleClick}
                            countryId={Number(countryId)}
                            districtList={districtList}
                            bbox={bbox}
                            presentationMode
                        />
                    </Container>
                )}
            </div>
        </div>
    );
}

Component.displayName = 'CountryOngoingActivitiesEmergencies';
