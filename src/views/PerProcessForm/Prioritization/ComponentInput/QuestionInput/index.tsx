import React from 'react';
import { PartialForm } from '@togglecorp/toggle-form';

import { PerOverviewFields, PerPrioritizationForm } from '#views/PerProcessForm/common';
import Container from '#components/Container';

import styles from './styles.module.css';

type Value = PartialForm<PerPrioritizationForm>;

interface Props {
    value?: Value;
    index: number;
}

function QuestionInput(props: Props) {
    const {
        index,
        value,
    } = props;

    return (
        <Container
            headerDescription={`${index + 1}:  ${value?.question}`}
            className={styles.inputSection}
            headerClassName={styles.questionContent}
        >
        </Container>
    );
}

export default QuestionInput;
