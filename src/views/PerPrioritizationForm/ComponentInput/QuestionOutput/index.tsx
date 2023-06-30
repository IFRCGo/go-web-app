import styles from './styles.module.css';

interface Props {
    question: string;
    answer: string;
    questionNum: number;
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

    return (
        <div className={styles.questionOutput}>
            <div className={styles.questionRow}>
                <div className={styles.numbering}>
                    {`${componentNum}.${questionNum}`}
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
