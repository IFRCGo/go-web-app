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
 * CharacterCount shows a "current / max" character counter for text inputs.
 * Specific layer: no variants.
 */
function CharacterCount(props: Props) {
    const { maxLength, length = 0 } = props;

    if (isNotDefined(maxLength)) {
        return null;
    }

    return (
        <InlineLayout
            after={(
                // FIXME(a11y-tier2): wrap the count in an aria-live="polite"
                // region so the remaining-characters update is announced as
                // the user types.
                <Description withLightText textSize="sm">
                    {`${length} / ${maxLength}`}
                </Description>
            )}
        />
    );
}

export default CharacterCount;
