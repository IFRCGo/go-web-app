import { CheckboxMultipleBlankFillIcon } from '@ifrc-go/icons';
import {
    Button,
    InlineLayout,
    Modal,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

interface Props {
    heading?: string;
    content: React.ReactNode
}

function SectionQualityCriteria(props: Props) {
    const { content, heading } = props;
    const strings = useTranslation(i18n);

    const [
        showQualityCriteria,
        {
            setTrue: setShowQualityCriteriaTrue,
            setFalse: setShowQualityCriteriaFalse,
        },
    ] = useBooleanState(false);

    return (
        <>
            <InlineLayout
                withPadding
                after={(
                    <Button
                        name={undefined}
                        onClick={setShowQualityCriteriaTrue}
                        after={(<CheckboxMultipleBlankFillIcon />)}
                    >
                        {strings.sectionCriteriaButtonLabel}
                    </Button>
                )}
            />
            {showQualityCriteria && (
                <Modal
                    onClose={setShowQualityCriteriaFalse}
                    heading={heading}
                    size="auto"
                >
                    {content}
                </Modal>
            )}
        </>
    );
}

export default SectionQualityCriteria;
