import DropdownMenu from '#components/DropdownMenu';
import DropdownMenuItem from '#components/DropdownMenuItem';
import styles from './styles.module.css';

function DropdownExample() {
    return (
        <div className={styles.dropdownCollection}>
            <DropdownMenu
                className={styles.dropdownOptions}
                label="Create a new project"
            >
                <DropdownMenuItem
                    className={styles.menuItem}
                    onClick={undefined}
                    label="Menu One"
                />
                <DropdownMenuItem
                    className={styles.menuItem}
                    onClick={undefined}
                    label="Menu Two"
                />
                <DropdownMenuItem
                    className={styles.menuItem}
                    onClick={undefined}
                    label="Menu Three"
                />
                <DropdownMenuItem
                    className={styles.menuItem}
                    onClick={undefined}
                    label="Google Link"
                    href="https://www.google.com"
                />
                <DropdownMenuItem
                    className={styles.menuItem}
                    onClick={undefined}
                    label="Disabled Menu"
                    disabled
                />
            </DropdownMenu>
        </div>
    );
}
export default DropdownExample;
