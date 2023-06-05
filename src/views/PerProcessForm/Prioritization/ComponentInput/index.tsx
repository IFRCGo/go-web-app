import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { EntriesAsList, PartialForm } from '@togglecorp/toggle-form';

import { ListResponse, useRequest } from '#utils/restRequest';
import ExpandableContainer from '#components/ExpandableContainer';

import {
    PerAssessmentForm,
} from '../../common';
import TextInput from '#components/TextInput';

import styles from './styles.module.css';
import QuestionInput from './QuestionInput';

type Value = PartialForm<PerAssessmentForm>;

interface Props {
    id?: string;
    value?: Value;
    onValueChange?: (...entries: EntriesAsList<Value>) => void;
}

function ComponentsInput(props: Props) {
    const {
        value,
        onValueChange,
        id,
    } = props;


    const [currentArea, setCurrentArea] = useState<number | undefined>();

    const [currentComponent, setCurrentComponent] = useState<string | undefined>();

    const {
        response: questionResponse,
    } = useRequest<ListResponse<PerAssessmentForm>>({
        url: `api/v2/per-formquestion/`,
        query: {
            component: currentComponent,
            area_id: currentArea,
        },
    });

    return (
        <ExpandableContainer
            className={_cs(styles.customActivity, styles.errored)}
            componentRef={undefined}
            // heading={`Component ${i + 1} : ${component.title}`}
            // actionsContainerClassName={styles}
            actions={
                <TextInput
                    className={styles.improvementSelect}
                    name="description"
                    value={value?.description}
                    onChange={onValueChange}
                />
            }
        >
            {questionResponse?.results.map((q, i) => (
                <QuestionInput
                    index={i}
                    value={q}
                    key={q.id}
                    onChange={undefined}
                // onRemove={removeBenchmarkValue}
                />
            ))}
        </ExpandableContainer>
    );
}

export default ComponentsInput;
