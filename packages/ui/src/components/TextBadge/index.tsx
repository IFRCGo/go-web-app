import { isNotDefined } from '@togglecorp/fujs';

import Description from '#components/Description';
import InlineLayout from '#components/InlineLayout';

export interface Props {
    /** Maximum allowed character count; nothing renders when undefined */
    maxLength?: number;
    /** Current character count */
    length?: number;
}

/**
 * TextBadge shows a "current / max" character counter for text inputs.
 * Specific layer: no variants.
 */
function TextBadge(props: Props) {
    const { maxLength, length = 0 } = props;

    if (isNotDefined(maxLength)) {
        return null;
    }

    return (
        <InlineLayout
            after={(
                <Description withLightText textSize="sm">
                    {`${length} / ${maxLength}`}
                </Description>
            )}
        />
    );
}

export default TextBadge;
