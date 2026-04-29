import { useTranslation } from '@ifrc-go/ui/hooks';

import { type EmergencyOperationType as OperationType } from '#utils/domain/emergency';

import i18n from './i18n.json';

interface Props {
    type: OperationType;
}

function EmergencyOperationType(props: Props) {
    const { type } = props;

    const strings = useTranslation(i18n);

    const labelMap: Record<OperationType, string> = {
        'imminent-dref': strings.imminentDref,
        'response-dref': strings.responseDref,
        'emergency-appeal': strings.emergencyAppeal,
    };

    return labelMap[type];
}

export default EmergencyOperationType;
