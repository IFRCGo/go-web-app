import { isNotDefined } from '@togglecorp/fujs';

import Description from '#components/Description';
import InlineLayout from '#components/InlineLayout';

export interface Props {
    maxLength?: number;
    length?: number;
}

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
