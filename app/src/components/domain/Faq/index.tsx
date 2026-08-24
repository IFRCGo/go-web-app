import { type ReactNode } from 'react';
import {
    ExpandableContainer,
    ListView,
} from '@ifrc-go/ui';

export interface FaqItem {
    // Stable key — independent of the (translatable) question text.
    name: string;
    question: ReactNode;
    answer: ReactNode;
}

interface Props {
    className?: string;
    items: FaqItem[];
}

function Faq(props: Props) {
    const { className, items } = props;

    return (
        <ListView
            className={className}
            layout="block"
            spacing="xs"
        >
            {items.map((item) => (
                <ExpandableContainer
                    key={item.name}
                    heading={item.question}
                    headingLevel={5}
                    withHeaderBorder
                    withShadow
                    withPadding
                    withBackground
                >
                    {item.answer}
                </ExpandableContainer>
            ))}
        </ListView>
    );
}

export default Faq;
