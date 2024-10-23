import {
    type ElementRef,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
import {
    DownloadTwoLineIcon,
    ErrorWarningFillIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import type { ButtonProps } from '@ifrc-go/ui';
import {
    Button,
    Message,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    injectClientId,
    isSimilarArray,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    removeNull,
    useForm,
} from '@togglecorp/toggle-form';

import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import DrefExportModal from '#components/domain/DrefExportModal';
import DrefShareModal from '#components/domain/DrefShareModal';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import { type User } from '#components/domain/UserSearchMultiSelectInput';
import Link from '#components/Link';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import {
    type GoApiResponse,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import {
    matchArray,
    NUM,
    transformObjectError,
} from '#utils/restRequest/error';

import Actions from './Actions';
import {
    checkTabErrors,
    TYPE_LOAN,
    type TypeOfDrefEnum,
} from './common';
import EventDetail from './EventDetail';
import ObsoletePayloadModal from './ObsoletePayloadModal';
import Operation from './Operation';
import Overview from './Overview';
import opsUpdateSchema, { type OpsUpdateRequestBody } from './schema';
import Submission from './Submission';

import i18n from './i18n.json';
import styles from './styles.module.css';

type GetOpsUpdateResponse = GoApiResponse<'/api/v2/dref-op-update/{id}/'>;

export type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';

function getNextStep(current: TabKeys, direction: 1 | -1, typeOfDref: TypeOfDrefEnum | undefined) {
    if (typeOfDref === TYPE_LOAN && direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            overview: 'eventDetail',
            eventDetail: 'submission',
        };
        return mapping[current];
    }
    if (typeOfDref === TYPE_LOAN && direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            submission: 'eventDetail',
            eventDetail: 'overview',
        };
        return mapping[current];
    }
    if (direction === 1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            overview: 'eventDetail',
            eventDetail: 'actions',
            actions: 'operation',
            operation: 'submission',
        };
        return mapping[current];
    }
    if (direction === -1) {
        const mapping: { [key in TabKeys]?: TabKeys } = {
            submission: 'operation',
            operation: 'actions',
            actions: 'eventDetail',
            eventDetail: 'overview',
        };
        return mapping[current];
    }
    return undefined;
}

export function Component() {
    const { opsUpdateId } = useParams<{ opsUpdateId: string }>();

    const alert = useAlert();
    const strings = useTranslation(i18n);

    const formContentRef = useRef<ElementRef<'div'>>(null);

    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const [drefUsers, setDrefUsers] = useInputState<User[] | undefined | null>([]);
    const [
        showObsoletePayloadModal,
        setShowObsoletePayloadModal,
    ] = useState(false);
    const currentLanguage = useCurrentLanguage();
    const [districtOptions, setDistrictOptions] = useState<
        DistrictItem[] | undefined | null
    >([]);
    const [showShareModal, {
        setTrue: setShowShareModalTrue,
        setFalse: setShowShareModalFalse,
    }] = useBooleanState(false);
    const [showExportModal, {
        setTrue: setShowExportModalTrue,
        setFalse: setShowExportModalFalse,
    }] = useBooleanState(false);
    const lastModifiedAtRef = useRef<string | undefined>();

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(
        opsUpdateSchema,
        {
            value: {
                planned_interventions: [],
                national_society_actions: [],
                needs_identified: [],
                images_file: [],
                // is_assessment_report: false,
                changing_timeframe_operation: false,
                changing_operation_strategy: false,
                changing_target_population_of_operation: false,
                changing_geographic_location: false,
                changing_budget: false,
                request_for_second_allocation: false,
                has_forecasted_event_materialize: false,
            },
        },
    );

    const handleOpsUpdateLoad = useCallback(
        (response: GetOpsUpdateResponse) => {
            lastModifiedAtRef.current = response?.modified_at;

            setFileIdToUrlMap((prevMap) => {
                const newMap = {
                    ...prevMap,
                };

                if (
                    response.budget_file_details
                    && response.budget_file_details.file
                ) {
                    newMap[response.budget_file_details.id] = response.budget_file_details.file;
                }
                if (
                    response.assessment_report_details
                    && response.assessment_report_details.file
                ) {
                    newMap[
                        response.assessment_report_details.id
                    ] = response.assessment_report_details.file;
                }
                if (
                    response.event_map_file
                    && response.event_map_file.file
                ) {
                    newMap[response.event_map_file.id] = response.event_map_file.file;
                }
                if (
                    response.cover_image_file
                    && response.cover_image_file.file
                ) {
                    newMap[response.cover_image_file.id] = response.cover_image_file.file;
                }
                if ((response.photos_file?.length ?? 0) > 0) {
                    response.photos_file?.forEach((img) => {
                        if (isDefined(img.file)) {
                            newMap[img.id] = img.file;
                        }
                    });
                }
                if ((response.images_file?.length ?? 0) > 0) {
                    response.images_file?.forEach((img) => {
                        if (isDefined(img.file)) {
                            newMap[img.id] = img.file;
                        }
                    });
                }
                return newMap;
            });
        },
        [],
    );

    const {
        pending: fetchingOpsUpdate,
        response: opsUpdateResponse,
        error: opsUpdateResponseError,
    } = useRequest({
        url: '/api/v2/dref-op-update/{id}/',
        skip: isFalsyString(opsUpdateId),
        pathVariables: isDefined(opsUpdateId) ? {
            id: opsUpdateId,
        } : undefined,
        onSuccess: (response) => {
            handleOpsUpdateLoad(response);

            const {
                planned_interventions,
                needs_identified,
                national_society_actions,
                risk_security,
                event_map_file,
                cover_image_file,
                images_file,
                photos_file,
                changing_timeframe_operation,
                changing_operation_strategy,
                changing_target_population_of_operation,
                changing_geographic_location,
                changing_budget,
                request_for_second_allocation,
                has_forecasted_event_materialize,
                source_information,
                // disability_people_per,
                // people_per_urban,
                // people_per_local,

                // is_assessment_report,
                ...otherValues
            } = removeNull(response);
            setValue({
                ...otherValues,
                planned_interventions: planned_interventions?.map(
                    (intervention) => ({
                        ...injectClientId(intervention),
                        indicators: intervention.indicators?.map(injectClientId),
                        // FIXME: This should be named budget_details
                        // Do we need in the form?
                        budget_file_details: undefined,
                    }),
                ),
                needs_identified: needs_identified?.map(injectClientId),
                national_society_actions: national_society_actions?.map(injectClientId),
                risk_security: risk_security?.map(injectClientId),
                event_map_file: isDefined(event_map_file)
                    ? injectClientId(event_map_file)
                    : undefined,
                cover_image_file: isDefined(cover_image_file)
                    ? injectClientId(cover_image_file)
                    : undefined,
                images_file: images_file?.map(injectClientId),
                photos_file: photos_file?.map(injectClientId),

                // is_assessment_report: is_assessment_report ?? false,
                changing_timeframe_operation: changing_timeframe_operation ?? false,
                changing_operation_strategy: changing_operation_strategy ?? false,
                // eslint-disable-next-line max-len
                changing_target_population_of_operation: changing_target_population_of_operation ?? false,
                changing_geographic_location: changing_geographic_location ?? false,
                changing_budget: changing_budget ?? false,
                request_for_second_allocation: request_for_second_allocation ?? false,
                has_forecasted_event_materialize: has_forecasted_event_materialize ?? false,
                source_information: source_information?.map(injectClientId),
            });

            setDistrictOptions(response.district_details);
        },
    });

    const drefId = opsUpdateResponse?.dref;

    const {
        pending: fetchingDref,
        response: drefResponse,
    } = useRequest({
        url: '/api/v2/dref/{id}/',
        pathVariables: isDefined(drefId) ? {
            id: String(drefId),
        } : undefined,
        skip: isNotDefined(drefId),
    });

    const prevOperationalUpdateId = useMemo(() => {
        const currentOpsUpdate = drefResponse
            ?.operational_update_details
            ?.find((ou) => !ou.is_published);

        if (isNotDefined(currentOpsUpdate)) {
            return undefined;
        }

        const prevOpsUpdateNumber = (currentOpsUpdate.operational_update_number ?? 0) - 1;
        const prevOpsUpdate = drefResponse
            ?.operational_update_details
            ?.find((ou) => ou.operational_update_number === prevOpsUpdateNumber);

        return prevOpsUpdate?.id;
    }, [drefResponse]);

    const {
        pending: fetchingPrevOpsUpdate,
        response: prevOpsUpdateResponse,
    } = useRequest({
        url: '/api/v2/dref-op-update/{id}/',
        skip: isFalsyString(prevOperationalUpdateId),
        pathVariables: isDefined(prevOperationalUpdateId) ? {
            id: String(prevOperationalUpdateId),
        } : undefined,
    });

    const {
        pending: updateOpsUpdatePending,
        trigger: updateOpsUpdate,
    } = useLazyRequest({
        url: '/api/v2/dref-op-update/{id}/',
        method: 'PATCH',
        pathVariables: isDefined(opsUpdateId) ? { id: opsUpdateId } : undefined,
        body: (formFields: OpsUpdateRequestBody) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.formSaveRequestSuccessMessage,
                { variant: 'success' },
            );
            handleOpsUpdateLoad(response);
        },
        onFailure: ({
            value: { formErrors, messageForNotification },
            debugMessage,
        }) => {
            setError(transformObjectError(
                formErrors,
                (locations) => {
                    let match = matchArray(locations, ['images_file', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.images_file?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['national_society_actions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.national_society_actions?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['needs_identified', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.needs_identified?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['risk_security', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.risk_security?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['planned_interventions', NUM, 'indicators', NUM]);
                    if (isDefined(match)) {
                        const [planned_intervention_index, index] = match;
                        // eslint-disable-next-line max-len
                        return value?.planned_interventions?.[planned_intervention_index]?.indicators?.[index]?.client_id;
                    }
                    match = matchArray(locations, ['planned_interventions', NUM]);
                    if (isDefined(match)) {
                        const [index] = match;
                        return value?.planned_interventions?.[index]?.client_id;
                    }
                    return undefined;
                },
            ));

            const modifiedAtError = formErrors.modified_at;
            if (
                (typeof modifiedAtError === 'string' && modifiedAtError === 'OBSOLETE_PAYLOAD')
                || (Array.isArray(modifiedAtError) && modifiedAtError.includes('OBSOLETE_PAYLOAD'))
            ) {
                setShowObsoletePayloadModal(true);
            }

            alert.show(
                strings.formSaveRequestFailureMessage,
                {
                    variant: 'danger',
                    description: messageForNotification,
                    debugMessage,
                },
            );
        },
    });

    const {
        retrigger: getDrefUsers,
    } = useRequest({
        skip: isNotDefined(drefId),
        url: '/api/v2/dref-share-user/{id}/',
        pathVariables: { id: Number(drefId) },
        onSuccess: (response) => {
            setDrefUsers(response.users_details);
        },
    });

    const handleFormSubmit = useCallback(
        (modifiedAt?: string) => {
            formContentRef.current?.scrollIntoView();

            // FIXME: use createSubmitHandler
            const result = validate();
            if (result.errored) {
                setError(result.error);
                return;
            }

            updateOpsUpdate({
                ...result.value,
                modified_at: modifiedAt ?? lastModifiedAtRef.current,
            } as OpsUpdateRequestBody);
        },
        [validate, setError, updateOpsUpdate],
    );

    const handleObsoletePayloadOverwiteButtonClick = useCallback(
        (newModifiedAt: string | undefined) => {
            setShowObsoletePayloadModal(false);
            // FIXME: Why not just set lastModifiedAtRef.current,
            handleFormSubmit(newModifiedAt);
        },
        [handleFormSubmit],
    );

    const handleTabChange = useCallback((newTab: TabKeys) => {
        formContentRef.current?.scrollIntoView();
        setActiveTab(newTab);
    }, []);

    const nextStep = getNextStep(activeTab, 1, value.type_of_dref);
    const prevStep = getNextStep(activeTab, -1, value.type_of_dref);

    const operationTimeframeWarning = useMemo(
        () => {
            if (value.type_of_dref === TYPE_LOAN) {
                return undefined;
            }

            const currentValue = value.total_operation_timeframe;
            const prevValue = prevOpsUpdateResponse?.total_operation_timeframe
                ?? drefResponse?.operation_timeframe;

            if (
                value.changing_timeframe_operation
                && currentValue === prevValue
            ) {
                return strings.drefOperationalUpdateFormTimeframe;
            }

            if (
                !value.changing_timeframe_operation
                && currentValue !== prevValue
            ) {
                return strings.drefOperationalUpdateFormOperationTimeframe;
            }

            return undefined;
        },
        [
            strings.drefOperationalUpdateFormTimeframe,
            strings.drefOperationalUpdateFormOperationTimeframe,
            value.total_operation_timeframe,
            value.changing_timeframe_operation,
            value.type_of_dref,
            drefResponse,
            prevOpsUpdateResponse,
        ],
    );

    const budgetWarning = useMemo(
        () => {
            if (isDefined(value.additional_allocation) && value.additional_allocation > 0) {
                if (!value.changing_budget || !value.request_for_second_allocation) {
                    return strings.drefOperationAdditionalBudget;
                }
            } else if (value.changing_budget || value.request_for_second_allocation) {
                return strings.drefOperationAdditionalAllocation;
            }

            return undefined;
        },
        [
            strings.drefOperationAdditionalBudget,
            strings.drefOperationAdditionalAllocation,
            value.request_for_second_allocation,
            value.changing_budget,
            value.additional_allocation,
        ],
    );

    const geoWarning = useMemo(
        () => {
            const prevValue = prevOpsUpdateResponse?.district ?? drefResponse?.district;
            const currentValue = value.district;
            const areDistrictsSimilar = isSimilarArray(currentValue, prevValue);

            if (value.changing_geographic_location && areDistrictsSimilar) {
                return strings.drefOperationSelectDistrict;
            }

            if (!value.changing_geographic_location && !areDistrictsSimilar) {
                return strings.drefOperationSelectLocation;
            }

            return undefined;
        },
        [
            strings.drefOperationSelectDistrict,
            strings.drefOperationSelectLocation,
            value.district,
            value.changing_geographic_location,
            prevOpsUpdateResponse,
            drefResponse,
        ],
    );

    const peopleTargetedWarning = useMemo(
        () => {
            const prevValue = prevOpsUpdateResponse?.total_targeted_population
                ?? drefResponse?.total_targeted_population;
            const currentValue = value.total_targeted_population;

            if (value.changing_target_population_of_operation && currentValue === prevValue) {
                return strings.drefOperationTargetedPopulation;
            }

            if (!value.changing_target_population_of_operation && currentValue !== prevValue) {
                return strings.drefOperationChangingTargetPopulation;
            }

            return undefined;
        },
        [
            strings.drefOperationTargetedPopulation,
            strings.drefOperationChangingTargetPopulation,
            value.total_targeted_population,
            value.changing_target_population_of_operation,
            prevOpsUpdateResponse,
            drefResponse,
        ],
    );

    const handleShareClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        () => {
            setShowShareModalTrue();
        },
        [setShowShareModalTrue],
    );
    const handleExportClick: NonNullable<ButtonProps<undefined>['onClick']> = useCallback(
        () => {
            setShowExportModalTrue();
        },
        [setShowExportModalTrue],
    );

    const handleUserShareSuccess = useCallback(() => {
        setShowShareModalFalse();
        getDrefUsers();
    }, [
        getDrefUsers,
        setShowShareModalFalse,
    ]);

    const hasAnyWarning = isTruthyString(peopleTargetedWarning)
        || isTruthyString(operationTimeframeWarning)
        || isTruthyString(budgetWarning)
        || isTruthyString(geoWarning);

    const disabled = fetchingOpsUpdate
        || updateOpsUpdatePending
        || fetchingDref
        || fetchingPrevOpsUpdate;

    const languageMismatch = isDefined(opsUpdateId)
        && isDefined(drefResponse)
        && currentLanguage !== opsUpdateResponse?.translation_module_original_language;
    const shouldHideForm = languageMismatch
        || fetchingOpsUpdate
        || isDefined(opsUpdateResponseError);

    return (
        <Tabs
            value={activeTab}
            // NOTE: not using handleTabChange here
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                elementRef={formContentRef}
                className={styles.drefOperationalUpdateForm}
                title={strings.formPageTitle}
                heading={strings.formPageHeading}
                description={(
                    <Link
                        href="https://forms.office.com/e/wFQsu0V7Zb"
                        variant="tertiary"
                        external
                        withLinkIcon
                        withUnderline
                    >
                        {strings.drefFeedbackForm}
                    </Link>
                )}
                actions={(
                    <>
                        {isTruthyString(opsUpdateId) && (
                            <>
                                <Button
                                    name={undefined}
                                    onClick={handleShareClick}
                                    disabled={isNotDefined(drefId)}
                                    icons={<ShareLineIcon />}
                                    variant="secondary"
                                >
                                    {strings.formShareButtonLabel}
                                </Button>
                                <Button
                                    name={undefined}
                                    onClick={handleExportClick}
                                    icons={<DownloadTwoLineIcon />}
                                    variant="secondary"
                                >
                                    {strings.formExportLabel}
                                </Button>
                            </>
                        )}
                        <Button
                            name={undefined}
                            onClick={handleFormSubmit}
                            disabled={disabled}
                        >
                            {strings.formSaveButtonLabel}
                        </Button>
                    </>
                )}
                info={!shouldHideForm && (
                    <TabList className={styles.tabList}>
                        <Tab
                            name="overview"
                            step={1}
                            errored={checkTabErrors(formError, 'overview')}
                        >
                            {strings.formTabOverviewLabel}
                        </Tab>
                        <Tab
                            name="eventDetail"
                            step={2}
                            errored={checkTabErrors(formError, 'eventDetail')}
                        >
                            {strings.formTabEventDetailLabel}
                        </Tab>
                        {value.type_of_dref !== TYPE_LOAN && (
                            <Tab
                                name="actions"
                                step={3}
                                errored={checkTabErrors(formError, 'actions')}
                            >
                                {strings.formTabActionsLabel}
                            </Tab>
                        )}
                        {value.type_of_dref !== TYPE_LOAN && (
                            <Tab
                                name="operation"
                                step={4}
                                errored={checkTabErrors(formError, 'operation')}
                            >
                                {strings.formTabOperationLabel}
                            </Tab>
                        )}
                        <Tab
                            name="submission"
                            step={value.type_of_dref === TYPE_LOAN ? 3 : 5}
                            errored={checkTabErrors(formError, 'submission')}
                        >
                            {strings.formTabSubmissionLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
            >
                {fetchingOpsUpdate && (
                    <Message
                        pending
                        title={strings.formLoadingMessage}
                    />
                )}
                {languageMismatch && (
                    <LanguageMismatchMessage
                        title={strings.formNotAvailableInSelectedLanguageMessage}
                        originalLanguage={drefResponse.translation_module_original_language}
                    />
                )}
                {isDefined(opsUpdateResponseError) && (
                    <Message
                        variant="error"
                        title={strings.formLoadErrorTitle}
                        description={opsUpdateResponseError.value.messageForNotification}
                        actions={strings.formLoadErrorHelpText}
                    />
                )}
                {!shouldHideForm && (
                    <>
                        <NonFieldError
                            error={formError}
                            withFallbackError
                        />
                        {hasAnyWarning && (
                            <div className={styles.warnings}>
                                {operationTimeframeWarning && (
                                    <div className={styles.warning}>
                                        <ErrorWarningFillIcon className={styles.icon} />
                                        {operationTimeframeWarning}
                                    </div>
                                )}
                                {budgetWarning && (
                                    <div className={styles.warning}>
                                        <ErrorWarningFillIcon className={styles.icon} />
                                        {budgetWarning}
                                    </div>
                                )}
                                {geoWarning && (
                                    <div className={styles.warning}>
                                        <ErrorWarningFillIcon className={styles.icon} />
                                        {geoWarning}
                                    </div>
                                )}
                                {peopleTargetedWarning && (
                                    <div className={styles.warning}>
                                        <ErrorWarningFillIcon className={styles.icon} />
                                        {peopleTargetedWarning}
                                    </div>
                                )}
                            </div>
                        )}
                        <TabPanel name="overview">
                            <Overview
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                                districtOptions={districtOptions}
                                drefUsers={drefUsers}
                                setDistrictOptions={setDistrictOptions}
                            />
                        </TabPanel>
                        <TabPanel name="eventDetail">
                            <EventDetail
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <TabPanel name="actions">
                            <Actions
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <TabPanel name="operation">
                            <Operation
                                value={value}
                                setFieldValue={setFieldValue}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <TabPanel name="submission">
                            <Submission
                                value={value}
                                setFieldValue={setFieldValue}
                                error={formError}
                                disabled={disabled}
                            />
                        </TabPanel>
                        <div className={styles.actions}>
                            <div className={styles.pageActions}>
                                <Button
                                    name={prevStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(prevStep)}
                                    variant="secondary"
                                >
                                    {strings.formBackButtonLabel}
                                </Button>
                                <Button
                                    name={nextStep ?? activeTab}
                                    onClick={handleTabChange}
                                    disabled={isNotDefined(nextStep)}
                                    variant="secondary"
                                >
                                    {strings.formContinueButtonLabel}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
                {isTruthyString(opsUpdateId) && showObsoletePayloadModal && (
                    <ObsoletePayloadModal
                        opsUpdateId={+opsUpdateId}
                        onOverwriteButtonClick={handleObsoletePayloadOverwiteButtonClick}
                        onCancelButtonClick={setShowObsoletePayloadModal}
                    />
                )}
                {showShareModal && isDefined(drefId) && (
                    <DrefShareModal
                        onCancel={setShowShareModalFalse}
                        onSuccess={handleUserShareSuccess}
                        drefId={drefId}
                    />
                )}
                {showExportModal && isDefined(opsUpdateId) && (
                    <DrefExportModal
                        onCancel={setShowExportModalFalse}
                        id={Number(opsUpdateId)}
                        applicationType="OPS_UPDATE"
                    />
                )}
            </Page>
        </Tabs>
    );
}
