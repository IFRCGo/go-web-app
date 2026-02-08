import {
    useCallback,
    useMemo,
} from 'react';
import {
    Button,
    Checklist,
    Container,
    InlineLayout,
    ListView,
    Modal,
    RadioInput,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    numericIdSelector,
    stringKeySelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    type ObjectSchema,
    type PurgeNull,
    requiredListCondition,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import CountryMultiSelectInput from '#components/domain/CountryMultiSelectInput';
import NonFieldError from '#components/NonFieldError';
import { type components } from '#generated/types';
import useDisasterTypes, { type DisasterType } from '#hooks/domain/useDisasterType';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlert from '#hooks/useAlert';
import {
    type GoApiBody,
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';

type RegionOption = components<'read'>['schemas']['ApiRegionNameEnum'];

function regionKeySelector(option: RegionOption) {
    return option.key;
}

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type AlertPerDayEnums = NonNullable<GlobalEnumsResponse['notifications_alert_per_day']>[number];
function alertPerDayKeySelector(option: AlertPerDayEnums) {
    return option.key;
}

const disasterTypeLabelSelector = (disasterType: DisasterType) => disasterType.name ?? '?';

type SubscriptionRequestBody = GoApiBody<'/api/v2/alert-subscription/{id}/', 'PATCH'>;
type SubscriptionPostRequestBody = GoApiBody<'/api/v2/alert-subscription/', 'POST'>;

type FormFields = PurgeNull<SubscriptionRequestBody>;
type PartialFormFields = Partial<FormFields>;

type FormSchema = ObjectSchema<PartialFormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        alert_per_day: {},
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        countries: {
            required: true,
            requiredValidation: requiredListCondition,
        },
        hazard_types: {
            required: true,
            requiredValidation: requiredListCondition,
        },
        regions: {},
        user: { required: true },
    }),
};

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
    const alertPerDayUnlimitedOption = useMemo(() => ([
        {
            key: 'unlimited',
            value: strings.unlimitedOptionValue,
        },
    ]), [strings.unlimitedOptionValue]);

    const disasterTypeOptions = useDisasterTypes();

    const defaultFormValue: PartialFormFields = useMemo(() => ({
        regions: [],
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
            setValue({
                title: response?.title,
                alert_per_day: response?.alert_per_day ?? undefined,
                countries: response?.countries,
                hazard_types: response?.hazard_types,
                regions: response?.regions,
                user: userId,
            });
        },
        // TODO: handle failure
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

    const handleUnlimitedRadioChange = useCallback(() => {
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

    return (
        <Modal
            heading={isDefined(subscriptionId)
                ? strings.addSubscriptionHeading
                : strings.editSubscriptionHeading}
            size="xl"
            onClose={onClose}
            pending={subscriptionDetailPending
                || updateSubscriptionPending || createSubscriptionPending}
            footerActions={(
                <ListView spacing="sm">
                    <Button
                        name={undefined}
                        onClick={onClose}
                        colorVariant="secondary"
                    >
                        {strings.cancelButtonLabel}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleUpdateButtonClick}
                        colorVariant="primary"
                        disabled={pristine
                            || updateSubscriptionPending || createSubscriptionPending}
                    >
                        {strings.updateButtonLabel}
                    </Button>
                </ListView>
            )}
        >
            <ListView
                layout="block"
                spacing="xl"
            >
                <NonFieldError error={error} />
                <TextInput
                    name="title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                    label={strings.subscriptionTitleLabel}
                    placeholder={strings.subscriptionTitlePlaceholder}
                />
                <Container
                    heading={strings.alertPerDayHeading}
                    headerDescription={strings.alertPerDayDescription}
                    headingLevel={5}
                >
                    <InlineLayout
                        after={(
                            <RadioInput
                                name={undefined}
                                options={alertPerDayUnlimitedOption}
                                keySelector={stringKeySelector}
                                labelSelector={stringValueSelector}
                                value={value.alert_per_day ? undefined : 'unlimited'}
                                onChange={handleUnlimitedRadioChange}
                            />
                        )}
                        withInlineDisplay
                        contentAlignment="end"
                        // FIXME: Use consistent spacing
                        spacing="none"
                    >
                        <RadioInput
                            name="alert_per_day"
                            label={strings.alertPerDayLabel}
                            options={alertPerDayOptions}
                            keySelector={alertPerDayKeySelector}
                            labelSelector={stringValueSelector}
                            value={value.alert_per_day}
                            onChange={setFieldValue}
                            error={error?.alert_per_day}
                        />
                    </InlineLayout>
                </Container>
                <Container
                    heading={strings.countriesHeading}
                    headerDescription={strings.countriesDescription}
                    headingLevel={5}
                >
                    <CountryMultiSelectInput
                        name="countries"
                        label={strings.countryLabel}
                        placeholder={strings.countryPlaceholder}
                        value={value.countries}
                        onChange={setFieldValue}
                        withSelectAll
                        error={getErrorString(error?.countries)}
                    />
                </Container>
                <Container
                    heading={strings.regionsHeading}
                    headerDescription={strings.regionsDescription}
                    headingLevel={5}
                >
                    <Checklist
                        name="regions"
                        label={strings.regionLabel}
                        options={regionOptions}
                        keySelector={regionKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={setFieldValue}
                        checkListLayout="grid"
                        checkListLayoutPreferredGridColumns={5}
                        value={value.regions}
                        error={getErrorString(error?.regions)}
                    />
                </Container>
                <Container
                    heading={strings.hazardTypeHeading}
                    headerDescription={strings.hazardTypeDescription}
                    headingLevel={5}
                >
                    <Checklist
                        name="hazard_types"
                        label={strings.hazardTypeLabel}
                        options={disasterTypeOptions}
                        keySelector={numericIdSelector}
                        labelSelector={disasterTypeLabelSelector}
                        value={value.hazard_types}
                        onChange={setFieldValue}
                        checkListLayout="grid"
                        checkListLayoutPreferredGridColumns={4}
                        error={getErrorString(error?.hazard_types)}
                    />
                </Container>
            </ListView>
        </Modal>
    );
}

export default SubscriptionModal;
