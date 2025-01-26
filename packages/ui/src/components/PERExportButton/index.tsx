import {
    useEffect,
    useState,
} from 'react';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    /**
     * Position of the button relative to its container.
     * @default { right: '16px', top: '15px' }
     */
    position?: {
        right?: string;
        top?: string;
    };

    /**
     * Callback function when an export option is selected.
     */
    onExportClick?: () => void;

    /**
     * Whether the button is disabled.
     */
    disabled?: boolean;
}

function PERExportButton({
    position = { right: '16px', top: '15px' },
    onExportClick,
    disabled,
}: Props) {
    const strings = useTranslation(i18n);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
        event.stopPropagation();
        setIsOpen((prevState) => !prevState);
        if (onExportClick) {
            onExportClick();
        }
    };

    const handleClickOutside = (event: MouseEvent): void => {
        const target = event.target as Element;
        if (!target.closest(`.${styles.exportButtonWrapper}`)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div
            className={styles.exportButtonWrapper}
            style={position}
        >
            <button
                type="button"
                onClick={toggleMenu}
                className={styles.exportButton}
                disabled={disabled}
                aria-label={strings.button.ariaLabel}
            >
                {strings.button.label}
                {' '}
                <span className={`${styles.caret} ${isOpen ? styles.open : ''}`} />
            </button>
        </div>
    );
}

export default PERExportButton;
