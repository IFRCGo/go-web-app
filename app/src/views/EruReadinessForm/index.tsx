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
    numericKeySelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
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
    type EruReadinessPostBody,
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

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    // const { eruId } = useParams<{ eruId: number }>();
    // TODO: Use useParams for eruId
    const eruId = 1;

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

    const {
        pending: createEruReadinessPending,
        trigger: createEruReadiness,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/',
        method: 'POST',
        body: (ctx: EruReadinessPostBody) => ctx,
        onSuccess: () => {
            alert.show(
                strings.eruFormCreatedSuccessfully,
                { variant: 'success' },
            );
        },
        onFailure: () => {
            alert.show(
                strings.eruFormFailedToCreate,
                {
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: updateEruReadinessForm,
        pending: updateEruReadinessFormPending,
    } = useLazyRequest({
        url: '/api/v2/eru-readiness/{id}/',
        method: 'PATCH',
        pathVariables: isDefined(eruId) ? {
            id: Number(eruId),
        } : undefined,
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

    const eruTypesTitleMap = useMemo(
        () => (
            listToMap(
                deployments_eru_type,
                (eruType) => eruType.key,
                (eruType) => eruType.value,
            )
        ),
        [deployments_eru_type],
    );

    const {
        setValue: onEruChange,
    } = useFormArray('eru_types', setFieldValue);

    const eruOwnerOption = eruOwnerResponse?.results;

    const [selectedEruType, setSelectedEruType] = useState<EruTypeOption | undefined>();

    const handleInputChange = useCallback((type: EruTypeOption['key']) => {
        const newEruTypeItem = {
            client_id: randomString(),
            type,
            id: eruId,
        };

        setFieldValue(
            (oldValue: number[] | undefined) => (
                [...(oldValue ?? []), newEruTypeItem]
            ),
            'eru_types' as const,
        );
        setSelectedEruType(undefined);
    }, [
        eruId,
        setFieldValue,
    ]);

    const handleSubmit = useCallback((finalValue: BaseFormType) => {
        setValue(finalValue);
        if (isNotDefined(finalValue)) {
            return;
        }
        if (isNotDefined(eruId)) {
            createEruReadiness(finalValue as EruReadinessPostBody);
        } else {
            updateEruReadinessForm(finalValue as EruReadinessBody);
        }
    }, [
        setValue,
        createEruReadiness,
        updateEruReadinessForm,
        eruId,
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

    const disabled = createEruReadinessPending || updateEruReadinessFormPending || eruOwnerPending;

    const handleCancel = useCallback(() => {
        setFieldValue([], 'eru_types');
        setFieldValue(undefined, 'eru_owner');
        setSelectedEruType(undefined);
    }, [
        setFieldValue,
    ]);

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
                        onChange={setFieldValue}
                        value={value.eru_owner}
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
                        value={selectedEruType}
                        keySelector={numericKeySelector}
                        labelSelector={stringValueSelector}
                        onChange={(selected) => {
                            const singleType = Array.isArray(selected) ? selected[0] : selected;
                            handleInputChange(singleType);
                        }}
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
                        title={eruTypesTitleMap}
                        error={getErrorObject(error?.eru_types)}
                    />
                ))}
            </div>
        </Page>
    );
}

Component.displayName = 'EruReadinessForm';
