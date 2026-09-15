import { type ReactNode } from 'react';
import { ListView } from '@ifrc-go/ui';

interface Props {
    className?: string;
    children: ReactNode;
}

// Tighter spacing than the surrounding sections, so collapsed questions read as one
// block.
function FaqList(props: Props) {
    const {
        className,
        children,
    } = props;

    return (
        <ListView
            className={className}
            layout="block"
            spacing="xs"
        >
            {children}
        </ListView>
    );
}

export default FaqList;
