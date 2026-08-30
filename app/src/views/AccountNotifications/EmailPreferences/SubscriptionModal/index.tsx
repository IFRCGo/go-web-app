import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Checklist,
    Container,
    ExpandableContainer,
    InputError,
    ListView,
    Modal,
    Radio,
    RadioInput,
    Switch,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    resolveToString,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    listToMap,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { type components } from '#generated/types';
import useCountry from '#hooks/domain/useCountry';
import { type DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import formSchema, {
    type PartialFormFields,
    type SubscriptionRequestBody,
} from './schema';

import i18n from './i18n.json';

type SubscriptionPostRequestBody = GoApiBody<'/api/v2/alert-subscription/{id}/', 'POST'>;
type AlertPerDayEnums = components['schemas']['NotificationsAlertPerDayEnum'];

function alertPerDayKeySelector(option: AlertPerDayEnums) {
    return option.key;
}

const disasterTypeLabelSelector = (disasterType: Pick<DisasterType, 'id' | 'name'>) => disasterType.name ?? '?';

interface Props {
    onClose: () => void;
    subscriptionId?: number;
    userId: number;
}

function SubscriptionModal(props: Props) {
    const {
        onClose,
        subscriptionId,
        userId,
    } = props;

    const {
        notifications_alert_per_day: alertPerDayOptions,
        api_region_name: regionOptions,
    } = useGlobalEnums();

    const strings = useTranslation(i18n);
    const alert = useAlert();

    // NOTE: Email alerts only supports 3 disasters at the moment
    const disasterTypeOptions = [
        {
            id: 2,
            name: strings.earthquakeLabel,
        },
        {
            id: 4,
            name: strings.cycloneLabel,
        },
        {
            id: 12,
            name: strings.floodLabel,
        },
    ];

    const defaultFormValue: PartialFormFields = useMemo(() => ({
        user: userId,
    }), [userId]);

    const {
        value,
        error: formError,
        validate,
        setValue,
        setFieldValue,
        setError,
        pristine,
    } = useForm(formSchema, { value: defaultFormValue });

    const error = getErrorObject(formError);

    const {
        pending: subscriptionDetailPending,
    } = useRequest<'/api/v2/alert-subscription/{id}/'>({
        skip: isNotDefined(subscriptionId),
        url: '/api/v2/alert-subscription/{id}/',
        pathVariables: subscriptionId ? { id: subscriptionId } : undefined,
        method: 'GET',
        onSuccess: (response) => {
            setValue(
                removeNull({
                    title: response?.title,
                    alert_per_day: response?.alert_per_day ?? undefined,
                    countries: response?.countries,
                    hazard_types: response?.hazard_types,
                    regions: response?.regions,
                    user: userId,
                }),
            );
        },
        onFailure: () => {
            alert.show(
                strings.updateFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const {
        trigger: updateSubscription,
        pending: updateSubscriptionPending,
    } = useLazyRequest({
        url: '/api/v2/alert-subscription/{id}/',
        method: 'PATCH',
        pathVariables: isDefined(subscriptionId)
            ? { id: subscriptionId }
            : undefined,
        body: (ctx: SubscriptionRequestBody) => ctx,
        onSuccess: () => {
            alert.show(
                strings.updateSuccessMessage,
                { variant: 'success' },
            );
            onClose();
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                },
            } = err;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.updateFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const {
        trigger: createSubscription,
        pending: createSubscriptionPending,
    } = useLazyRequest({
        url: '/api/v2/alert-subscription/',
        method: 'POST',
        body: (ctx: SubscriptionPostRequestBody) => ctx,
        onSuccess: () => {
            alert.show(
                strings.createSuccessMessage,
                { variant: 'success' },
            );
            onClose();
        },
        onFailure: (err) => {
            const {
                value: {
                    formErrors,
                },
            } = err;

            setError(transformObjectError(formErrors, () => undefined));

            alert.show(
                strings.createFailureMessage,
                { variant: 'danger' },
            );
        },
    });

    const handleUnlimitedAlertsRadioClick = useCallback(() => {
        // NOTE: Setting undefined as forms don't handle null values
        // Null value is required to set alert frequency to unlimited
        setFieldValue(undefined, 'alert_per_day');
    }, [setFieldValue]);

    const handleFinalSubmit = useCallback(
        (formValues: PartialFormFields) => {
            if (isDefined(subscriptionId)) {
                updateSubscription({
                    ...formValues,
                    // NOTE: @frozenhelium Will undefined be set to null by default?
                    alert_per_day: isNotDefined(formValues.alert_per_day)
                        ? null
                        : formValues.alert_per_day,
                } as SubscriptionRequestBody);
            } else {
                createSubscription({
                    ...formValues,
                    // NOTE: @frozenhelium Will undefined be set to null by default?
                    alert_per_day: isNotDefined(formValues.alert_per_day)
                        ? null
                        : formValues.alert_per_day,
                } as SubscriptionPostRequestBody);
            }
        },
        [subscriptionId, updateSubscription, createSubscription],
    );

    const handleUpdateButtonClick = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            handleFinalSubmit,
        );
        handler();
    }, [handleFinalSubmit, validate, setError]);

    const countries = useCountry();
    const countryDetailsById = useMemo(() => (
        listToMap(
            countries,
            ({ id }) => id,
        )
    ), [countries]);

    const regionGroupedCountries = useMemo(() => (
        listToGroupList(
            countries.map((country) => {
                const {
                    region,
                    ...other
                } = country;

                if (isNotDefined(region)) {
                    return undefined;
                }

                return {
                    ...other,
                    region,
                };
            }).filter(isDefined),
            (country) => country.region,
        )
    ), [countries]);

    const selectedCountriesIdMap = useMemo(() => (
        listToMap(
            value.countries,
            (countryId) => countryId,
            () => true,
        )
    ), [value.countries]);

    const selectedRegionIdMap = useMemo(() => (
        listToMap(
            value.regions,
            (regionId) => regionId,
            () => true,
        )
    ), [value.regions]);

    const updateRegionSelection = useCallback((isSelected: boolean, region: number) => {
        setFieldValue(
            (selectedRegions: number[] | undefined = []) => {
                const regionIndex = selectedRegions.findIndex(
                    (selectedRegion) => selectedRegion === region,
                );

                if (regionIndex === -1 && isSelected) {
                    return [
                        ...selectedRegions,
                        region,
                    ];
                }
                if (regionIndex === -1) {
                    return selectedRegions;
                }
                if (isSelected) {
                    return selectedRegions;
                }

                return selectedRegions.toSpliced(regionIndex, 1);
            },
            'regions' as const,
        );
    }, [setFieldValue]);

    const updateCountrySelection = useCallback((isSelected: boolean, country: number) => {
        setFieldValue(
            (selectedCountries: number[] | undefined = []) => {
                const countryIndex = selectedCountries.findIndex(
                    (selectedCountry) => selectedCountry === country,
                );

                if (countryIndex === -1 && isSelected) {
                    return [
                        ...selectedCountries,
                        country,
                    ];
                }

                if (isSelected) {
                    return selectedCountries;
                }

                return selectedCountries.toSpliced(countryIndex, 1);
            },
            'countries' as const,
        );

        if (isSelected) {
            const countryDetails = countryDetailsById[country];
            if (isDefined(countryDetails?.region)) {
                updateRegionSelection(false, countryDetails?.region);
            }
        }
    }, [setFieldValue, countryDetailsById, updateRegionSelection]);

    return (
        <Modal
            heading={isDefined(subscriptionId)
                ? strings.editSubscriptionHeading
                : strings.addSubscriptionHeading}
            size="full"
            onClose={onClose}
            pending={subscriptionDetailPending
                || updateSubscriptionPending
                || createSubscriptionPending}
            footerActions={(
                <ListView spacing="sm">
                    <Button
                        name={undefined}
                        onClick={onClose}
                    >
                        {strings.cancelButtonLabel}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleUpdateButtonClick}
                        styleVariant="filled"
                        disabled={pristine
                            || updateSubscriptionPending
                            || createSubscriptionPending}
                    >
                        {strings.updateButtonLabel}
                    </Button>
                </ListView>
            )}
            withHeaderBorder
            headerDescription={(
                <NonFieldError error={error} />
            )}
        >
            <ListView
                layout="block"
                spacing="xl"
            >
                <TextInput
                    name="title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                    label={strings.subscriptionTitleLabel}
                    placeholder={strings.subscriptionTitlePlaceholder}
                />
                <Container
                    heading={strings.alertPerDayLabel}
                    headerDescription={strings.alertPerDayDescription}
                    spacing="sm"
                    withContentWell
                    headingLevel={5}
                >
                    <ListView
                        withStartAlignment
                        spacing="3xs"
                    >
                        <RadioInput
                            name="alert_per_day"
                            options={alertPerDayOptions}
                            keySelector={alertPerDayKeySelector}
                            labelSelector={stringValueSelector}
                            value={value.alert_per_day}
                            onChange={setFieldValue}
                            error={error?.alert_per_day}
                        />
                        <Radio
                            name={undefined}
                            value={isNotDefined(value.alert_per_day)}
                            onClick={handleUnlimitedAlertsRadioClick}
                        >
                            {strings.unlimitedOptionValue}
                        </Radio>
                    </ListView>
                </Container>
                <Container
                    heading={strings.regionSelectionHeading}
                    headerDescription={strings.regionSelectionDescription}
                    spacing="sm"
                    headingLevel={5}
                >
                    <ListView
                        layout="block"
                        spacing="2xs"
                    >
                        {regionOptions?.map((region) => {
                            const regionCountries = regionGroupedCountries[region.key];
                            const selectedCountries = regionCountries?.filter(
                                (country) => !!selectedCountriesIdMap?.[country.id],
                            );
                            const hasSelectedCountries = isDefined(selectedCountries)
                                && selectedCountries?.length > 0;

                            return (
                                <ExpandableContainer
                                    key={region.key}
                                    heading={region.value}
                                    headingLevel={6}
                                    withDarkBackground
                                    withPadding
                                    headerActions={(
                                        <>
                                            {hasSelectedCountries && (
                                                <div>
                                                    {resolveToString(
                                                        strings.countriesSelectedLabel,
                                                        {
                                                            numCountries: selectedCountries?.length,
                                                            // eslint-disable-next-line max-len
                                                            countryLabel: (selectedCountries?.length ?? 0) > 1
                                                                ? strings.countryLabelPlural
                                                                : strings.countryLabelSingular,
                                                        },
                                                    )}
                                                </div>
                                            )}
                                            <Switch
                                                name={region.key}
                                                value={!!selectedRegionIdMap?.[region.key]
                                                    || hasSelectedCountries}
                                                onChange={updateRegionSelection}
                                                disabled={hasSelectedCountries}
                                            />
                                        </>
                                    )}
                                >
                                    <ListView
                                        layout="grid"
                                        numPreferredGridColumns={5}
                                        spacing="2xs"
                                    >
                                        {regionCountries?.map((country) => (
                                            <Switch
                                                key={country.id}
                                                name={country.id}
                                                label={country.name}
                                                value={selectedCountriesIdMap?.[country.id]}
                                                onChange={updateCountrySelection}
                                                withBackground
                                                withInvertedView
                                            />
                                        ))}
                                    </ListView>
                                </ExpandableContainer>
                            );
                        })}
                        {error?.regions && (
                            <InputError>
                                {getErrorString(error.regions)}
                            </InputError>
                        )}
                        {error?.countries && (
                            <InputError>
                                {getErrorString(error?.countries)}
                            </InputError>
                        )}
                    </ListView>
                </Container>
                <Container
                    heading={strings.hazardTypeHeading}
                    headerDescription={strings.hazardTypeDescription}
                    spacing="sm"
                    headingLevel={5}
                >
                    <Checklist
                        name="hazard_types"
                        options={disasterTypeOptions}
                        keySelector={numericIdSelector}
                        labelSelector={disasterTypeLabelSelector}
                        value={value.hazard_types}
                        onChange={setFieldValue}
                        checkListLayout="grid"
                        checkListLayoutPreferredGridColumns={5}
                        error={getErrorString(error?.hazard_types)}
                    />
                </Container>
            </ListView>
        </Modal>
    );
}

export default SubscriptionModal;
