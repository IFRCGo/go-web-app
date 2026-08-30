import styles from './styles.module.css';

interface Props {
    backgroundImageUrl: string;
}

function HeaderBackground(props: Props) {
    const { backgroundImageUrl } = props;

    return (
        <div className={styles.headerBackground}>
            <img
                className={styles.headerBackgroundImage}
                alt=""
                src={backgroundImageUrl}
            />
            <div className={styles.headerBackgroundOverlay} />
        </div>
    );
}

export default HeaderBackground;
