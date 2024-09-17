import { isNotDefined } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    question: string | undefined | null;
    answer: string | undefined | null;
    // FIXME: Check why question number and even question can be undefined
    questionNum: number | undefined | null;
    componentNum: number;
    notes?: string | null;
}

function QuestionOutput(props: Props) {
    const {
        questionNum,
        componentNum,
        question,
        answer,
        notes,
    } = props;

    if (isNotDefined(questionNum)) {
        return null;
    }

    return (
        <div className={styles.questionOutput}>
            <div className={styles.questionRow}>
                <div className={styles.numbering}>
                    {`${componentNum}.${questionNum}.`}
                </div>
                <div className={styles.question}>
                    {question}
                </div>
                <div className={styles.answer}>
                    {answer}
                </div>
            </div>
            {notes && (
                <div className={styles.notes}>
                    {notes}
                </div>
            )}
        </div>
    );
}

export default QuestionOutput;
