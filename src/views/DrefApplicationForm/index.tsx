import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { UploadCloudLineIcon } from '@ifrc-go/icons';

import {
    isDefined,
    listToMap,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    PartialForm,
    useForm,
    accumulateErrors,
    getErrorObject,
    ObjectError,
} from '@togglecorp/toggle-form';

import BlockLoading from '#components/BlockLoading';
import Container from '#components/Container';
import NonFieldError from '#components/NonFieldError';
import Page from '#components/Page';
import Tab from '#components/Tabs/Tab';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import TabPanel from '#components/Tabs/TabPanel';
import Button from '#components/Button';
// import FileInput from '#components/FileInput';
import {
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';
import { ymdToDateString } from '#utils/common';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';

// FIXME: this scrollToTop is specific to DREF Form
import scrollToTop from '#utils/scrollToTop';
import { User } from '#components/UserMultiSelectInput';
import GoSingleFileInput from '#components/GoSingleFileInput';

import DrefOverview from './DrefOverview';
import EventDetails from './EventDetails';
import ActionsFields from './ActionsFields';
import Response from './Response';
import Submission from './Submission';
import ObsoletePayloadResolutionModal from './ObsoletePayloadResolutionModal';
import {
    DrefFields,
    DrefApiFields,
    overviewFields,
    eventDetailsFields,
    actionsFields,
    responseFields,
    submissionFields,
    TYPE_IMMINENT,
    TYPE_LOAN,
} from './common';

import useDrefFormOptions, { schema } from './useDrefFormOptions';

import {
    getImportData,
    transformImport,
} from './import';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultFormValues: PartialForm<DrefFields> = {
    planned_interventions: [],
    national_society_actions: [],
    needs_identified: [],
    images_file: [],
    users: [],
    is_assessment_report: false,
};

type StepTypes = 'operationOverview' | 'eventDetails' | 'action' | 'response' | 'submission';

interface Props {
    className?: string;
}

const stepTypesToFieldsMap: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    [key in StepTypes]: (keyof DrefFields)[];
} = {
    operationOverview: overviewFields,
    eventDetails: eventDetailsFields,
    action: actionsFields,
    response: responseFields,
    submission: submissionFields,
};

interface Props {
    className?: string;
}

// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const {
        className,
    } = props;

    const alert = useAlert();
    const { drefId } = useParams();
    const strings = useTranslation(i18n);
    const {
        value,
        error,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValues });

    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});

    const {
        countryOptions,
        disasterCategoryOptions,
        disasterTypeOptions,
        fetchingCountries,
        fetchingDisasterTypes,
        fetchingDrefOptions,
        fetchingUserDetails,
        interventionOptions,
        nationalSocietyOptions,
        needOptions,
        nsActionOptions,
        onsetOptions,
        yesNoOptions,
        userDetails,
        drefTypeOptions,
    } = useDrefFormOptions();

    // const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const [currentStep, setCurrentStep] = useState<StepTypes>('operationOverview');
    const submitButtonLabel = currentStep === 'submission' ? strings.drefFormSaveButtonLabel : strings.drefFormContinueButtonLabel;
    const shouldDisabledBackButton = currentStep === 'operationOverview';
    const [
        showObsoletePayloadResolutionModal,
        setShowObsoletePayloadResolutionModal,
    ] = useState(false);

    const lastModifiedAtRef = useRef<string | undefined>();

    const erroredTabs = useMemo(() => {
        const tabs: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [key in StepTypes]: boolean;
        } = {
            operationOverview: false,
            eventDetails: false,
            action: false,
            response: false,
            submission: false,
        };

        const tabKeys = (Object.keys(tabs)) as StepTypes[];
        tabKeys.forEach((tabKey) => {
            const currentFields = stepTypesToFieldsMap[tabKey];
            const currentFieldsMap = listToMap(currentFields, (d) => d, () => true);

            const erroredFields = Object.keys(getErrorObject(error) ?? {}) as (keyof DrefFields)[];
            const hasError = erroredFields.some((d) => currentFieldsMap[d]);
            tabs[tabKey] = hasError;
        });

        return tabs;
    }, [error]);
    const [userOptions, setUserOptions] = useState<User[]>([]);

    const handleDrefLoad = useCallback((response: DrefApiFields) => {
        lastModifiedAtRef.current = response?.modified_at;
        setUserOptions(response.users_details ?? []);

        /*
        setFileIdToUrlMap((prevMap) => {
            const newMap = {
                ...prevMap,
            };
            if (response.supporting_document_details && response.supporting_document_details) {
                newMap[response.supporting_document_details.id] = response
                    .supporting_document_details.file;
            }
            if (response.assessment_report_details && response.assessment_report_details) {
                newMap[response.assessment_report_details.id] = response
                    .assessment_report_details.file;
            }
            if (response.event_map_file && response.event_map_file.file) {
                newMap[response.event_map_file.id] = response.event_map_file.file;
            }
            if (response.cover_image_file && response.cover_image_file.file) {
                newMap[response.cover_image_file.id] = response.cover_image_file.file;
            }
            if (response.images_file?.length > 0) {
                response.images_file.forEach((img) => {
                    newMap[img.id] = img.file;
                });
            }
            return newMap;
        });
        */

        const getNumberFromResponse = (numberValue: number | string | undefined | null) => {
            if (isNotDefined(numberValue)) {
                return undefined;
            }

            if (numberValue === '') {
                return undefined;
            }

            return +numberValue;
        };

        setValue({
            ...response,
            planned_interventions: response.planned_interventions?.map((pi) => ({
                ...pi,
                clientId: String(pi.id),
                indicators: pi?.indicators?.map((i) => ({
                    ...i,
                    clientId: String(i.id),
                })),
            })),
            national_society_actions: response.national_society_actions?.map((nsa) => ({
                ...nsa,
                clientId: String(nsa.id),
            })),
            needs_identified: response.needs_identified?.map((ni) => ({
                ...ni,
                clientId: String(ni.id),
            })),
            risk_security: response.risk_security?.map((rs) => ({
                ...rs,
                clientId: String(rs.id),
            })),
            images_file: response.images_file?.map((img) => (
                isDefined(img.file)
                    ? ({
                        id: img.id,
                        client_id: img.client_id ?? String(img.id),
                        caption: img.caption ?? '',
                    })
                    : undefined
            )).filter(isDefined),
            disability_people_per: getNumberFromResponse(response.disability_people_per),
            people_per_urban: getNumberFromResponse(response.people_per_urban),
            people_per_local: getNumberFromResponse(response.people_per_local),
            cover_image_file: isDefined(response.cover_image_file?.file)
                ? response.cover_image_file : undefined,
            event_map_file: isDefined(response.event_map_file?.file)
                ? response.event_map_file : undefined,
        });
    }, [setValue]);

    const navigate = useNavigate();

    const {
        pending: drefSubmitPending,
        trigger: submitRequest,
    } = useLazyRequest<DrefApiFields, Partial<DrefApiFields>>({
        url: drefId ? `api/v2/dref/${drefId}/` : 'api/v2/dref/',
        method: drefId ? 'PUT' : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            alert.show(
                strings.drefFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );

            if (!drefId) {
                window.setTimeout(
                    () => navigate(`/dref-application/${response?.id}/edit/`),
                    250,
                );
            } else {
                handleDrefLoad(response);
            }
        },
        onFailure: ({
            value: {
                messageForNotification,
                formErrors,
            },
            debugMessage,
        }) => {
            setError(formErrors);
            if (formErrors.modified_at === 'OBSOLETE_PAYLOAD') {
                // There was a save conflict due to obsolete payload
                setShowObsoletePayloadResolutionModal(true);
            }

            alert.show(
                <p>
                    {strings.drefFormSaveRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const {
        pending: drefApplicationPending,
        response: drefResponse,
    } = useRequest<DrefApiFields>({
        skip: !drefId,
        url: `api/v2/dref/${drefId}/`,
        onSuccess: (response) => {
            handleDrefLoad(response);
        },
        onFailure: ({
            value: { messageForNotification },
            debugMessage,
        }) => {
            alert.show(
                <p>
                    {strings.drefFormLoadRequestFailureMessage}
                    &nbsp;
                    <strong>
                        {messageForNotification}
                    </strong>
                </p>,
                {
                    variant: 'danger',
                    debugMessage,
                },
            );
        },
    });

    const validateCurrentTab = useCallback((exceptions: (keyof DrefFields)[] = []) => {
        const validationError = getErrorObject(accumulateErrors(value, schema, value, undefined));
        const currentFields = stepTypesToFieldsMap[currentStep];
        const exceptionsMap = listToMap(exceptions, (d) => d, () => true);

        if (!validationError) {
            return true;
        }

        const currentTabErrors = listToMap(
            currentFields.filter((field) => (!exceptionsMap[field] && !!validationError?.[field])),
            (field) => field,
            (field) => validationError?.[field],
        ) as ObjectError<DrefFields>;

        const newError: typeof error = {
            ...currentTabErrors,
        };

        setError(newError);

        const hasError = Object.keys(currentTabErrors).some((d) => !!d);
        return !hasError;
    }, [value, currentStep, setError]);

    const handleTabChange = useCallback((newStep: StepTypes) => {
        scrollToTop();
        const isCurrentTabValid = validateCurrentTab(['event_map_file']);

        if (!isCurrentTabValid) {
            return;
        }

        setCurrentStep(newStep);
    }, [validateCurrentTab]);

    const submitDref = useCallback((modifiedAt?: string) => {
        const result = validate();

        if (result.errored) {
            setError(result.error);
        } else if (result.value && userDetails && userDetails.id) {
            const body = {
                user: userDetails.id,
                ...result.value,
                modified_at: modifiedAt ?? lastModifiedAtRef.current,
            };

            submitRequest(body as DrefApiFields);
        }
    }, [submitRequest, validate, userDetails, setError]);

    const handleSubmitButtonClick = useCallback(() => {
        scrollToTop();

        const isCurrentTabValid = validateCurrentTab(['event_map_file']);

        if (!isCurrentTabValid) {
            return;
        }

        if (currentStep === 'submission') {
            submitDref();
        } else {
            const nextStepMap: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                [key in Exclude<StepTypes, 'submission'>]: Exclude<StepTypes, 'operationOverview'>;
            } = {
                operationOverview: 'eventDetails',
                eventDetails: 'action',
                action: 'response',
                response: 'submission',
            };

            handleTabChange(nextStepMap[currentStep]);
        }
    }, [validateCurrentTab, currentStep, handleTabChange, submitDref]);

    const handleLoanSubmitButtonClick = useCallback(() => {
        scrollToTop();

        const isCurrentTabValid = validateCurrentTab(['event_map_file']);

        if (!isCurrentTabValid) {
            return;
        }

        if (currentStep === 'submission') {
            submitDref();
        } else {
            const nextStepMap: Record<Exclude<StepTypes, 'submission'>, Exclude<StepTypes, 'operationOverview'>> = {
                operationOverview: 'eventDetails',
                eventDetails: 'submission',
                action: 'response',
                response: 'action',
            };

            handleTabChange(nextStepMap[currentStep]);
        }
    }, [validateCurrentTab, currentStep, handleTabChange, submitDref]);

    const handleBackButtonClick = useCallback(() => {
        if (currentStep !== 'operationOverview') {
            const prevStepMap: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                [key in Exclude<StepTypes, 'operationOverview'>]: Exclude<StepTypes, 'submission'>;
            } = {
                eventDetails: 'operationOverview',
                action: 'eventDetails',
                response: 'action',
                submission: 'response',
            };

            handleTabChange(prevStepMap[currentStep]);
        }
    }, [handleTabChange, currentStep]);

    const handleLoanBackButtonClick = useCallback(() => {
        if (currentStep !== 'operationOverview') {
            const prevStepMap: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                [key in Exclude<StepTypes, 'operationOverview'>]: Exclude<StepTypes, 'submission'>;
            } = {
                eventDetails: 'operationOverview',
                submission: 'eventDetails',
                response: 'action',
                action: 'response',
            };

            handleTabChange(prevStepMap[currentStep]);
        }
    }, [handleTabChange, currentStep]);

    const pending = fetchingCountries
        || fetchingDisasterTypes
        || fetchingDrefOptions
        || fetchingUserDetails
        || drefSubmitPending
        || drefApplicationPending;

    const drefType = value.type_of_dref;
    const onsetType = value.type_of_onset;

    useEffect(() => {
        setValue((oldValue) => {
            if (value.type_of_dref !== TYPE_IMMINENT) {
                return {
                    ...oldValue,
                    anticipatory_actions: undefined,
                    people_targeted_with_early_actions: undefined,
                };
            }
            if (value.type_of_dref === TYPE_IMMINENT) {
                return {
                    ...oldValue,
                    event_date: undefined,
                };
            }
            return oldValue;
        });
    }, [
        setValue,
        value.type_of_dref,
    ]);

    useEffect(() => {
        setValue((oldValue) => {
            if (value.did_ns_request_fund === false
                || value.did_ns_respond === false
                || value.did_it_affect_same_population === false
                || value.did_it_affect_same_area === false) {
                return {
                    ...oldValue,
                    dref_recurrent_text: undefined,
                };
            }
            return oldValue;
        });
    }, [
        setValue,
        value.did_ns_request_fund,
        value.did_ns_respond,
        value.did_it_affect_same_population,
        value.did_it_affect_same_area,
    ]);

    useEffect(() => {
        if (isDefined(value.date_of_approval) && isDefined(value.operation_timeframe)) {
            const approvalDate = new Date(value.date_of_approval);
            if (!Number.isNaN(approvalDate.getTime())) {
                approvalDate.setMonth(
                    approvalDate.getMonth()
                    + value.operation_timeframe
                    + 1, // To get last day of the month
                );
                approvalDate.setDate(0);

                const yyyy = approvalDate.getFullYear();
                const mm = approvalDate.getMonth();
                const dd = approvalDate.getDate();
                setFieldValue(ymdToDateString(yyyy, mm, dd), 'end_date' as const);
            }
        }
        setFieldValue(value?.num_assisted, 'total_targeted_population');
    }, [
        setFieldValue,
        value.date_of_approval,
        value.operation_timeframe,
        value.num_assisted,
    ]);

    const exportLinkProps = useButtonFeatures({
        variant: 'secondary',
        children: strings.drefFormExportLabel,
    });

    const failedToLoadDref = !pending && isDefined(drefId) && !drefResponse;

    const handleDocumentImport = useCallback(async (newValue: File | undefined) => {
        if (!newValue) {
            return;
        }

        const importData = getImportData(newValue);
        // FIXME: Check if component is still mounted

        if (importData) {
            const safeImportData = transformImport(
                importData,
                countryOptions,
                disasterCategoryOptions,
                disasterTypeOptions,
                onsetOptions,
            );
            setValue(
                (prevValue) => ({
                    ...prevValue,
                    ...safeImportData,
                }),
            );
        }
    }, [
        countryOptions,
        disasterTypeOptions,
        disasterCategoryOptions,
        onsetOptions,
        setValue,
    ]);

    const handleObsoletePayloadResolutionOverwiteButtonClick = useCallback(
        (newModifiedAt: string | undefined) => {
            setShowObsoletePayloadResolutionModal(false);
            submitDref(newModifiedAt);
        },
        [submitDref],
    );

    const handleObsoletePayloadResolutionCancelButtonClick = useCallback(() => {
        setShowObsoletePayloadResolutionModal(false);
    }, []);

    return (
        <Tabs
            disabled={failedToLoadDref}
            onChange={handleTabChange}
            value={currentStep}
            variant="step"
        >
            <Page
                className={className}
                actions={(
                    <>
                        {/* isNotDefined(drefId) && drefType !== TYPE_LOAN && (
                            <FileInput
                                type='file'
                                accept='.docx'
                                name="dref-docx-import"
                                value={undefined}
                                onChange={handleDocumentImport}
                                icons={<IoCloudUploadSharp />}
                                buttonVariant="secondary"
                            >
                                Import from Document
                            </FileInput>
                        ) */}
                        {isNotDefined(drefId) && drefType !== TYPE_LOAN && (
                            <GoSingleFileInput
                                name="dref-docx-import"
                                accept=".docx"
                                onChange={handleDocumentImport}
                                url="api/v2/dref-files/"
                                icons={<UploadCloudLineIcon />}
                                value={undefined}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                            >
                                {strings.drefFormImportFromDocument}
                            </GoSingleFileInput>
                        )}
                        {isDefined(drefId) && (
                            <Link
                                to={`/dref-application/${drefId}/export/`}
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...exportLinkProps}
                            />
                        )}
                        <Button
                            name={undefined}
                            onClick={submitDref}
                        >
                            {strings.drefFormSaveButtonLabel}
                        </Button>
                    </>
                )}
                title={strings.drefFormPageTitle}
                heading={strings.drefFormPageHeading}
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="operationOverview"
                            step={1}
                            errored={erroredTabs.operationOverview}
                        >
                            {strings.drefFormTabOperationOverviewLabel}
                        </Tab>
                        <Tab
                            name="eventDetails"
                            step={2}
                            errored={erroredTabs.eventDetails}
                        >
                            {strings.drefFormTabEventDetailLabel}
                        </Tab>
                        {drefType !== TYPE_LOAN && (
                            <Tab
                                name="action"
                                step={3}
                                errored={erroredTabs.action}
                            >
                                {strings.drefFormTabActionsLabel}
                            </Tab>
                        )}
                        {drefType !== TYPE_LOAN && (
                            <Tab
                                name="response"
                                step={4}
                                errored={erroredTabs.response}
                            >
                                {strings.drefFormTabResponseLabel}
                            </Tab>
                        )}
                        <Tab
                            name="submission"
                            step={5}
                            errored={erroredTabs.submission}
                        >
                            {strings.drefFormTabSubmissionLabel}
                        </Tab>
                    </TabList>
                )}
            >
                {pending && (
                    <Container>
                        <BlockLoading />
                    </Container>
                )}
                {failedToLoadDref && (
                    <Container
                        childrenContainerClassName={styles.errorMessage}
                    >
                        <h3>
                            {strings.drefFormLoadErrorTitle}
                        </h3>
                        <p>
                            {strings.drefFormLoadErrorDescription}
                        </p>
                        <p>
                            {strings.drefFormLoadErrorHelpText}
                        </p>
                    </Container>
                )}
                {!pending && !failedToLoadDref && (
                    <>
                        <Container>
                            <NonFieldError
                                error={error}
                                message={strings.drefFormFieldGeneralError}
                            />
                        </Container>
                        <TabPanel name="operationOverview">
                            <DrefOverview
                                error={error}
                                onValueChange={setFieldValue}
                                value={value}
                                yesNoOptions={yesNoOptions}
                                disasterTypeOptions={disasterTypeOptions}
                                onsetOptions={onsetOptions}
                                disasterCategoryOptions={disasterCategoryOptions}
                                countryOptions={countryOptions}
                                nationalSocietyOptions={nationalSocietyOptions}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                                onValueSet={setValue}
                                onCreateAndShareButtonClick={submitDref}
                                drefTypeOptions={drefTypeOptions}
                                onsetType={onsetType}
                                drefType={drefType}
                                userOptions={userOptions}
                            />
                        </TabPanel>
                        <TabPanel name="eventDetails">
                            <EventDetails
                                onsetType={onsetType}
                                drefType={drefType}
                                error={error}
                                onValueChange={setFieldValue}
                                value={value}
                                yesNoOptions={yesNoOptions}
                                fileIdToUrlMap={fileIdToUrlMap}
                                setFileIdToUrlMap={setFileIdToUrlMap}
                            />
                        </TabPanel>
                        {drefType !== TYPE_LOAN && (
                            <TabPanel name="action">
                                <ActionsFields
                                    error={error}
                                    onValueChange={setFieldValue}
                                    value={value}
                                    yesNoOptions={yesNoOptions}
                                    needOptions={needOptions}
                                    nsActionOptions={nsActionOptions}
                                    fileIdToUrlMap={fileIdToUrlMap}
                                    setFileIdToUrlMap={setFileIdToUrlMap}
                                    drefType={drefType}
                                />
                            </TabPanel>
                        )}
                        {drefType !== TYPE_LOAN && (
                            <TabPanel name="response">
                                <Response
                                    interventionOptions={interventionOptions}
                                    error={error}
                                    onValueChange={setFieldValue}
                                    value={value}
                                    fileIdToUrlMap={fileIdToUrlMap}
                                    setFileIdToUrlMap={setFileIdToUrlMap}
                                    yesNoOptions={yesNoOptions}
                                    drefType={drefType}
                                />
                            </TabPanel>
                        )}
                        <TabPanel name="submission">
                            <Submission
                                error={error}
                                onValueChange={setFieldValue}
                                drefType={drefType}
                                value={value}
                            />
                        </TabPanel>
                        {drefType !== TYPE_LOAN && (
                            <div className={styles.actions}>
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handleBackButtonClick}
                                    disabled={shouldDisabledBackButton}
                                >
                                    {strings.drefFormBackButtonLabel}
                                </Button>
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handleSubmitButtonClick}
                                >
                                    {submitButtonLabel}
                                </Button>
                            </div>
                        )}
                        {drefType === TYPE_LOAN && (
                            <div className={styles.actions}>
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handleLoanBackButtonClick}
                                    disabled={shouldDisabledBackButton}
                                >
                                    {strings.drefFormBackButtonLabel}
                                </Button>
                                <Button
                                    name={undefined}
                                    variant="secondary"
                                    onClick={handleLoanSubmitButtonClick}
                                >
                                    {submitButtonLabel}
                                </Button>
                            </div>
                        )}
                        {isDefined(drefId) && showObsoletePayloadResolutionModal && (
                            <ObsoletePayloadResolutionModal
                                drefId={+drefId}
                                onOverwriteButtonClick={
                                    handleObsoletePayloadResolutionOverwiteButtonClick
                                }
                                onCancelButtonClick={
                                    handleObsoletePayloadResolutionCancelButtonClick
                                }
                            />
                        )}
                    </>
                )}
            </Page>
        </Tabs>
    );
}

Component.displayName = 'DrefApplicationForm';
