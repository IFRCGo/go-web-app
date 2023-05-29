import React, { useContext, useCallback, useState } from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';
import { ArrayError, createSubmitHandler, PartialForm, SetBaseValueArg, useForm, useFormArray, useFormObject } from '@togglecorp/toggle-form';
import { ListResponse, useLazyRequest, useRequest } from '#utils/restRequest';
import useAlert from '#hooks/useAlert';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import i18n from './i18n.json';
import useTranslation from '#hooks/useTranslation';

import usePerProcessOptions, { assessmentSchema } from '../usePerProcessOptions';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';
import Container from '#components/Container';
import ProgressBar from '#components/ProgressBar';
// import ExpandableContainer from '#components/ExpandableContainer';
import Button from '#components/Button';
import { Area, Component, PerAssessmentForm } from '../common';
import scrollToTop from '#utils/scrollToTop';
import ComponentsInput from './ComponentInput';

import styles from './styles.module.css';

type Value = PerAssessmentForm;
type InputValue = PartialForm<Value>;

interface Props {
  perId?: string;
  error: ArrayError<Value> | undefined;
  onValueSet: (value: SetBaseValueArg<Value>) => void;
}

function AssessmentForm(props: Props) {

  const strings = useTranslation(i18n);

  const {
    perId,
    error: errorFromProps,
    onValueSet,
  } = props;

  const {
    value,
    error: formError,
    validate,
    setFieldValue: onValueChange,
    setError: onErrorSet,
  } = useForm(assessmentSchema, { value: {} }); // TODO: move this to separate variable

  const {
    formStatusOptions,
  } = usePerProcessOptions();

  const minArea = 1;
  const maxArea = 5;

  const alert = useAlert();

  const [currentArea, setCurrentArea] = useState<number | undefined>();

  const [currentComponent, setCurrentComponent] = useState<number | undefined>();

  const {
    response: areaResponse,
  } = useRequest<ListResponse<Area>>({
    url: 'api/v2/per-formarea/',
    onSuccess: (value) => {
      const firstArea = value?.results?.[0];
      if (firstArea) {
        setCurrentArea(firstArea.id);
      }
    }
  });

  const {
    response: componentResponse,
  } = useRequest<ListResponse<Component>>({
    skip: isNotDefined(currentArea),
    url: `api/v2/per-formcomponent/`,
    query: {
      area_id: currentArea,
    },
    onSuccess: (value) => {
      const componentArea = value?.results?.[0];
      if (componentArea) {
        setCurrentComponent(componentArea.id);
      }
    }
  });

  const {
    response: questionResponse,
  } = useRequest<ListResponse<PerAssessmentForm>>({
    url: `api/v2/per-formquestion/`,
    query: {
      component: currentComponent,
      area_id: currentArea,
    },
  });

  const {
    trigger: submitRequest,
  } = useLazyRequest({
    url: perId ? `api/v2/updatemultipleperforms/${perId}/` : 'api/v2/updatemultipleperforms/',
    method: perId ? 'PUT' : 'POST',
    body: ctx => ctx,
    onSuccess: (response) => {
      alert.show(
        strings.perFormSaveRequestSuccessMessage,
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
      alert.show(
        <p>
          {strings.perFormSaveRequestFailureMessage}
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

  const handleSubmit = React.useCallback((finalValues) => {
    console.warn('finalValues', finalValues);
    onValueSet(finalValues);
    submitRequest(finalValues);
  }, [onValueSet, submitRequest]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonId = event.currentTarget.id;
    console.log('Button ID:', buttonId);
  };

  const handlePerTabChange = useCallback((newStep: string) => {
    scrollToTop();
    setCurrentArea(newStep);
  }, []);

  const handleAreaTabChange = useCallback((newStep: string) => {
    setCurrentArea(newStep);
  }, []);

  const handleSubmitCancel = useCallback(() => {
    console.warn('Cancelling submit');
  }, []);

  const handleSubmitButtonClick = useCallback(() => {
    alert.show(
      <p className={styles.alertMessage}>
        <strong>
          {strings.perFormSubmitAssessmentTitle}
          <br />
        </strong>
        {strings.perFormSubmitAssessmentDescription}
        <div className={styles.alertButtons}>
          <Button
            name='cancel'
            variant='secondary'
            type='reset'
            onClick={handleSubmitCancel}
          >
            Cancel
          </Button>
          <Button
            name='submit'
            variant='secondary'
            type='submit'
            onClick={handlePerTabChange}
          >
            Save
          </Button>
        </div>
      </p>,
      {
        variant: 'warning',
      }
    );
  }, [alert, handleSubmitCancel, strings, handlePerTabChange]);

  const noOfAreas = (areaResponse?.results.length ?? 0) + 1;

  const handleNextTab = () => {
    setCurrentArea(Math.min(currentArea + 1, noOfAreas));
  };

  const handlePrevTab = () => {
    setCurrentArea(Math.max(currentArea - 1, 1));
  };

  const {
    setValue: setComponentValue,
    removeValue: removeComponentValue,
  } = useFormArray(
    'component_responses',
    onValueChange,
  );

  return (
    <Container>
      <form onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}>
        {/* <ExpandableContainer
          className={_cs(styles.customActivity, styles.errored)}
          componentRef={undefined}
          // actionsContainerClassName={styles}
          headingSize='small'
          sub
          actions='Show Summary'
        >
          <Container
            className={styles.inputSection}
          >
            <ProgressBar
              className={styles.progressBar}
              label='Answered'
              value={20}
            />
            <ProgressBar
              // className={styles.questionAnswered}
              label='Answered'
              value={20}
            />
          </Container>
        </ExpandableContainer> */}
        <Tabs
          disabled={undefined}
          onChange={handleAreaTabChange}
          value={String(currentArea)}
          variant='primary'
        >
          <TabList
            className={styles.tabList}
          >
            {areaResponse?.results?.map((item) => (
              <Tab
                name={String(item.id)}
                step={item?.area_num}
                errored={undefined}
              >
                Area {item?.area_num}: {item?.title}
              </Tab>
            ))}
          </TabList>
          {areaResponse?.results?.map((component) => (
            <TabPanel
              name={String(component.id)}
              key={component.id}
              value={String(currentComponent)}
            >
              {/* {componentResponse?.results?.map((a, i) => (
                <ComponentsInput
                  key={a.component}
                  value={a}
                  index={i}
                  formStatusOptions={formStatusOptions}
                  componentId={a.id}
                  areaId={component.id}
                  onChange={setComponentValue}
                  onRemove={removeComponentValue}
                // error={getErrorObject(error?.component)}
                />
              ))} */}
            </TabPanel>
          ))}
          <div className={styles.actions}>
            {currentArea > minArea &&
              <Button
                name={undefined}
                variant='secondary'
                onClick={handlePrevTab}
                disabled={undefined}
              >
                Back
              </Button>
            }
            {currentArea < maxArea &&
              <Button
                name={undefined}
                variant='secondary'
                onClick={handleNextTab}
                disabled={undefined}
              >
                Next
              </Button>
            }
            <Button
              name={undefined}
              variant='secondary'
              onClick={handleSubmitButtonClick}
              disabled={undefined}
            >
              Submit
            </Button>
          </div>
        </Tabs>
      </form>
    </Container>
  );
}

export default AssessmentForm;
