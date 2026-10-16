import {
    InfoPopup,
    KeyFigureView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type KeyFigureItem = GoApiResponse<'/api/v2/emergency/{id}/'>['key_figures'][number];

interface Props {
    keyFigure: KeyFigureItem;
}

// NOTE: the server sends free text (e.g. "1.2M", "2,000-3,000"); only whole numbers are formatted
function getWholeNumber(value: string) {
    const valueWithoutSeparators = value.replace(/[,\s]/g, '');
    return /^\d+$/.test(valueWithoutSeparators) ? Number(valueWithoutSeparators) : undefined;
}

function CustomKeyFigure(props: Props) {
    const { keyFigure } = props;

    const strings = useTranslation(i18n);

    const wholeNumber = getWholeNumber(keyFigure.number);

    const sourceInfo = (
        <InfoPopup
            description={(
                <TextOutput
                    label={strings.customKeyFigureSourceLabel}
                    value={keyFigure.source}
                    textSize="sm"
                />
            )}
        />
    );

    if (isNotDefined(wholeNumber)) {
        return (
            <KeyFigureView
                label={keyFigure.deck}
                value={keyFigure.number}
                valueType="text"
                info={sourceInfo}
                withShadow
            />
        );
    }

    return (
        <KeyFigureView
            label={keyFigure.deck}
            value={wholeNumber}
            valueType="number"
            info={sourceInfo}
            withShadow
        />
    );
}

export default CustomKeyFigure;
