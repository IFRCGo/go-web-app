import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    InputSection,
    MultiSelectInput,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    injectClientId,
    resolveToComponent,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlertContext from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import EruInputItem from './EruInputItem';
import schema, {
    type EruReadinessPatchBody,
    type EruReadinessPostBody,
    type FormType,
    type PartialEruItem,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EruOwners = GoApiResponse<'/api/v2/eru_owner/mini/'>;
type EruOwnerOption = NonNullable<EruOwners['results']>[number];
type EruOption = NonNullable<GlobalEnumsResponse['deployments_eru_type']>[number];
type EruResponse = GoApiResponse<'/api/v2/eru-readiness/{id}/'>;

function eruOwnerKeySelector(option: EruOwnerOption) {
    return option.id;
}
function eruOwnerLabelSelector(option: EruOwnerOption) {
    return option.national_society_country_details.society_name ?? '';
}

function eruTypeKeySelector(eruType: EruOption) {
    return eruType.key;
}

const defaultFormValues: FormType = {};

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const { goBack } = useRouting();
    const alert = useAlertContext();
    const {
        deployments_eru_type: eruTypeOptions,
    } = useGlobalEnums();

    const {
        value,
        setFieldValue,
        validate,
        setError,
        setValue,
        error: formError,
    } = useForm(
        schema,
        { value: defaultFormValues },
    );

    const error = getErrorObject(formError);

    const [eruReadinessId, setEruReadinessId] = useState<number | undefined>();

    const patchEruFormValues = (response: EruResponse) => {
        setEruReadinessId(response.id);
        setValue({
            eru_owner: response.eru_owner_details.id,
            eru_types: response.eru_types.map((eruType) => ({
                ...injectClientId(eruType),
                id: eruType.id,
                type: eruType.type,
                equipment_readiness: eruType.equipment_readiness,
                people_readiness: eruType.people_readiness,
                funding_readiness: eruType.funding_readiness,
                comment: eruType.comment,
                has_capacity_to_lead: eruType.has_capacity_to_lead,
                has_capacity_to_support: eruType.has_capacity_to_support,
                client_id: randomString(),
            })),
        });
    };
    const {
        trigger: updateEruReadiness,
        pending: updateEruReadinessPending,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/{id}/',
        method: 'PATCH',
        pathVariables: eruReadinessId ? { id: Number(eruReadinessId) } : undefined,
        body: (ctx: EruReadinessPatchBody) => ctx,
        onSuccess: (response) => {
            patchEruFormValues(response);
            alert.show(
                strings.eruFormSuccessfullyUpdated,
                { variant: 'success' },
            );
            goBack();
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(transformObjectError(formErrors, () => undefined));
            alert.show(
                strings.eruFormFailedToUpdate,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });

    const {
        trigger: createEruReadiness,
        pending: createEruReadinessPending,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/',
        method: 'POST',
        body: (ctx: EruReadinessPostBody) => ctx,
        onSuccess: (response) => {
            patchEruFormValues(response);
            alert.show(
                strings.eruFormSuccessfullyCreated,
                { variant: 'success' },
            );
            goBack();
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(transformObjectError(formErrors, () => undefined));
            alert.show(
                strings.eruFormFailedToCreate,
                {
                    variant: 'danger',
                    debugMessage,
                    description: messageForNotification,
                },
            );
        },
    });
    const {
        response: eruOwnerResponse,
        pending: eruOwnerPending,
    } = useRequest({
        url: '/api/v2/eru_owner/mini/',
        preserveResponse: true,
        onFailure: () => {
            alert.show(
                strings.eruOwnerFailedToFetch,
                {
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: fetchEruReadinessData,
        pending: fetchEruReadinessDataPending,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/',
        query: (eruOwnerId: number) => ({ eru_owner: eruOwnerId }),
        preserveResponse: true,
        onSuccess: (response) => {
            const results = response?.results ?? [];
            if (results?.length > 0) {
                patchEruFormValues(results[0]);
            } else {
                setEruReadinessId(undefined);
                setValue((oldValues) => ({
                    ...oldValues,
                    eru_types: undefined,
                }));
            }
        },
        onFailure: () => {
            alert.show(
                strings.eruReadinessFailedToFetch,
                {
                    variant: 'danger',
                },
            );
        },
    });

    const {
        setValue: onEruChange,
    } = useFormArray<'eru_types', PartialEruItem>(
        'eru_types',
        setFieldValue,
    );

    const handleSubmit = useCallback((formValues: FormType) => {
        if (eruReadinessId) {
            updateEruReadiness(formValues as EruReadinessPatchBody);
        } else {
            createEruReadiness(formValues as EruReadinessPostBody);
        }
    }, [eruReadinessId, updateEruReadiness, createEruReadiness]);

    const handleFormSubmit = createSubmitHandler(validate, setError, handleSubmit);

    const pending = updateEruReadinessPending
        || eruOwnerPending
        || fetchEruReadinessDataPending
        || createEruReadinessPending;

    const handleCancel = useCallback(() => {
        setValue(defaultFormValues);
        goBack();
    }, [
        goBack,
        setValue,
    ]);

    const handleSelectEru = useCallback((values: EruOption['key'][] | undefined) => {
        const addedEruIdList = values?.filter(
            (eruType) => !value.eru_types?.some(({ type }) => type === eruType),
        );

        const addedEruList: PartialEruItem[] | undefined = addedEruIdList
            ?.map((a) => ({
                client_id: randomString(),
                type: a,
            }));

        const remainingEruList = value.eru_types?.filter(
            (eru) => isDefined(eru.type) && values?.includes(eru.type),
        );

        setFieldValue([
            ...(remainingEruList ?? []),
            ...(addedEruList ?? []),
        ], 'eru_types' as const);
    }, [setFieldValue, value]);

    const handleEruOwnerChange = useCallback(
        (newValue: number | undefined) => {
            setValue({
                ...defaultFormValues,
                eru_owner: newValue,
            });
            if (isDefined(newValue)) {
                fetchEruReadinessData(newValue);
            }
        },
        [fetchEruReadinessData, setValue],
    );

    const eruTypes = useMemo(() => (
        value.eru_types?.map((eruType) => eruType.type).filter(isDefined)
    ), [value.eru_types]);

    return (
        <Page
            title={strings.eruReadinessFormTitle}
            heading={strings.eruReadinessFormHeading}
            description={resolveToComponent(
                strings.eruReadinessFormDescription,
                {
                    imContact: (
                        <Link
                            href="mailto:im@ifrc.org"
                            external
                            variant="tertiary"
                        >
                            {strings.imContact}
                        </Link>
                    ),
                    surgeContact: (
                        <Link
                            href="mailto:surge@ifrc.org"
                            external
                            variant="tertiary"
                        >
                            {strings.imContact}
                        </Link>
                    ),
                },
            )}
            withBackgroundColorInMainSection
            mainSectionClassName={styles.mainSection}
            actions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleCancel}
                        variant="secondary"
                    >
                        {strings.eruCancelButton}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        variant="primary"
                    >
                        {strings.eruSaveAndCloseButton}
                    </Button>
                </>
            )}
        >
            <NonFieldError
                error={formError}
                withFallbackError
            />
            <Container
                withFooterBorder
                contentViewType="vertical"
            >
                <InputSection
                    title={strings.eruSelectNationalSociety}
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="eru_owner"
                        options={eruOwnerResponse?.results}
                        onChange={handleEruOwnerChange}
                        value={value.eru_owner}
                        keySelector={eruOwnerKeySelector}
                        labelSelector={eruOwnerLabelSelector}
                        error={error?.eru_owner}
                        required
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title={strings.eruSelectErus}
                >
                    <MultiSelectInput
                        name="eru_types"
                        options={eruTypeOptions}
                        value={eruTypes}
                        keySelector={eruTypeKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={handleSelectEru}
                        required
                        disabled={pending || isNotDefined(value.eru_owner)}
                    />
                </InputSection>
            </Container>
            <Container
                contentViewType="vertical"
                pending={fetchEruReadinessDataPending}
            >
                <NonFieldError error={getErrorObject(error?.eru_types)} />
                {value.eru_types?.map((eru, index) => (
                    <EruInputItem
                        key={eru.client_id}
                        index={index}
                        value={eru}
                        onChange={onEruChange}
                        error={getErrorObject(error?.eru_types)}
                    />
                ))}
            </Container>
        </Page>
    );
}

Component.displayName = 'EruReadinessForm';
