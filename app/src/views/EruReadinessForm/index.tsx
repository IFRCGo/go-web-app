import {
    useCallback,
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
import { stringValueSelector } from '@ifrc-go/ui/utils';
import {
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    type PartialForm,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import Page from '#components/Page';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useAlertContext from '#hooks/useAlert';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import EruInputItem from './EruInputItem';
import schema, {
    type BaseFormType,
    type EruReadinessBody,
} from './schema';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GlobalEnumsResponse = GoApiResponse<'/api/v2/global-enums/'>;
type EruOwners = GoApiResponse<'/api/v2/eru_owner/mini/'>;
type EruOwnerOption = NonNullable<EruOwners['results']>[number];
type EruTypeOption = NonNullable<GlobalEnumsResponse['deployments_eru_type']>[number];

function eruOwnerKeySelector(option: EruOwnerOption) {
    return option.id;
}
function eruOwnerLabelSelector(option: EruOwnerOption) {
    return option.national_society_country_details.society_name ?? '';
}

const defaultFormValues: PartialForm<EruReadinessBody> = {};

const eruTypeKeySelector = (eruType: EruTypeOption) => eruType.key;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const alert = useAlertContext();
    const {
        deployments_eru_type,
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

    const [eruId, setEruId] = useState<number | undefined>();

    const [selectedEruTypeList, setSelectedEruTypeList] = useState<EruTypeOption['key'][] | undefined>();

    const [selectedEruOwner, setSelectedEruOwner] = useState<EruOwnerOption['id']>();

    const {
        trigger: updateEruReadinessForm,
        pending: updateEruReadinessFormPending,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/{id}/',
        method: 'PATCH',
        pathVariables: eruId !== undefined ? { id: Number(eruId) } : undefined,
        body: (ctx: EruReadinessBody) => ctx,
        onSuccess: () => {
            alert.show(
                strings.eruFormSuccessfullyUpdated,
                { variant: 'success' },
            );
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
        response: eruOwnerResponse,
        pending: eruOwnerPending,
    } = useRequest({
        url: '/api/v2/eru_owner/mini/',
        preserveResponse: true,
    });

    const {
        trigger: fetchEruReadinessData,
        pending: fetchEruReadinessDataPending,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/',
        query: (eruOwnerId: number) => ({ eru_owner: eruOwnerId }),
        onSuccess: (response) => {
            const results = response?.results ?? [];
            if (results?.length > 0) {
                const existingData = results[0];
                setEruId(existingData.id);
                setValue({
                    ...existingData,
                    eru_owner: existingData.eru_owner_details?.id,
                    eru_types: existingData.eru_types?.map((eruType) => ({
                        ...eruType,
                        id: eruType.type,
                    })),
                });
                setSelectedEruTypeList(existingData.eru_types?.map((eruType) => eruType.type));
                setSelectedEruOwner(existingData.eru_owner_details?.id);
            } else {
                setEruId(undefined);
                setValue({ ...defaultFormValues, eru_owner: undefined });
                setSelectedEruTypeList(undefined);
                setSelectedEruOwner(undefined);
            }
        },
    });

    const {
        setValue: onEruChange,
    } = useFormArray('eru_types', setFieldValue);

    const eruOwnerOption = eruOwnerResponse?.results;

    const handleSubmit = useCallback((finalValue: BaseFormType) => {
        setValue(finalValue);

        if (isNotDefined(finalValue) || !finalValue.eru_owner) {
            return;
        }

        if (isNotDefined(eruId)) {
            alert.show(
                strings.eruNoRecord,
                { variant: 'warning' },
            );
            return;
        }

        const updatedEruTypes = (selectedEruTypeList || []).map((type) => {
            const existingEru = finalValue.eru_types?.find((eruType) => eruType.type === type);

            return {
                id: existingEru?.id ?? undefined,
                type,
                comment: existingEru?.comment ?? null,
                equipment_readiness: existingEru?.equipment_readiness ?? 1,
                people_readiness: existingEru?.people_readiness ?? 1,
                funding_readiness: existingEru?.funding_readiness ?? 1,
                has_capacity_to_lead: existingEru?.has_capacity_to_lead ?? false,
                has_capacity_to_support: existingEru?.has_capacity_to_support ?? false,
            };
        });

        const updatedFinalValue: EruReadinessBody = {
            ...finalValue,
            eru_types: updatedEruTypes,
            eru_owner: finalValue.eru_owner,
        };

        updateEruReadinessForm(updatedFinalValue);
    }, [
        alert,
        setValue,
        updateEruReadinessForm,
        eruId,
        selectedEruTypeList,
        strings.eruNoRecord,
    ]);

    const handleSave = useCallback(() => {
        const handler = createSubmitHandler(
            validate,
            setError,
            handleSubmit,
        );
        handler();
    }, [
        validate,
        setError,
        handleSubmit,
    ]);

    const disabled = updateEruReadinessFormPending
        || eruOwnerPending || fetchEruReadinessDataPending;

    const handleCancel = useCallback(() => {
        setFieldValue([], 'eru_types');
        setSelectedEruOwner(undefined);
        setSelectedEruTypeList(undefined);
    }, [
        setFieldValue,
    ]);

    const handleSelectERUType = useCallback((values: EruTypeOption['key'][] | undefined) => {
        setSelectedEruTypeList(values);

        const existingEruTypeList = value.eru_types?.map((eruType) => eruType.id);
        const addedEruTypeList = values?.filter((v) => !existingEruTypeList?.includes(v));
        const removedEruTypeList = existingEruTypeList?.filter((v) => !values?.includes(v));

        const addedEruTypeObjectList = addedEruTypeList?.map((a) => ({
            clientId: randomString(),
            id: a,
            type: a,
        }));

        const newFieldValues = value.eru_types?.filter(
            (fv) => !removedEruTypeList?.includes(fv.id),
        );

        setFieldValue([...(newFieldValues ?? []), ...(addedEruTypeObjectList ?? [])], 'eru_types');
    }, [value.eru_types, setFieldValue]);

    const handleEruOwnerChange = useCallback(
        (newValue: number | undefined) => {
            setSelectedEruOwner(newValue);
            setFieldValue(newValue, 'eru_owner');

            if (newValue) {
                setValue({});
                fetchEruReadinessData(newValue);
            } else {
                setValue({ ...defaultFormValues, eru_owner: undefined });
                setSelectedEruTypeList(undefined);
            }
        },
        [setFieldValue, fetchEruReadinessData, setValue],
    );

    return (
        <Page
            className={styles.updateForm}
            title={strings.eruReadinessFormTitle}
            heading={strings.eruReadinessFormHeading}
            description={strings.eruReadinessFormDescription}
            withBackgroundColorInMainSection
            mainSectionClassName={styles.content}
            actions={(
                <>
                    <Button
                        name={undefined}
                        onClick={handleCancel}
                        variant="tertiary"
                    >
                        {strings.eruCancelButton}
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleSave}
                        variant="secondary"
                    >
                        {strings.eruSaveAndCloseButton}
                    </Button>
                </>
            )}
        >
            <Container>
                <InputSection
                    title={strings.eruNationalSociety}
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="eru_owner"
                        options={eruOwnerOption}
                        onChange={handleEruOwnerChange}
                        value={selectedEruOwner}
                        keySelector={eruOwnerKeySelector}
                        labelSelector={eruOwnerLabelSelector}
                        error={error?.eru_owner}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <Container>
                <InputSection
                    title={strings.eruTypes}
                >
                    <MultiSelectInput
                        name="eru_types"
                        options={deployments_eru_type}
                        value={selectedEruTypeList}
                        keySelector={eruTypeKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={handleSelectERUType}
                        disabled={disabled}
                    />
                </InputSection>
            </Container>
            <div className={styles.eruTypeList}>
                {value.eru_types?.map((eruType, index) => (
                    <EruInputItem
                        key={eruType.id}
                        index={index}
                        value={eruType}
                        onChange={onEruChange}
                        title={deployments_eru_type?.find(
                            (type) => type.key === eruType.type,
                        )?.value}
                        error={getErrorObject(error?.eru_types)}
                    />
                ))}
            </div>
        </Page>
    );
}

Component.displayName = 'EruReadinessForm';
