import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    Grid,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import Link from '#components/Link';
import useUserMe from '#hooks/domain/useUserMe';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import OperationCard from './OperationCard';

import i18n from './i18n.json';

type EventQueryParams = GoApiUrlQuery<'/api/v2/event/'>;
type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

const keySelector = (event: EventListItem) => event.id;

type BaseProps = {
    className?: string;
}

type CountryProps = {
    variant: 'country';
    countryId: number;
}

type RegionProps = {
    variant: 'region';
    regionId: number;
}

type GlobalProps = {
    variant: 'global';
}

type Props = BaseProps & (CountryProps | RegionProps | GlobalProps);

function HighlightedOperations(props: Props) {
    const {
        className,
        variant,
    } = props;

    const strings = useTranslation(i18n);

    // eslint-disable-next-line react/destructuring-assignment
    const regionId = variant === 'region' ? props.regionId : undefined;

    // eslint-disable-next-line react/destructuring-assignment
    const countryId = variant === 'country' ? props.countryId : undefined;

    const query = useMemo<EventQueryParams>(
        () => {
            if (variant === 'global') {
                return { is_featured: true };
            }

            if (variant === 'country') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);

                return {
                    countries__in: countryId,
                    disaster_start_date__gte: thirtyDaysAgo.toISOString(),
                    ordering: '-disaster_start_date',
                };
            }

            return {
                is_featured_region: true,
                regions__in: regionId,
            };
        },
        [variant, regionId, countryId],
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

    // FIXME: the subscription information should be sent from the server on
    // the emergency
    const subscriptionMap = listToMap(
        meResponse?.subscription?.filter(
            (sub) => isDefined(sub.event),
        ) ?? [],
        (sub) => sub.event ?? 'unknown',
        () => true,
    );

    const rendererParams = useCallback(
        (_: number, emergency: EventListItem) => {
            const isSubscribed = subscriptionMap[emergency.id] ?? false;
            return {
                data: emergency,
                isSubscribed,
            };
        },
        [subscriptionMap],
    );

    const featuredEmergencies = featuredEmergencyResponse?.results;

    const urlSearch = useMemo(
        () => {
            if (variant === 'country') {
                return `country=${countryId}`;
            }

            if (variant === 'region') {
                return `region=${regionId}`;
            }

            return undefined;
        },
        [regionId, countryId, variant],
    );

    const viewAllLabel = useMemo(
        () => {
            if (variant === 'country') {
                return strings.highlightedOperationsViewAllInCountry;
            }

            if (variant === 'region') {
                return strings.highlightedOperationsViewAllInRegion;
            }

            return strings.highlightedOperationsViewAll;
        },
        [variant, strings],
    );

    return (
        <Container
            className={className}
            withHeaderBorder
            heading={variant === 'country' ? strings.highlightedOperationsCountryTitle : strings.highlightedOperationsTitle}
            actions={(
                <Link
                    to="allEmergencies"
                    urlSearch={urlSearch}
                    withLinkIcon
                    withUnderline
                >
                    {viewAllLabel}
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
