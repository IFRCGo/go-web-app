import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    Button,
    Checkbox,
    Checklist,
    Container,
    MultiSelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringNameSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToGroupList,
} from '@togglecorp/fujs';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import DomainContext from '#contexts/domain';
import { type components } from '#generated/types';
import useCountry from '#hooks/domain/useCountry';
import useDisasterTypes from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
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
import {
    type GoApiBody,
    useLazyRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';
import styles from './styles.module.css';

type RegionOption = components<'read'>['schemas']['ApiRegionNameEnum'];

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
    const strings = useTranslation(i18n);
    const { api_region_name: regionOptions } = useGlobalEnums();
    const { invalidate } = useContext(DomainContext);

    const [value, setValue] = useState<Value>({});
    const { trigger: updateUserSubscription } = useLazyRequest({
        url: '/api/v2/update_subscriptions/',
        method: 'POST',
        body: (ctx: UpdateSubscriptionBody) => ctx,
        onSuccess: () => {
            alert.show(
                strings.subscriptionPreferencesUpdatedMessage,
                { variant: 'success' },
            );
            invalidate('user-me');
        },
        // TODO: handle failure
    });

    // NOTE: Setting initial value from userMe
    useEffect(
        () => {
            if (!user) {
                return;
            }

            const groupedSubscriptions = listToGroupList(
                user.subscription ?? [],
                (sub) => sub.rtype ?? '-1',
            );

            const weeklyDigest = isDefined(
                groupedSubscriptions[SUBSCRIPTION_WEEKLY_DIGEST]?.[0],
            );
            const newEmergencies = isDefined(
                groupedSubscriptions[SUBSCRIPTION_NEW_EMERGENCIES]?.[0],
            );
            const newOperations = isDefined(
                groupedSubscriptions[SUBSCRIPTION_NEW_OPERATIONS]?.[0],
            );
            const general = isDefined(
                groupedSubscriptions[SUBSCRIPTION_GENERAL]?.[0],
            );
            const surge = isDefined(
                groupedSubscriptions[SUBSCRIPTION_SURGE_ALERT]?.[0],
            );
            const surgeDM = isDefined(
                groupedSubscriptions[SUBSCRIPTION_SURGE_DEPLOYMENT_MESSAGES]?.[0],
            );
            const perDueDate = isDefined(
                groupedSubscriptions[SUBSCRIPTION_PER_DUE_DATE]?.[0],
            );

            const region = groupedSubscriptions[SUBSCRIPTION_REGION]?.map(
                (record) => record.region,
            ).filter(isDefined) ?? [];
            const country = groupedSubscriptions[SUBSCRIPTION_COUNTRY]?.map(
                (record) => record.country,
            ).filter(isDefined) ?? [];
            const disasterType = groupedSubscriptions[SUBSCRIPTION_DISASTER_TYPE]?.map(
                (record) => record.dtype,
            ).filter(isDefined) ?? [];
            const followedEvent = groupedSubscriptions[SUBSCRIPTION_FOLLOWED_EVENTS]?.map(
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

            // FIXME: fix typing in server (low priority)
            updateUserSubscription(updates as never);
        },
        [updateUserSubscription],
    );

    return (
        <Container
            className={styles.subscriptionPreferences}
            heading={strings.subscriptionPreferencesHeading}
            childrenContainerClassName={styles.content}
            withHeaderBorder
            footerActions={(
                <Button
                    name={value}
                    onClick={handleUpdateButtonClick}
                >
                    {strings.subscriptionUpdateButtonLabel}
                </Button>
            )}
        >
            <Container
                heading={strings.subscriptionNotificationTypesHeading}
                headerDescription={strings.subscriptionNotificationTypesDescription}
                childrenContainerClassName={styles.notificationTypeInputListContent}
                headingLevel={5}
            >
                <Checkbox
                    name="weeklyDigest"
                    label={strings.subscriptionWeeklyDigestHeading}
                    description={strings.subscriptionWeeklyDigestDescription}
                    value={value.weeklyDigest}
                    onChange={handleChange}
                />
                <Checkbox
                    name="newEmergencies"
                    label={strings.subscriptionNewEmergenciesHeading}
                    description={strings.subscriptionNewEmergenciesDescription}
                    value={value.newEmergencies}
                    onChange={handleChange}
                />
                <Checkbox
                    name="newOperations"
                    label={strings.subscriptionNewOperationsHeading}
                    description={strings.subscriptionNewOperationsDescription}
                    value={value.newOperations}
                    onChange={handleChange}
                />
                <Checkbox
                    name="general"
                    label={strings.subscriptionGeneralAnnouncementsHeading}
                    value={value.general}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading={strings.subscriptionRegionalNotificationsHeading}
                headerDescription={strings.subscriptionRegionalNotificationsDescription}
                headingLevel={5}
            >
                <Checklist
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
                heading={strings.subscriptionCountryLevelNotificationsHeading}
                headerDescription={strings.subscriptionCountryLevelNotificationsDescription}
                headingLevel={5}
            >
                <MultiSelectInput
                    name="country"
                    placeholder={strings.subscriptionCountryInputPlaceholder}
                    options={countryOptions}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    value={value.country}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading={strings.subscriptionDisasterTypesHeading}
                headerDescription={strings.subscriptionDisasterTypesDescription}
                headingLevel={5}
            >
                <Checklist
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
                heading={strings.subscriptionSurgeNotificationsHeading}
                childrenContainerClassName={styles.surgeNotificationsListContent}
                headingLevel={5}
            >
                <Checkbox
                    name="surge"
                    label={strings.subscriptionSurgeAlertCheckboxLabel}
                    value={value.surge}
                    onChange={handleChange}
                />
                <Checkbox
                    name="surgeDM"
                    label={strings.subscriptionSurgeDeploymentMessagesCheckboxLabel}
                    value={value.surgeDM}
                    onChange={handleChange}
                />
            </Container>
            <Container
                heading={strings.subscriptionOtherNotificationsHeading}
                childrenContainerClassName={styles.otherNotificationsListContent}
                headingLevel={5}
            >
                <Checkbox
                    name="perDueDate"
                    label={strings.subscriptionPerDueDateCheckboxLabel}
                    value={value.perDueDate}
                    onChange={handleChange}
                />
            </Container>
        </Container>
    );
}

export default SubscriptionPreferences;
