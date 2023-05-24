import { _cs } from '@togglecorp/fujs';
import styles from './styles.module.css';

export interface Props {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerContainerClassName?: string;
    childrenContainerClassName?: string;
}

function OptionGroup(props: Props) {
    const {
        className,
        title,
        children,
        headerContainerClassName,
        childrenContainerClassName,
    } = props;

    return (
        <div className={_cs(className, styles.optionGroup)}>
            <header
                className={_cs(headerContainerClassName, styles.groupHeader)}
                title={title}
            >
                {title}
            </header>
            <div className={_cs(childrenContainerClassName, styles.groupChildren)}>
                { children }
            </div>
        </div>
    );
}

export default OptionGroup;
