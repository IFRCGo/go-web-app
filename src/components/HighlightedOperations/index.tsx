import { useCallback, useContext, useMemo } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import Container from '#components/Container';
import Link from '#components/Link';
import List from '#components/List';
import useTranslation from '#hooks/useTranslation';
import UserContext from '#contexts/user';
import RouteContext from '#contexts/route';
import { useRequest } from '#utils/restRequest';
import { paths } from '#generated/types';

import OperationCard from './OperationCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetEvent = paths['/api/v2/event/']['get'];
type EventQueryParams = GetEvent['parameters']['query'];
type EventResponse = GetEvent['responses']['200']['content']['application/json'];
type EventListItem = NonNullable<EventResponse['results']>[number];

type UserResponse = paths['/api/v2/user/me/']['get']['responses']['200']['content']['application/json'];

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
    const { userAuth: userDetails } = useContext(UserContext);
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
    } = useRequest<EventResponse>({
        url: 'api/v2/event/',
        query,
    });

    const {
        pending: mePending,
        response: meResponse,
        retrigger: retriggerUserDetails,
    } = useRequest<UserResponse>({
        skip: !userDetails,
        url: 'api/v2/user/me/',
    });

    const subscriptionMap = listToMap(
        meResponse?.subscription?.filter(
            (sub) => isDefined(sub.event),
        ) ?? [],
        (sub) => sub.event ?? 'unknown',
        () => true,
    );

    const rendererParams = useCallback(
        (_: EventListItem['id'], emergency: EventListItem) => ({
            data: emergency,
            className: styles.operation,
            subscriptionMap,
            pending: mePending,
            retriggerSubscription: retriggerUserDetails,
        }),
        [mePending, subscriptionMap, retriggerUserDetails],
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
            childrenContainerClassName={styles.emergencyList}
        >
            <List
                data={featuredEmergencies}
                pending={featuredEmergencyPending}
                errored={!!featuredEmergencyResponseError}
                filtered={false}
                keySelector={keySelector}
                renderer={OperationCard}
                rendererParams={rendererParams}
            />
        </Container>
    );
}

export default HighlightedOperations;
