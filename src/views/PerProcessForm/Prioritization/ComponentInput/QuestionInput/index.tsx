import { isNotDefined } from '@togglecorp/fujs';

import Container from '#components/Container';
import { ListResponse, useRequest } from '#utils/restRequest';
import { PartialPrioritization } from '#views/PerProcessForm/usePerProcessOptions';
import { PerFormQuestionItem } from '#views/PerProcessForm/common';

import styles from './styles.module.css';

type Value = PartialPrioritization;

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

    return (
        <>
            <Container
                // headerDescription={`${i + 1}: ${question?.question}`}
                className={styles.inputSection}
            >
            </Container>
        </>
    );
}

export default QuestionInput;
