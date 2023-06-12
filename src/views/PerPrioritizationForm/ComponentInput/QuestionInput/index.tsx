import Container from '#components/Container';
import { PerFormComponentItem, PerFormQuestionItem } from '#views/PerProcessForm/common';
import { PartialPrioritization } from '#views/PerProcessForm/usePerProcessOptions';

import styles from './styles.module.css';

type Value = NonNullable<PartialPrioritization['component_responses']>[number];

interface Props {
    id: string;
    component: PerFormComponentItem;
    index: number;
}

function QuestionInput(props: Props) {
    const {
        index,
        component,
    } = props;

    return (
        <Container
            headerDescription={`${index + 1}: ${question?.}`}
            className={styles.inputSection}
        >
        </Container>
    );
}

export default QuestionInput;
