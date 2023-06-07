import React from 'react';

import { PartialForm } from '@togglecorp/toggle-form';
import { Component, PerPrioritizationForm } from '#views/PerProcessForm/common';
import Container from '#components/Container';
import { ListResponse, useRequest } from '#utils/restRequest';
import styles from './styles.module.css';
import { isNotDefined } from '@togglecorp/fujs';

type Value = PartialForm<PerPrioritizationForm>;

interface Props {
    id: string;
    value?: Value;
    index: number;
}

function QuestionInput(props: Props) {
    const {
        id,
        index,
        value,
    } = props;

    const {
        response: questionResponse,
    } = useRequest<ListResponse<PerPrioritizationForm>>({
        skip: isNotDefined(id),
        url: `api/v2/per-formquestion/?component=${id}`,
    });

    return (
        <>
            {questionResponse?.results.map((question, i) => (
                <Container
                    headerDescription={`${i + 1}: ${question?.question}`}
                    className={styles.inputSection}
                >
                </Container>
            ))}
        </>
    );
}

export default QuestionInput;
