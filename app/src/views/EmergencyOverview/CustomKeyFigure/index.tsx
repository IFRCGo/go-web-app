import {
    InfoPopup,
    KeyFigureView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type KeyFigureItem = GoApiResponse<'/api/v2/emergency/{id}/'>['key_figures'][number];

interface Props {
    keyFigure: KeyFigureItem;
}

function CustomKeyFigure(props: Props) {
    const { keyFigure } = props;

    const strings = useTranslation(i18n);

    // NOTE: server sends number as free text (e.g. "1,200"), so strip
    // non-numeric characters; unparsable values are shown as empty
    const value = Number.parseFloat(keyFigure.number.replace(/[^\d.-]/g, ''));

    return (
        <KeyFigureView
            label={keyFigure.deck}
            value={Number.isNaN(value) ? undefined : value}
            valueType="number"
            info={(
                <InfoPopup
                    description={(
                        <TextOutput
                            label={strings.customKeyFigureSourceLabel}
                            value={keyFigure.source}
                            textSize="sm"
                        />
                    )}
                />
            )}
            withShadow
        />
    );
}

export default CustomKeyFigure;
