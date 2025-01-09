import { _cs } from '@togglecorp/fujs';
import styles from './styles.module.css';

export interface Props {
    /**
     * The main title of the container.
     */
    title: string;

    /**
     * A subtitle providing additional context.
     */
    subtitle?: string;

    /**
     * The content to be rendered inside the container.
     */
    children: React.ReactNode;

    /**
     * Additional CSS class names to apply to the container.
     */
    className?: string;

    /**
     * The minimum width of the container.
     */
    minWidth?: string;

    /**
     * The minimum height of the container.
     */
    minHeight?: string;

    /**
     * Determines whether to show the reset filter button.
     */
    showResetFilter?: boolean;

    /**
     * Callback function invoked when the reset filter button is clicked.
     */
    onResetFilter?: () => void;

    /**
     * The label for the reset filter button.
     */
    resetFilterLabel?: string;

    /**
     * Additional actions to be rendered in the header.
     */
    actions?: React.ReactNode | React.ReactNode[];

    /**
     * Whether the container is disabled.
     */
    disabled?: boolean;
}

function PERContainer({
    title,
    subtitle,
    children,
    className,
    minWidth = '300px',
    minHeight = '300px',
    showResetFilter = false,
    onResetFilter,
    resetFilterLabel = 'Reset Filters',
    actions,
    disabled = false,
}: Props) {
    return (
        <div
            className={_cs(
                styles.container,
                className,
            )}
            style={{ minWidth, minHeight }}
        >
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>
                        {title}{' '}
                        {showResetFilter && (
                            <button
                                onClick={onResetFilter}
                                disabled={disabled}
                                className={styles.resetButton}
                                type="button"
                            >
                                {resetFilterLabel}
                            </button>
                        )}
                        {actions}
                    </h2>
                </div>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
}

export default PERContainer;
