import { useTranslation } from '@ifrc-go/ui/hooks';

import ReadinessIcon from '../ReadinessIcon';

import i18n from './i18n.json';

interface Props {
    fundingReadiness: number | undefined;
    equipmentReadiness: number | undefined;
    peopleReadiness: number | undefined;
}

function ReadinessIconList(props: Props) {
    const { fundingReadiness, equipmentReadiness, peopleReadiness } = props;

    const strings = useTranslation(i18n);

    return (
        <>
            <ReadinessIcon
                readinessType={equipmentReadiness}
                label={strings.equipmentReadiness}
            />
            <ReadinessIcon
                readinessType={peopleReadiness}
                label={strings.peopleReadiness}
            />
            <ReadinessIcon
                readinessType={fundingReadiness}
                label={strings.fundingReadiness}
            />
        </>
    );
}

export default ReadinessIconList;
