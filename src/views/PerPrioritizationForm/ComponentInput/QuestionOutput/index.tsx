import { PerFormQuestionItem } from '../../common';

import styles from './styles.module.css';

interface Props {
    question: PerFormQuestionItem,
}

function QuestionOutput(props: Props) {
    const { question } = props;

    return (
        <div className={styles.questionOutput}>
            {question.question}
        </div>
    );
}

export default QuestionOutput;
