import styles from './styles.module.css';

export interface Props {
    label: string;
}

function Signature(props: Props) {
    const { label } = props;

    return (
        <div className={styles.signature}>
            <div className={styles.signatureSpace} />
            <div className={styles.line} />
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default Signature;
