import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Description from '#components/Description';
import InlineLayout from '#components/InlineLayout';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';

import i18n from './i18n.json';

export interface Props {
    maxLength?: number;
    length?: number;
    maxWords?: number;
    wordCount?: number;
}

function TextBadge(props: Props) {
    const {
        maxLength,
        length = 0,
        maxWords,
        wordCount = 0,
    } = props;

    const strings = useTranslation(i18n);

    if (isDefined(maxWords)) {
        return (
            <InlineLayout
                after={(
                    <Description withLightText textSize="sm">
                        {resolveToString(
                            strings.textBadgeWordCountLabel,
                            { wordCount, maxWords },
                        )}
                    </Description>
                )}
            />
        );
    }

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
