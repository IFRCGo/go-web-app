import Header from '#components/Header';
import TopBanner from '#components/TopBanner';

import styles from './styles.module.css';

function TopBannerExample() {
    return (
        <div className={styles.topBanner}>
            <Header
                heading="TOP BANNER COLLECTION"
            />
            <Header
                heading="SUCCESS ALERT"
            />
            <TopBanner
                variant="positive"
            >
                This is banner for Success message
            </TopBanner>
            <Header
                heading="DANGER ALERT WITH ERROR MESSAGE"
            />
            <TopBanner
                variant="negative"
            >
                This is banner for Danger message
            </TopBanner>
            <Header
                heading="INFO ALERT"
            />
            <TopBanner
                variant="information"
            >
                This is banner for Info message
            </TopBanner>
            <Header
                heading="WARNING ALERT"
            />
            <TopBanner
                variant="warning"
            >
                This is banner for Warning message
            </TopBanner>
        </div>
    );
}

export default TopBannerExample;
