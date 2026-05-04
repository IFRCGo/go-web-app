import {
    ColorPreview,
    type ColorPreviewProps,
} from '@ifrc-go/ui';
import { isNotDefined } from '@togglecorp/fujs';

import {
    COLOR_ORANGE_SEVERITY,
    COLOR_RED_SEVERITY,
    COLOR_YELLOW_SEVERITY,
} from '../ActiveOperationMap/utils';

interface Props extends Omit<ColorPreviewProps, 'value'> {
    level: number | undefined | null;
    title?: string;
}

function SeverityIndicator(props: Props) {
    const {
        level,
        title,
        ...otherProps
    } = props;

    const colorMap: Record<number, string | undefined> = {
        0: COLOR_YELLOW_SEVERITY,
        1: COLOR_ORANGE_SEVERITY,
        2: COLOR_RED_SEVERITY,
    };

    if (isNotDefined(level)) {
        return null;
    }

    const value = colorMap[level];

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <ColorPreview
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            title={title}
            value={value}
        />
    );
}

export default SeverityIndicator;
