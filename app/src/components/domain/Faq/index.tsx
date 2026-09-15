import { type ReactNode } from 'react';
import {
    ExpandableContainer,
    ListView,
} from '@ifrc-go/ui';

interface Props {
    className?: string;
    // Anchor id, stable in a way the translated question is not.
    name: string;
    question: ReactNode;
    // Siblings are spaced apart, so do not wrap the answer in a single element.
    children: ReactNode;
}

function Faq(props: Props) {
    const {
        className,
        name,
        question,
        children,
    } = props;

    return (
        <ExpandableContainer
            className={className}
            id={name}
            heading={question}
            headingLevel={5}
            withHeaderBorder
            withShadow
            withPadding
            withBackground
        >
            <ListView
                layout="block"
                spacing="lg"
                withSpacingOpticalCorrection
            >
                {children}
            </ListView>
        </ExpandableContainer>
    );
}

export default Faq;
