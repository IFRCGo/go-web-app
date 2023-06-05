import React, { useCallback, useState } from 'react';

import { isNotDefined, _cs } from '@togglecorp/fujs';
import {
    createSubmitHandler,
    PartialForm,
    SetBaseValueArg,
    SetValueArg,
    useForm,
    useFormArray,
    useFormObject,
} from '@togglecorp/toggle-form';
import { ListResponse, useLazyRequest, useRequest } from '#utils/restRequest';
import useAlert from '#hooks/useAlert';
import useTranslation from '#hooks/useTranslation';
import usePerProcessOptions, { assessmentSchema } from '../usePerProcessOptions';
import Tabs from '#components/Tabs';
import TabList from '#components/Tabs/TabList';
import Tab from '#components/Tabs/Tab';
import TabPanel from '#components/Tabs/TabPanel';
import Container from '#components/Container';
import ProgressBar from '#components/ProgressBar';
import ExpandableContainer from '#components/ExpandableContainer';
import Button from '#components/Button';
import { Area, Component, PerAssessmentForm } from '../common';
import scrollToTop from '#utils/scrollToTop';
import StackedProgressBar from '#components/StackedProgressBar';
import SelectInput from '#components/SelectInput';
import QuestionInput from './ComponentInput/QuestionInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

type Value = PerAssessmentForm;
type InputValue = PartialForm<Value>;

interface Props {
    perId?: string;
    onValueSet?: (value: SetBaseValueArg<Value>) => void;
    index?: number;
    onChange?: (value: SetValueArg<Value>, index: number) => void;
}

function AssessmentForm(props: Props) {

    const {
        perId,
        index,
        onValueSet,
        onChange,
    } = props;

    const {
        value,
        error: formError,
        setError,
        validate,
        setError: onErrorSet,
    } = useForm(assessmentSchema, { value: {} }); // TODO: move this to separate variable

    const strings = useTranslation(i18n);

    const {
        formStatusOptions,
    } = usePerProcessOptions();

    const minArea = 1;
    const maxArea = 5;

    const alert = useAlert();

    const [currentArea, setCurrentArea] = useState<number | undefined>();

    const [currentComponent, setCurrentComponent] = useState<string | undefined>();

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

    const {
        value: initialValue,
        setFieldValue,
    } = useForm(assessmentSchema, { value: {} as PartialForm<PerAssessmentForm> });

    const handleSubmit = React.useCallback((finalValues: Value) => {
        // onValueSet(finalValues);
        submitRequest(finalValues);
    }, [onValueSet, submitRequest]);

    const handlePerTabChange = useCallback((newStep: number) => {
        scrollToTop();
        setCurrentArea(newStep);
    }, []);

    const handleAreaTabChange = useCallback((newStep: number) => {
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
                        name={1} //only number is accepted
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
        setCurrentArea(Math.min((currentArea ?? 0) + 1, noOfAreas));
    };

    const handlePrevTab = () => {
        setCurrentArea(Math.max((currentArea ?? 0) - 1, 1));
    };

    // const {
    //   setValue: setComponentValue,
    //   removeValue: removeComponentValue,
    // } = useFormArray(
    //   'component_responses',
    //   onValueChange,
    // );

    const onFieldChange = useFormObject(index, onChange, {});

    const {
        setValue: setBenchmarkValue,
        // removeValue: removeBenchmarkValue,
    } = useFormArray('component_responses', onFieldChange);

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <ExpandableContainer
                className={_cs(styles.customActivity, styles.errored)}
                componentRef={undefined}
                actions='Show Summary'
            >
                <Container
                    className={styles.inputSection}
                >
                    <ProgressBar
                        title='Answered 20/100'
                        value={50}
                        totalValue={100}
                        color='red'
                    />
                    <StackedProgressBar
                        // className={styles.progressBar}
                        label='Answered'
                        value={20}
                        width={50}
                    />
                    <StackedProgressBar
                        // className={styles.questionAnswered}
                        label='Answered'
                        value={20}
                    />
                </Container>
            </ExpandableContainer>
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
                        {componentResponse?.results?.map((a, i) => (
                            <ExpandableContainer
                                heading={`Component ${i + 1}: ${a?.title}`}
                                actions={
                                    <SelectInput
                                        className={styles.improvementSelect}
                                        name='status'
                                        options={formStatusOptions}
                                        onChange={setFieldValue}
                                        keySelector={(d) => d.value}
                                        labelSelector={(d) => d.label}
                                        value={initialValue?.status}
                                    />
                                }
                            >
                                {questionResponse?.results.map((q, i) => (
                                    <QuestionInput
                                        index={i}
                                        value={q}
                                        key={q.id}
                                        onChange={setBenchmarkValue}
                                    // onRemove={removeBenchmarkValue}
                                    />
                                ))}
                            </ExpandableContainer>
                        ))}
                    </TabPanel>
                ))}
                <div className={styles.actions}>
                    {currentArea !== undefined && currentArea > minArea &&
                        <Button
                            name={undefined}
                            variant='secondary'
                            onClick={handlePrevTab}
                            disabled={undefined}
                        >
                            Back
                        </Button>
                    }
                    {currentArea !== undefined && currentArea < maxArea &&
                        <Button
                            name='next'
                            variant='secondary'
                            onClick={handleNextTab}
                            disabled={undefined}
                        >
                            Next
                        </Button>
                    }
                    <Button
                        name='submit'
                        variant='secondary'
                        onClick={handleSubmitButtonClick}
                        disabled={undefined}
                    >
                        Submit
                    </Button>
                </div>
            </Tabs>
        </form>
    );
}

export default AssessmentForm;
