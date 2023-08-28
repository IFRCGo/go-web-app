import { useCallback, useContext, useMemo } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import Container from '#components/Container';
import Link from '#components/Link';
import Grid from '#components/Grid';
import useTranslation from '#hooks/useTranslation';
import RouteContext from '#contexts/route';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';
import useUserMe from '#hooks/domain/useUserMe';

import OperationCard from './OperationCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

type EventQueryParams = GoApiUrlQuery<'/api/v2/event/'>;
type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

const keySelector = (event: EventListItem) => event.id;

type BaseProps = {
    className?: string;
}

type RegionProps = {
    variant: 'region';
    regionId: number;
}

type GlobalProps = {
    variant: 'global';
}

type Props = BaseProps & (RegionProps | GlobalProps);

function HighlightedOperations(props: Props) {
    const {
        className,
        variant,
    } = props;

    const strings = useTranslation(i18n);
    const { allEmergencies: allEmergenciesRoute } = useContext(RouteContext);

    // eslint-disable-next-line react/destructuring-assignment
    const regionId = variant === 'region' ? props.regionId : undefined;

    const query = useMemo<EventQueryParams>(
        () => {
            if (variant === 'global') {
                return { is_featured: true };
            }

            return {
                is_featured_region: true,
                regions__in: regionId,
            };
        },
        [variant, regionId],
    );

    const {
        error: featuredEmergencyResponseError,
        pending: featuredEmergencyPending,
        response: featuredEmergencyResponse,
    } = useRequest({
        url: '/api/v2/event/',
        query,
    });

    const meResponse = useUserMe();

    const subscriptionMap = listToMap(
        meResponse?.subscription?.filter(
            (sub) => isDefined(sub.event),
        ) ?? [],
        (sub) => sub.event ?? 'unknown',
        () => true,
    );

    const rendererParams = useCallback(
        (_: number, emergency: EventListItem) => ({
            data: emergency,
            subscriptionMap,
        }),
        [subscriptionMap],
    );

    const featuredEmergencies = featuredEmergencyResponse?.results;

    return (
        <Container
            className={_cs(styles.highlightedOperations, className)}
            withHeaderBorder
            heading={strings.highlightedOperationsTitle}
            actions={(
                <Link
                    to={{
                        pathname: allEmergenciesRoute.absolutePath,
                        search: variant === 'region' ? `region=${regionId}` : undefined,
                    }}
                    withForwardIcon
                    withUnderline
                >
                    {variant === 'region'
                        ? strings.highlightedOperationsViewAllInRegion
                        : strings.highlightedOperationsViewAll}
                </Link>
            )}
        >
            <Grid
                data={featuredEmergencies}
                pending={featuredEmergencyPending}
                errored={isDefined(featuredEmergencyResponseError)}
                filtered={false}
                keySelector={keySelector}
                renderer={OperationCard}
                rendererParams={rendererParams}
                numPreferredColumns={3}
            />
        </Container>
    );
}

export default HighlightedOperations;
