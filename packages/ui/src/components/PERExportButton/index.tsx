import {
    useEffect,
    useState,
} from 'react';

import styles from './styles.module.css';

export interface Props {
    /**
     * Additional CSS class names to apply to the button.
     */
    className?: string;

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
    className,
    position = { right: '16px', top: '15px' },
    onExportClick,
    disabled,
}: Props) {
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
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            className={styles.exportButtonWrapper}
            style={position}
        >
            <button
                className={styles.exportButton}
                onClick={toggleMenu}
                disabled={disabled}
                type="button"
            >
                Export
                {' '}
                <span className={`${styles.caret} ${isOpen ? styles.open : ''}`} />
            </button>
        </div>
    );
}

export default PERExportButton;
