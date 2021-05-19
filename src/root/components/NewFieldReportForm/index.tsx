import React from 'react';
import type { History, Location } from 'history';
import type { match as Match } from 'react-router-dom';

import BlockLoading from '#components/block-loading';
import { showAlert } from '#components/system-alerts';
import Page from '#components/draft/Page';
import {
  useForm,
  PartialForm,
} from '@togglecorp/toggle-form';
import {
  _cs,
  isDefined,
} from '@togglecorp/fujs';

import BreadCrumb from '#components/breadcrumb';
import NonFieldError from '#components/draft/NonFieldError';
import Container from '#components/draft/Container';
import Tabs from '#components/draft/Tabs';
import TabPanel from '#components/draft/Tabs/TabPanel';
import TabList from '#components/draft/Tabs/TabList';
import Tab from '#components/draft/Tabs/Tab';

import {
} from '#utils/field-report-constants';

import LanguageContext from '#root/languageContext';
import useRequest, {
  putRequestOptions,
  postRequestOptions,
} from '#hooks/useRequest';

import ContextFields from './ContextFields';
import SituationFields from './SituationFields';
import RiskAnalysisFields from './RiskAnalysisFields';
import ActionsFields from './ActionsFields';
import EarlyActionsFields from './EarlyActionsFields';
import ResponseFields from './ResponseFields';

import useFieldReportOptions, { schema } from './useFieldReportOptions';
import {
  STATUS_EVENT,
  STATUS_EARLY_WARNING,
  DISASTER_TYPE_EPIDEMIC,
  VISIBILITY_PUBLIC,
  BULLETIN_PUBLISHED_NO,
  FormType,
  transformFormFieldsToAPIFields,
  transformAPIFieldsToFormFields,
  FieldReportAPIResponseFields,
  ObjectResponse,
  getDefinedValues,
} from './common';
import styles from './styles.module.scss';

const defaultFormValues: PartialForm<FormType> = {
  status: STATUS_EVENT,
  is_covid_report: false,
  visibility: VISIBILITY_PUBLIC,
  bulletin: BULLETIN_PUBLISHED_NO,
};

function scrollToTop () {
  window.setTimeout(() => {
    window.scrollTo({
      top: Math.min(145, window.scrollY),
      left: 0,
      behavior: 'smooth',
    });
  }, 0);
}

interface Props {
  className?: string;
  match: Match<{ reportId?: string }>;
  history: History;
  location: Location;
}

function NewFieldReportForm(props: Props) {
  const {
    className,
    location,
    history,
    match,
  } = props;

  const { reportId } = match.params;
  const { strings } = React.useContext(LanguageContext);

  const [
    fieldReportPending,
    fieldReportResponse,
  ] = useRequest(
    reportId ? `api/v2/field_report/${reportId}` : '',
  ) as ObjectResponse<FieldReportAPIResponseFields>;

  const crumbs = React.useMemo(() => [
    {link: location?.pathname, name: isDefined(reportId) ? 'Edit Field Report' : strings.breadCrumbNewFieldReport},
    {link: '/', name: strings.breadCrumbHome},
  ], [strings.breadCrumbHome, strings.breadCrumbNewFieldReport, location, reportId]);

  const {
    value,
    error,
    onValueChange,
    validate,
    onErrorSet,
    onValueSet,
  } = useForm(defaultFormValues, schema);

   React.useEffect(() => {
    if (fieldReportResponse) {
      const formValue = transformAPIFieldsToFormFields(fieldReportResponse);
      onValueSet(formValue);
    }
  }, [fieldReportResponse, onValueSet]);


  const [fieldReportSubmitPending, ,submitRequest] = useRequest(
    isDefined(reportId) ? (
      `api/v2/update_field_report/${reportId}/`
    ) : (
      'api/v2/create_field_report/'
    ),
    reportId ? putRequestOptions : postRequestOptions,
    {
      lazy: true,
      onSuccess: (result: any) => {
        console.info('successful', result);
        showAlert('success', (
          <p>
            {strings.fieldReportFormRedirectMessage}
          </p>
        ), true, 2000);
        window.setTimeout(
          () => history.push(`/reports/${result?.responseBody?.id}`),
          2000,
        );
      },
      onFailure: (result: any) => {
        const message = result?.responseBody || result?.responseText || 'Failed to submit';
        console.error(result);
        showAlert('danger', (
          <p>
            <strong>
              {strings.fieldReportFormErrorLabel}
            </strong>
            &nbsp;
            {message}
          </p>
        ), true, 4500);
      },
      // TODO: remove following after converting useRequest to TS
      preserveResponse: true,
      debug: false,
    },
  ) as [boolean, any, (o: any) => void];

  const {
    bulletinOptions,
    countryOptions,
    disasterTypeOptions,
    districtOptions,
    externalPartnerOptions,
    fetchingActions,
    fetchingCountries,
    fetchingDisasterTypes,
    fetchingDistricts,
    fetchingExternalPartners,
    fetchingSupportedActivities,
    fetchingUserDetails,
    orgGroupedActionForCurrentReport,
    reportType,
    sourceOptions,
    statusOptions,
    supportedActivityOptions,
    userDetails,
    yesNoOptions,
  } = useFieldReportOptions(value);

  React.useEffect(() => {
    if (value.status === STATUS_EARLY_WARNING) {
      onValueChange(false, 'is_covid_report');

      if (value.dtype === DISASTER_TYPE_EPIDEMIC) {
        onValueChange(undefined, 'dtype');
      }
    }
  }, [value.status, onValueChange, value.dtype]);

  React.useEffect(() => {
    if (value.is_covid_report) {
      onValueChange(DISASTER_TYPE_EPIDEMIC, 'dtype');
    }
  }, [value.is_covid_report, onValueChange]);

  const pending = fetchingUserDetails
    || fetchingActions
    || fieldReportPending
    || fieldReportSubmitPending;

  type StepTypes = 'step1' | 'step2' | 'step3' | 'step4';
  const [currentStep, setCurrentStep] = React.useState<StepTypes>('step1');
  const submitButtonLabel = currentStep === 'step4' ? 'Submit' : 'Continue';
  const submitButtonClassName = currentStep === 'step4' ? 'button--primary-filled' : 'button--secondary-filled';
  const shouldDisabledBackButton = currentStep === 'step1';

  const handleTabChange = React.useCallback((newStep: StepTypes) => {
    scrollToTop();

    const {
      errored,
      error,
    } = validate();

    onErrorSet(error);

    if (!errored) {
      setCurrentStep(newStep);
    }
  }, [setCurrentStep, validate, onErrorSet]);

  const handleSubmitButtonClick = React.useCallback(() => {
    scrollToTop();
    const {
      errored,
      error,
      value: finalValues,
    } = validate();

    onErrorSet(error);

    if (errored) {
      return;
    }

    if (currentStep === 'step4') {
      const apiFields = transformFormFieldsToAPIFields(finalValues as FormType);
      const definedValues = getDefinedValues(apiFields);

      if (userDetails && userDetails.id) {
        const body = JSON.stringify({
          user: userDetails.id,
          ...definedValues
        });

        if (isDefined(reportId)) {
          submitRequest({
            ...putRequestOptions,
            body,
          });
        } else {
          submitRequest({
            ...postRequestOptions,
            body,
          });
        }
      }
    } else {
      const nextStepMap: {
        [key in Exclude<StepTypes, 'step4'>]: Exclude<StepTypes, 'step1'>;
      } = {
        step1: 'step2',
        step2: 'step3',
        step3: 'step4',
      };

      setCurrentStep(nextStepMap[currentStep]);
    }
  }, [submitRequest, userDetails, reportId, currentStep, setCurrentStep, validate, onErrorSet]);

  const handleBackButtonClick = React.useCallback(() => {
    scrollToTop();
    const {
      errored,
      error,
    } = validate();

    onErrorSet(error);

    if (!errored && currentStep !== 'step1') {
      const prevStepMap: {
        [key in Exclude<StepTypes, 'step1'>]: Exclude<StepTypes, 'step4'>;
      } = {
        step2: 'step1',
        step3: 'step2',
        step4: 'step3',
      };
      setCurrentStep(prevStepMap[currentStep]);
    }
  }, [validate, setCurrentStep, currentStep, onErrorSet]);

  return (
    <Tabs
      disabled={pending}
      onChange={handleTabChange}
      value={currentStep}
    >
      <Page
        className={_cs(styles.newFieldReportForm, className)}
        title={isDefined(reportId) ? 'IFRC Go - Update Field Report' : strings.fieldReportFormPageTitle}
        heading={isDefined(reportId) ? 'Update Field Report' : strings.fieldReportCreate}
        breadCrumbs={<BreadCrumb crumbs={crumbs} compact />}
        info={(
          <TabList className={styles.tabList}>
            <Tab name="step1">
              Context
            </Tab>
            <Tab name="step2">
              { value.status === STATUS_EARLY_WARNING && 'Risk Analysis' }
              { value.status === STATUS_EVENT && 'Situation' }
            </Tab>
            <Tab name="step3">
              { value.status === STATUS_EARLY_WARNING && 'Early Action' }
              { value.status === STATUS_EVENT && 'Action' }
            </Tab>
            <Tab name="step4">
              Response
            </Tab>
          </TabList>
        )}
      >
        {pending ? (
          <Container>
            <BlockLoading />
          </Container>
        ) : (
          <>
            <Container>
              <NonFieldError
                error={error}
                message="Please fill in required fields first!"
              />
            </Container>
            <TabPanel name="step1">
              <ContextFields
                error={error}
                onValueChange={onValueChange}
                statusOptions={statusOptions}
                value={value}
                yesNoOptions={yesNoOptions}
                disasterTypeOptions={disasterTypeOptions}
                reportType={reportType}
                countryOptions={countryOptions}
                districtOptions={districtOptions}
                fetchingCountries={fetchingCountries}
                fetchingDistricts={fetchingDistricts}
                fetchingDisasterTypes={fetchingDisasterTypes}
              />
            </TabPanel>
            <TabPanel name="step2">
              {value.status === STATUS_EARLY_WARNING && (
                <RiskAnalysisFields
                  sourceOptions={sourceOptions}
                  error={error}
                  onValueChange={onValueChange}
                  value={value}
                />
              )}
              {value.status === STATUS_EVENT && (
                <SituationFields
                  sourceOptions={sourceOptions}
                  reportType={reportType}
                  error={error}
                  onValueChange={onValueChange}
                  value={value}
                />
              )}
            </TabPanel>
            <TabPanel name="step3">
              {value.status === STATUS_EARLY_WARNING && (
                <EarlyActionsFields
                  bulletinOptions={bulletinOptions}
                  actionOptions={orgGroupedActionForCurrentReport}
                  error={error}
                  onValueChange={onValueChange}
                  value={value}
                />
              )}
              {value.status === STATUS_EVENT && (
                <ActionsFields
                  bulletinOptions={bulletinOptions}
                  actionOptions={orgGroupedActionForCurrentReport}
                  reportType={reportType}
                  error={error}
                  onValueChange={onValueChange}
                  value={value}
                  externalPartnerOptions={externalPartnerOptions}
                  supportedActivityOptions={supportedActivityOptions}
                  fetchingExternalPartners={fetchingExternalPartners}
                  fetchingSupportedActivities={fetchingSupportedActivities}
                />
              )}
            </TabPanel>
            <TabPanel name="step4">
              <ResponseFields
                reportType={reportType}
                error={error}
                onValueChange={onValueChange}
                value={value}
              />
            </TabPanel>
            <div className={styles.actions}>
              <button
                className={_cs('button button--secondary-bounded', shouldDisabledBackButton && 'disabled')}
                type="button"
                disabled={shouldDisabledBackButton}
                onClick={handleBackButtonClick}
              >
                Back
              </button>
              <button
                className={_cs('button', submitButtonClassName)}
                onClick={handleSubmitButtonClick}
                type="submit"
              >
                {submitButtonLabel}
              </button>
            </div>
          </>
        )}
      </Page>
    </Tabs>
  );
}

export default NewFieldReportForm;
