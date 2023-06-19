import styles from './styles.module.css';

interface Props {
    question: string;
    answer: string;
    questionNum: number;
    componentNum: number;
}

function QuestionOutput(props: Props) {
    const {
        questionNum,
        componentNum,
        question,
        answer,
    } = props;

    return (
        <div className={styles.questionOutput}>
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
    );
}

export default QuestionOutput;
