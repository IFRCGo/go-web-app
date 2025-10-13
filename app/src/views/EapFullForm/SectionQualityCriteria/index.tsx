import { CheckboxMultipleBlankFillIcon } from '@ifrc-go/icons';
import { useTranslation } from '@ifrc-go/ui/hooks';

import InfoModal from '#components/domain/InfoModal';

import i18n from './i18n.json';

interface Props {
    content: React.ReactNode;
    heading: string;
}

function SectionQualityCriteria(props: Props) {
    const {
        content,
        heading,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <InfoModal
            name={undefined}
            heading={heading}
            modalContent={content}
            label={strings.sectionQualityCriteriaLabel}
            after={(<CheckboxMultipleBlankFillIcon />)}
        />
    );
}

export default SectionQualityCriteria;
