import React, { useState } from 'react';
import {
    EntriesAsList,
    PartialForm,
    SetBaseValueArg,
    useForm,
    useFormArray
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';
import { ListResponse, useRequest } from '#utils/restRequest';
import { assessmentSchema2 } from '../usePerProcessOptions';
import { Area, Component, PerAssessmentForm, PerPrioritizationForm } from '../common';
import Container from '#components/Container';
import ComponentsList from './ComponentInput';

import Button from '#components/Button';
import Table from '#components/Table';
import TextInput from '#components/TextInput';
import useTranslation from '#hooks/useTranslation';
import i18n from './i18n.json';

import styles from './styles.module.css';
import ExpandableContainer from '#components/ExpandableContainer';
import { createStringColumn } from '#components/Table/ColumnShortcuts';
import QuestionInput from './ComponentInput/QuestionInput';

type Value = PartialForm<Component>;

export interface Props {
    className?: string;
    onValueChange?: (...entries: EntriesAsList<Value>) => void;
    onValueSet?: (value: SetBaseValueArg<Value>) => void;
    perId?: string;
    onSubmitSuccess?: (result: Component) => void;
}

function prioritizationKeySelector(prioritization: Value) {
    return prioritization.id;
}

interface AreaProps {
    className?: string;
}

function PrioritizationForm(props: AreaProps) {
    const strings = useTranslation(i18n);

    const {
        className,
    } = props;

    const {
        value,
        setFieldValue,
        setValue: onValueSet,
    } = useForm(assessmentSchema2, { value: {} });
    const [currentComponent, setCurrentComponent] = useState<string | undefined>();

    const {
        response: areaResponse,
    } = useRequest<ListResponse<Area>>({
        url: 'api/v2/per-formarea/',
    });

    const {
        response: componentResponse,
    } = useRequest<ListResponse<Component>>({
        url: `api/v2/per-formcomponent/`,
    });

    const {
        response: questionResponse,
    } = useRequest<ListResponse<PerPrioritizationForm>>({
        url: `api/v2/per-formquestion/`,
        query: {
            component: currentComponent,
        },
    });

    const showComponent = () => {
        return (
            <>
                {areaResponse?.results?.map((item) => (
                    <ComponentsList
                        key={item.area_num}
                        id={item.id}
                        onValueChange={setFieldValue}
                        value={value}
                    />
                ))}
            </>
        );
    };

    const showText = () => {
        return (
            <TextInput
                name={undefined}
                value={undefined}
            >
            </TextInput>
        );
    };

    const columns = [
        createStringColumn<Component, string | number>(
            'component',
            'Component',
            showComponent,
        ),
        createStringColumn<Component, string | number>(
            'ranking',
            'Ranking',
            (prioritization) => prioritization.id,
        ),
        createStringColumn<Component, string | number>(
            'code',
            'Justification',
            showText,
        ),
    ];

    const {
        setValue: setBenchmarkValue,
        // removeValue: removeBenchmarkValue,
    } = useFormArray('component_responses', setFieldValue);

    return (
        <Container
            className={_cs(styles.prioritizationTable, className)}
            contentClassName={styles.content}
        >
            <Table
                data={undefined}
                columns={columns}
                keySelector={prioritizationKeySelector}
                variant="large"
            />
            {componentResponse?.results?.map((component, i) => (
                <ExpandableContainer
                    className={_cs(styles.customActivity, styles.errored)}
                    componentRef={undefined}
                    heading={`Component ${i + 1}: ${component?.title}`}
                    actions={
                        <TextInput
                            className={styles.improvementSelect}
                            name="description"
                            value={value?.description}
                            onChange={setFieldValue}
                        />
                    }
                >
                    <QuestionInput
                        id={component.id}
                        index={i}
                        value={value}
                        onChange={setBenchmarkValue}
                    // onRemove={removeBenchmarkValue}
                    />
                </ExpandableContainer>
            ))}
            <div className={styles.actions}>
                <Button
                    name={undefined}
                    variant="secondary"
                    onClick={undefined}
                >
                    {strings.perSelectAndAddToWorkPlan}
                </Button>
            </div>
        </Container>
    );
}

export default PrioritizationForm;
