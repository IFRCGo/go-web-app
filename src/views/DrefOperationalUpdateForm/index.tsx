import {
    useState,
    useCallback,
    useRef,
    useMemo,
    type ElementRef,
} from 'react';
import {
    useParams,
} from 'react-router-dom';
import { ErrorWarningFillIcon } from '@ifrc-go/icons';
import {
    useForm,
    removeNull,
} from '@togglecorp/toggle-form';
import {
    isFalsyString,
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';

import Page from '#components/Page';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';
import Button from '#components/Button';
import NonFieldError from '#components/NonFieldError';
import Message from '#components/Message';
import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';
import LanguageMismatchMessage from '#components/domain/LanguageMismatchMessage';
import { type Props as ButtonProps } from '#components/Button';
import {
    useRequest,
    useLazyRequest,
    type GoApiResponse,
} from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import useBooleanState from '#hooks/useBooleanState';
import { injectClientId, isSimilarArray } from '#utils/common';
import { transformObjectError } from '#utils/restRequest/error';
import useCurrentLanguage from '#hooks/domain/useCurrentLanguage';

import opsUpdateSchema, {
    type OpsUpdateRequestBody,
} from './schema';
import {
    checkTabErrors,
    TYPE_LOAN,
    type TypeOfDrefEnum,
} from './common';
import DrefShareModal from '../AccountDrefApplications/DrefTableActions/DrefShareModal';
import Overview from './Overview';
import EventDetail from './EventDetail';
import Actions from './Actions';
import Operation from './Operation';
import Submission from './Submission';
import ObsoletePayloadModal from './ObsoletePayloadModal';
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

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { opsUpdateId } = useParams<{ opsUpdateId: string }>();

    const alert = useAlert();
    const strings = useTranslation(i18n);

    const formContentRef = useRef<ElementRef<'div'>>(null);

    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
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
        method: 'PUT',
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
            // FIXME:
            // getKey for (not updated)
            // 1. national_society_actions
            // 2. risk_security
            // 3. planned_interventions
            // 4. indicators
            // 5. images_file
            // 6. needs_identified
            setError(transformObjectError(formErrors, () => undefined));

            /*
            FIXME: this should be an array
            if (formErrors.modified_at === 'OBSOLETE_PAYLOAD') {
                setShowObsoletePayloadModal(true);
            }
            */

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

            if (value.changing_timeframe_operation && currentValue === prevValue) {
                // FIXME: use translations
                return 'Please select a different timeframe when selected yes on changing the operation timeframe';
            }

            if (
                value.total_operation_timeframe !== prevValue
                && value.changing_timeframe_operation
            ) {
                // FIXME: use translations
                return 'Please select yes on changing the operation timeframe';
            }

            return undefined;
        },
        [
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
                    // FIXME: use translations
                    return 'When requesting for additional budget allocation, the fields "Are you making changes to the budget" and "Is this a request for a second allocation" both should be marked "Yes" in "Event Details" section';
                }
            } else if (value.changing_budget || value.request_for_second_allocation) {
                // FIXME: use translations
                return 'The field "Additional Allocation Requested" should be filled in "Operation Overview" section to change the budget or for a second allocation';
            }

            return undefined;
        },
        [
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
                // FIXME: use translations
                return 'Please select a different district when selected yes on changing geographic location';
            }

            if (!value.changing_geographic_location && !areDistrictsSimilar) {
                // FIXME: use translations
                return 'Please select yes on changing geographic location';
            }

            return undefined;
        },
        [
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
                // FIXME: use translations
                return 'Please select a different value for targeted population when selected yes on changing target population';
            }

            if (!value.changing_target_population_of_operation && currentValue !== prevValue) {
                // FIXME: use translations
                return 'Please select yes on changing target population';
            }

            return undefined;
        },
        [
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
                className={styles.drefApplicationForm}
                title={strings.formPageTitle}
                heading={strings.formPageHeading}
                actions={isTruthyString(opsUpdateId) && (
                    <Button
                        name={undefined}
                        onClick={handleShareClick}
                        disabled={isNotDefined(drefId)}
                    >
                        {strings.formShareButtonLabel}
                    </Button>
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
                            message={strings.formGeneralError}
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
                            <Button
                                name={undefined}
                                onClick={handleFormSubmit}
                                disabled={activeTab !== 'submission' || disabled}
                            >
                                {strings.formSubmitButtonLabel}
                            </Button>
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
                        onSuccess={setShowShareModalFalse}
                        drefId={drefId}
                    />
                )}
            </Page>
        </Tabs>
    );
}
