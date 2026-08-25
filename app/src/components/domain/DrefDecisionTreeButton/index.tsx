import {
    useCallback,
    useState,
} from 'react';
import {
    Button,
    type ButtonLayoutProps,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DrefDecisionTreeModal from '#components/domain/DrefDecisionTree';

import i18n from './i18n.json';

interface Props {
    className?: string;
    // Open the wizard on mount (e.g. when arriving from the Respond menu shortcut).
    initiallyOpen?: boolean;
    buttonStyleVariant?: ButtonLayoutProps['styleVariant'];
}

function DrefDecisionTreeButton(props: Props) {
    const {
        className,
        initiallyOpen = false,
        buttonStyleVariant = 'filled',
    } = props;
    const strings = useTranslation(i18n);

    const [isShown, setIsShown] = useState(initiallyOpen);
    const showModal = useCallback(() => setIsShown(true), []);
    const hideModal = useCallback(() => setIsShown(false), []);

    return (
        <>
            <Button
                className={className}
                name="drefDecisionTree"
                onClick={showModal}
                colorVariant="primary"
                styleVariant={buttonStyleVariant}
            >
                {strings.drefDecisionTreeButtonLabel}
            </Button>
            {isShown && (
                <DrefDecisionTreeModal onClose={hideModal} />
            )}
        </>
    );
}

export default DrefDecisionTreeButton;
