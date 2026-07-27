import {
    Description,
    DisplayLabel,
    InlineLayout,
    ListView,
    type ListViewProps,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

interface Props {
    question: string | undefined | null;
    answer: string | undefined | null;
    // FIXME: Check why question number and even question can be undefined
    questionNum: number | undefined | null;
    componentNum: number;
    notes?: string | null;
    backgroundColor?: ListViewProps['backgroundColor'];
}

function QuestionOutput(props: Props) {
    const {
        questionNum,
        componentNum,
        question,
        answer,
        notes,
        backgroundColor,
    } = props;

    if (isNotDefined(questionNum)) {
        return null;
    }

    return (
        <ListView
            layout="block"
            withSpacingOpticalCorrection
            withPadding
            backgroundColor={backgroundColor}
            spacing="sm"
        >
            <InlineLayout
                before={`${componentNum}.${questionNum}.`}
                after={(
                    <DisplayLabel strong>
                        {answer}
                    </DisplayLabel>
                )}
            >
                {question}
            </InlineLayout>
            {notes && (
                <Description withLightText>
                    {notes}
                </Description>
            )}
        </ListView>
    );
}

export default QuestionOutput;
