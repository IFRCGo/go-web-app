import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import { EntriesAsList } from '@togglecorp/toggle-form';
import { isDefined, listToGroupList } from '@togglecorp/fujs';

import MultiSelectInput from '#components/MultiSelectInput';
import Container from '#components/Container';
import CheckList from '#components/Checklist';
import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { numericIdSelector, stringNameSelector, stringValueSelector } from '#utils/selectors';
import { components } from '#generated/types';
import Checkbox from '#components/Checkbox';
import Button from '#components/Button';
import useUserMe from '#hooks/domain/useUserMe';
import useAlert from '#hooks/useAlert';
import {
    SUBSCRIPTION_COUNTRY,
    SUBSCRIPTION_DISASTER_TYPE,
    SUBSCRIPTION_FOLLOWED_EVENTS,
    SUBSCRIPTION_GENERAL,
    SUBSCRIPTION_NEW_EMERGENCIES,
    SUBSCRIPTION_NEW_OPERATIONS,
    SUBSCRIPTION_PER_DUE_DATE,
    SUBSCRIPTION_REGION,
    SUBSCRIPTION_SURGE_ALERT,
    SUBSCRIPTION_SURGE_DEPLOYMENT_MESSAGES,
    SUBSCRIPTION_WEEKLY_DIGEST,
} from '#utils/constants';
import { type GoApiBody, useLazyRequest } from '#utils/restRequest';

import styles from './styles.module.css';

export type RegionOption = components['schemas']['ApiRegionNameEnum'];

function regionKeySelector(option: RegionOption) {
    return option.key;
}

interface Value {
    weeklyDigest?: boolean;
    newEmergencies?: boolean;
    newOperations?: boolean;
    general?: boolean;

    region?: number[];
    country?: number[];

    disasterType?: number[];

    surge?: boolean;
    // Deployment Messages
    surgeDM?: boolean;

    perDueDate?: boolean;

    followedEvent?: number[];
}

type UpdateSubscriptionBody = GoApiBody<'/api/v2/update_subscriptions/', 'POST'>;

function SubscriptionPreferences() {
    const countryOptions = useCountry();
    const disasterTypeOptions = useDisasterTypes();
    const user = useUserMe();
    const alert = useAlert();
    const { api_region_name: regionOptions } = useGlobalEnums();

    const [value, setValue] = useState<Value>({});
    const { trigger: updateUserSubscription } = useLazyRequest({
        url: '/api/v2/update_subscriptions/',
        method: 'POST',
        body: (ctx: UpdateSubscriptionBody) => ctx,
        onSuccess: () => {
            alert.show(
                'Subscription preferences updated!',
                { variant: 'success' },
            );
            // TODO: invalidate userMe
        },
        // TODO: handle failure
    });

    useEffect(
        () => {
            if (!user) {
                return;
            }

            const groupedSubcriptions = listToGroupList(
                user.subscription ?? [],
                (sub) => sub.rtype ?? '-1',
            );

            const weeklyDigest = isDefined(
                groupedSubcriptions[SUBSCRIPTION_WEEKLY_DIGEST]?.[0],
            );
            const newEmergencies = isDefined(
                groupedSubcriptions[SUBSCRIPTION_NEW_EMERGENCIES]?.[0],
            );
            const newOperations = isDefined(
                groupedSubcriptions[SUBSCRIPTION_NEW_OPERATIONS]?.[0],
            );
            const general = isDefined(
                groupedSubcriptions[SUBSCRIPTION_GENERAL]?.[0],
            );
            const surge = isDefined(
                groupedSubcriptions[SUBSCRIPTION_SURGE_ALERT]?.[0],
            );
            const surgeDM = isDefined(
                groupedSubcriptions[SUBSCRIPTION_SURGE_DEPLOYMENT_MESSAGES]?.[0],
            );
            const perDueDate = isDefined(
                groupedSubcriptions[SUBSCRIPTION_PER_DUE_DATE]?.[0],
            );

            const region = groupedSubcriptions[SUBSCRIPTION_REGION]?.map(
                (record) => record.region,
            ).filter(isDefined) ?? [];
            const country = groupedSubcriptions[SUBSCRIPTION_COUNTRY]?.map(
                (record) => record.country,
            ).filter(isDefined) ?? [];
            const disasterType = groupedSubcriptions[SUBSCRIPTION_DISASTER_TYPE]?.map(
                (record) => record.dtype,
            ).filter(isDefined) ?? [];
            const followedEvent = groupedSubcriptions[SUBSCRIPTION_FOLLOWED_EVENTS]?.map(
                (record) => record.event,
            ).filter(isDefined) ?? [];

            setValue({
                weeklyDigest,
                newEmergencies,
                newOperations,
                general,
                region,
                country,
                disasterType,
                surge,
                surgeDM,
                perDueDate,
                followedEvent,
            });
        },
        [user],
    );

    const handleChange = useCallback(
        (...args: EntriesAsList<Value>) => {
            const [val, key] = args;
            setValue((prevValue): Value => ({
                ...prevValue,
                [key]: val,
            }));
        },
        [],
    );

    const handleUpdateButtonClick = useCallback(
        (fieldValues: Value) => {
            const fieldKeys = Object.keys(fieldValues) as (keyof Value)[];
            // NOTE: using flatMap gives an error
            const updates = fieldKeys.map(
                (fieldKey) => {
                    const fieldValue = fieldValues[fieldKey];

                    if (typeof fieldValue === 'boolean' && fieldValue === true) {
                        return [{
                            type: fieldKey,
                            value: fieldValue,
                        }];
                    }

                    if (Array.isArray(fieldValue) && fieldValue.length > 0) {
                        return fieldValue.map(
                            (subValue) => ({
                                type: fieldKey,
                                value: subValue,
                            }),
                        );
                    }

                    return [];
                },
            ).flat();

            // FIXME typing should be fixed in the server
            updateUserSubscription(updates as never);
        },
        [updateUserSubscription],
    );

    return (
        <Container
            className={styles.subscriptionPreferences}
            heading="Subscription Preferences"
            childrenContainerClassName={styles.content}
            withHeaderBorder
            footerActions={(
                <Button
                    name={value}
                    onClick={handleUpdateButtonClick}
                >
                    Update Notification Preferences
                </Button>
            )}
        >
            <Container
                heading="Notification types"
                headerDescription="Set basic notification types"
                spacing="compact"
                childrenContainerClassName={styles.notificationTypeInputListContent}
                headingLevel={5}
            >
                <Checkbox
                    name="weeklyDigest"
                    label="Weekly Digest"
                    description="Select to get a weekly compilation of emergency events based on your preferences."
                    value={value.weeklyDigest}
                    onChange={handleChange}
                />
                <Checkbox
                    name="newEmergencies"
                    label="New Emergencies"
                    description="Select to receive notifications for new emergency events (includes Field Reports, GDACS alerts and WHO Alerts)."
                    value={value.newEmergencies}
                    onChange={handleChange}
                />
                <Checkbox
                    name="newOperations"
                    label="New Operations"
                    description="Select to receive notifications of new IFRC supported emergency operations."
                    value={value.newOperations}
                    onChange={handleChange}
                />
                <Checkbox
                    name="general"
                    label="General Announcements"
                    value={value.general}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading="Regional notifications"
                headerDescription="Select one or more regions to receive notifications about."
                spacing="compact"
                headingLevel={5}
            >
                <CheckList
                    listContainerClassName={styles.regionOptionListContent}
                    name="region"
                    options={regionOptions}
                    keySelector={regionKeySelector}
                    labelSelector={stringValueSelector}
                    value={value.region}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading="Country-level notifications"
                headerDescription="Select one or more countries to receive notifications about."
                spacing="compact"
                headingLevel={5}
            >
                <MultiSelectInput
                    name="country"
                    placeholder="No countries selected"
                    options={countryOptions}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    value={value.country}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading="Disaster types"
                headerDescription="Select one or more countries to receive notifications about."
                spacing="compact"
                headingLevel={5}
            >
                <CheckList
                    listContainerClassName={styles.disasterTypeOptionListContent}
                    name="disasterType"
                    options={disasterTypeOptions}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    value={value.disasterType}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading="Surge Notifications"
                spacing="compact"
                childrenContainerClassName={styles.surgeNotificationsListContent}
                headingLevel={5}
            >
                <Checkbox
                    name="surge"
                    label="Surge alerts"
                    value={value.surge}
                    onChange={handleChange}
                />
                <Checkbox
                    name="surgeDM"
                    label="Deployment Messages"
                    value={value.surgeDM}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading="Other Notifications"
                spacing="compact"
                childrenContainerClassName={styles.otherNotificationsListContent}
                headingLevel={5}
            >
                <Checkbox
                    name="perDueDate"
                    label="PER Due Dates"
                    value={value.perDueDate}
                    onChange={handleChange}
                />
            </Container>
        </Container>
    );
}

export default SubscriptionPreferences;
