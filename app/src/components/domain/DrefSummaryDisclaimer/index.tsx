import { InformationLineIcon } from '@ifrc-go/icons';
import {
    Description,
    InlineLayout,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    // Use the plural wording when the note covers more than one summary block.
    multiple?: boolean;
}

function DrefSummaryDisclaimer(props: Props) {
    const { multiple = false } = props;
    const strings = useTranslation(i18n);

    return (
        <InlineLayout
            className={styles.drefSummaryDisclaimer}
            before={<InformationLineIcon />}
            contentAlignment="start"
            withPadding
            spacing="xs"
            withoutSpacingOpticalCorrection
        >
            <Description
                withLightText
                textSize="sm"
            >
                {multiple ? strings.multiple : strings.single}
            </Description>
        </InlineLayout>
    );
}

export default DrefSummaryDisclaimer;
