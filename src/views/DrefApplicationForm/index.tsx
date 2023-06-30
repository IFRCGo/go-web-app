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
import { useForm } from '@togglecorp/toggle-form';
import {
    bound,
    isFalsyString,
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

import { useRequest, useLazyRequest } from '#utils/restRequest';
import useTranslation from '#hooks/useTranslation';
import useAlert from '#hooks/useAlert';
import RouteContext from '#contexts/route';
import { GET } from '#types/serverResponse';

import type { PartialDref } from './schema';
import drefSchema from './schema';
import Overview from './Overview';
import EventDetail from './EventDetail';
import Actions from './Actions';
import Operation from './Operation';
import Submission from './Submission';
import ObsoletePayloadModal from './ObsoletePayloadModal';

import { getImportData } from './import';
import i18n from './i18n.json';
import styles from './styles.module.css';

type TabKeys = 'overview' | 'eventDetail' | 'actions' | 'operation' | 'submission';
type TabNumbers = 1 | 2 | 3 | 4 | 5;
const MIN_STEP = 1;
const MAX_STEP = 5;

const tabStepMap: Record<TabKeys, TabNumbers> = {
    overview: 1,
    eventDetail: 2,
    actions: 3,
    operation: 4,
    submission: 5,
};

const tabByStepMap: Record<TabNumbers, TabKeys> = {
    1: 'overview',
    2: 'eventDetail',
    3: 'actions',
    4: 'operation',
    5: 'submission',
};

function getNextStep(currentStep: TabKeys) {
    const next = bound(tabStepMap[currentStep] + 1, MIN_STEP, MAX_STEP) as TabNumbers;
    return tabByStepMap[next];
}

function getPreviousStep(currentStep: TabKeys) {
    const prev = bound(tabStepMap[currentStep] - 1, MIN_STEP, MAX_STEP) as TabNumbers;
    return tabByStepMap[prev];
}

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { drefId } = useParams<{ drefId: string }>();
    const alert = useAlert();
    const navigate = useNavigate();
    const {
        drefApplicationFormEdit: drefApplicationFormRoute,
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
    } = useForm(
        drefSchema,
        {
            value: { },
        },
    );

    const handleDrefLoad = useCallback(
        (response: GET['api/v2/dref/:id']) => {
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
                if (response.images_file?.length > 0) {
                    response.images_file.forEach((img) => {
                        newMap[img.id] = img.file;
                    });
                }
                return newMap;
            });
        },
        [],
    );

    const {
        pending: fetchingDrefOptions,
        response: drefOptions,
    } = useRequest<GET['api/v2/dref-options']>({
        url: 'api/v2/dref-options/',
    });

    const { pending: fetchingDref } = useRequest<GET['api/v2/dref/:id']>({
        skip: isFalsyString(drefId),
        url: `api/v2/dref/${drefId}`,
        onSuccess: (response) => {
            handleDrefLoad(response);
        },
    });

    const {
        pending: drefSubmitPending,
        trigger: submitDref,
    } = useLazyRequest<GET['api/v2/dref/:id'], PartialDref>({
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

    const pending = fetchingDrefOptions || fetchingDref || drefSubmitPending;

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
                        >
                            {strings.drefFormTabOverviewLabel}
                        </Tab>
                        <Tab
                            name="eventDetail"
                            step={2}
                            disabled={pending}
                        >
                            {strings.drefFormTabEventDetailLabel}
                        </Tab>
                        <Tab
                            name="actions"
                            step={3}
                            disabled={pending}
                        >
                            {strings.drefFormTabActionsLabel}
                        </Tab>
                        <Tab
                            name="operation"
                            step={4}
                            disabled={pending}
                        >
                            {strings.drefFormTabOperationLabel}
                        </Tab>
                        <Tab
                            name="submission"
                            step={5}
                            disabled={pending}
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
                        drefOptions={drefOptions}
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
                        drefOptions={drefOptions}
                        value={value}
                        setFieldValue={setFieldValue}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        error={formError}
                    />
                </TabPanel>
                <TabPanel name="operation">
                    <Operation
                        drefOptions={drefOptions}
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
                <div className={styles.actions}>
                    <div className={styles.pageActions}>
                        <Button
                            name={getPreviousStep(activeTab)}
                            onClick={setActiveTab}
                            disabled={tabStepMap[activeTab] <= MIN_STEP}
                            variant="secondary"
                        >
                            {strings.drefFormBackButtonLabel}
                        </Button>
                        <Button
                            name={getNextStep(activeTab)}
                            onClick={setActiveTab}
                            disabled={tabStepMap[activeTab] >= MAX_STEP}
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
