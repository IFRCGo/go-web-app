import {
    useState,
    useCallback,
    useContext,
    useRef,
} from 'react';
import {
    generatePath,
    useNavigate,
    useParams,
} from 'react-router-dom';
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
import RawFileInput from '#components/RawFileInput';
import NonFieldError from '#components/NonFieldError';

import { useRequest, useLazyRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import RouteContext from '#contexts/route';
import { paths } from '#generated/types';

import type { PartialDref } from './schema';
import drefSchema from './schema';
import Overview from './Overview';
import EventDetail from './EventDetail';
import Actions from './Actions';
import Operation from './Operation';
import Submission from './Submission';
import ObsoletePayloadModal from './ObsoletePayloadModal';

import type { TabKeys } from './common';
import {
    getNextStep,
    getPreviousStep,
    tabStepMap,
    checkTabErrors,
    TYPE_LOAN,
} from './common';
import { getImportData } from './import';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetDref = paths['/api/v2/dref/{id}/']['get'];
type GetDrefResponse = GetDref['responses']['200']['content']['application/json'];

type PutDref = paths['/api/v2/dref/{id}/']['put'];
type PutDrefResponse = PutDref['responses']['200']['content']['application/json'];

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { drefId } = useParams<{ drefId: string }>();
    const alert = useAlert();
    const navigate = useNavigate();
    const {
        drefApplicationForm: drefApplicationFormRoute,
    } = useContext(RouteContext);
    const strings = useTranslation(i18n);
    const [activeTab, setActiveTab] = useState<TabKeys>('overview');
    const [fileIdToUrlMap, setFileIdToUrlMap] = useState<Record<number, string>>({});
    const [
        showObsoletePayloadModal,
        setShowObsoletePayloadModal,
    ] = useState(false);
    const lastModifiedAtRef = useRef<string | undefined>();

    const {
        value,
        error: formError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(
        drefSchema,
        {
            value: { },
        },
    );

    const handleDrefLoad = useCallback(
        (response: GetDrefResponse) => {
            lastModifiedAtRef.current = response?.modified_at;

            setFileIdToUrlMap((prevMap) => {
                const newMap = {
                    ...prevMap,
                };

                if (response.supporting_document_details
                    && response.supporting_document_details.file) {
                    newMap[
                        response.supporting_document_details.id
                    ] = response.supporting_document_details.file;
                }
                if (response.assessment_report_details && response.assessment_report_details.file) {
                    newMap[
                        response.assessment_report_details.id
                    ] = response.assessment_report_details.file;
                }
                if (response.event_map_file && response.event_map_file.file) {
                    newMap[response.event_map_file.id] = response.event_map_file.file;
                }
                if (response.cover_image_file && response.cover_image_file.file) {
                    newMap[response.cover_image_file.id] = response.cover_image_file.file;
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

    const { pending: fetchingDref } = useRequest<GetDrefResponse>({
        skip: isFalsyString(drefId),
        url: `api/v2/dref/${drefId}`,
        onSuccess: (response) => {
            handleDrefLoad(response);
            const {
                planned_interventions,
                needs_identified,
                national_society_actions,
                risk_security,
                event_map_file,
                cover_image_file,
                images_file,
                ...otherValues
            } = removeNull(response);

            function injectClientId<V extends { id: number }>(obj: V): (V & { client_id: string }) {
                return {
                    ...obj,
                    client_id: String(obj.id),
                };
            }

            setValue({
                ...otherValues,
                planned_interventions: planned_interventions?.map(
                    (intervention) => ({
                        ...injectClientId(intervention),
                        indicators: intervention.indicators?.map(injectClientId),
                    }),
                ),
                needs_identified: needs_identified?.map(injectClientId),
                national_society_actions: national_society_actions?.map(injectClientId),
                risk_security: risk_security?.map(injectClientId),
                event_map_file: isDefined(event_map_file)
                    ? injectClientId(event_map_file) : undefined,
                cover_image_file: isDefined(cover_image_file)
                    ? injectClientId(cover_image_file) : undefined,
                images_file: images_file?.map(injectClientId),
            });
        },
    });

    const {
        pending: drefSubmitPending,
        trigger: submitDref,
    } = useLazyRequest<PutDrefResponse, PartialDref>({
        url: isTruthyString(drefId) ? `api/v2/dref/${drefId}` : 'api/v2/dref/',
        method: isTruthyString(drefId) ? 'PUT' : 'POST',
        body: (formFields) => formFields,
        onSuccess: (response) => {
            alert.show(
                strings.drefFormSaveRequestSuccessMessage,
                { variant: 'success' },
            );
            if (isTruthyString(drefId)) {
                handleDrefLoad(response);
            } else {
                navigate(
                    generatePath(
                        drefApplicationFormRoute.absolutePath,
                        { drefId: response.id },
                    ),
                );
            }
        },
        onFailure: ({
            value: { formErrors, messageForNotification },
            debugMessage,
        }) => {
            // TODO: verify formErrors
            setError(formErrors);

            if (formErrors.modified_at === 'OBSOLETE_PAYLOAD') {
                setShowObsoletePayloadModal(true);
            }

            alert.show(
                strings.drefFormSaveRequestFailureMessage,
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
            const result = validate();
            if (result.errored) {
                setError(result.error);
                return;
            }

            submitDref({
                ...result.value,
                modified_at: modifiedAt ?? lastModifiedAtRef.current,
            });
        },
        [validate, setError, submitDref],
    );
    const handleObsoletePayloadOverwiteButtonClick = useCallback(
        (newModifiedAt: string | undefined) => {
            setShowObsoletePayloadModal(false);
            handleFormSubmit(newModifiedAt);
        },
        [handleFormSubmit],
    );

    const handleImport = useCallback(
        async (importFile: File | undefined) => {
            if (isNotDefined(importFile)) {
                return;
            }

            const formValues = await getImportData(importFile);

            // eslint-disable-next-line no-console
            console.info(formValues);

            // TODO: set form values
        },
        [],
    );

    const pending = fetchingDref || drefSubmitPending;
    const minStep = 1;
    const maxStep = value?.type_of_dref === TYPE_LOAN ? 3 : 5;

    // TODO: responsive styling
    return (
        <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="step"
        >
            <Page
                className={styles.drefApplicationForm}
                title={strings.drefFormPageTitle}
                heading={strings.drefFormPageHeading}
                actions={isFalsyString(drefId) ? (
                    <RawFileInput
                        name={undefined}
                        onChange={handleImport}
                    >
                        {strings.drefFormImportFromDocument}
                    </RawFileInput>
                ) : undefined}
                info={(
                    <TabList className={styles.tabList}>
                        <Tab
                            name="overview"
                            step={1}
                            disabled={pending}
                            errored={checkTabErrors(formError, 'overview')}
                        >
                            {strings.drefFormTabOverviewLabel}
                        </Tab>
                        <Tab
                            name="eventDetail"
                            step={2}
                            disabled={pending}
                            errored={checkTabErrors(formError, 'eventDetail')}
                        >
                            {strings.drefFormTabEventDetailLabel}
                        </Tab>
                        {value?.type_of_dref !== TYPE_LOAN && (
                            <Tab
                                name="actions"
                                step={3}
                                disabled={pending}
                                errored={checkTabErrors(formError, 'actions')}
                            >
                                {strings.drefFormTabActionsLabel}
                            </Tab>
                        )}
                        {value?.type_of_dref !== TYPE_LOAN && (
                            <Tab
                                name="operation"
                                step={4}
                                disabled={pending}
                                errored={checkTabErrors(formError, 'operation')}
                            >
                                {strings.drefFormTabOperationLabel}
                            </Tab>
                        )}
                        <Tab
                            name="submission"
                            step={value?.type_of_dref === TYPE_LOAN ? 3 : 5}
                            disabled={pending}
                            errored={checkTabErrors(formError, 'submission')}
                        >
                            {strings.drefFormTabSubmissionLabel}
                        </Tab>
                    </TabList>
                )}
                withBackgroundColorInMainSection
                mainSectionClassName={styles.content}
            >
                <TabPanel name="overview">
                    <Overview
                        value={value}
                        setFieldValue={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={formError}
                    />
                </TabPanel>
                <TabPanel name="eventDetail">
                    <EventDetail
                        value={value}
                        setFieldValue={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={formError}
                    />
                </TabPanel>
                <TabPanel name="actions">
                    <Actions
                        value={value}
                        setFieldValue={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={formError}
                    />
                </TabPanel>
                <TabPanel name="operation">
                    <Operation
                        value={value}
                        setFieldValue={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={formError}
                    />
                </TabPanel>
                <TabPanel name="submission">
                    <Submission
                        value={value}
                        setFieldValue={setFieldValue}
                        error={formError}
                    />
                </TabPanel>
                <NonFieldError
                    error={formError}
                    message={strings.drefFormGeneralError}
                />
                <div className={styles.actions}>
                    <div className={styles.pageActions}>
                        <Button
                            name={getPreviousStep(activeTab, minStep, maxStep)}
                            onClick={setActiveTab}
                            disabled={tabStepMap[activeTab] <= minStep}
                            variant="secondary"
                        >
                            {strings.drefFormBackButtonLabel}
                        </Button>
                        <Button
                            name={getNextStep(activeTab, minStep, maxStep)}
                            onClick={setActiveTab}
                            disabled={tabStepMap[activeTab] >= maxStep}
                            variant="secondary"
                        >
                            {strings.drefFormContinueButtonLabel}
                        </Button>
                    </div>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        disabled={activeTab !== 'submission'}
                    >
                        {strings.drefFormSubmitButtonLabel}
                    </Button>
                </div>
                {isTruthyString(drefId) && showObsoletePayloadModal && (
                    <ObsoletePayloadModal
                        drefId={+drefId}
                        onOverwriteButtonClick={handleObsoletePayloadOverwiteButtonClick}
                        onCancelButtonClick={setShowObsoletePayloadModal}
                    />
                )}
            </Page>
        </Tabs>
    );
}
