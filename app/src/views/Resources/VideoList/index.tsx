import { Heading } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';
import styles from './styles.module.css';

function VideoList() {
    const strings = useTranslation(i18n);

    const videoLinks: {
        id: number;
        embedId: string;
        heading: string;
        description: string;
    }[] = [
        {
            id: 1,
            embedId: 'https://www.youtube.com/embed/BEWxqYfrQek',
            heading: strings.videoCarouselHeadingMontandon,
            description: strings.videoCarouselSubHeadingMontandon,
        },
        {
            id: 2,
            embedId: 'https://www.youtube.com/embed/E1TuUEEMBRM',
            heading: strings.videoCarouselHeading3W,
            description: strings.videoCarouselSubHeading3W,
        },
        {
            id: 3,
            embedId: 'https://www.youtube.com/embed/Oyy_JboK9uY',
            heading: strings.videoCarouselHeadingHealth,
            description: strings.videoCarouselSubHeadingHealth,
        },
        {
            id: 4,
            embedId: 'https://www.youtube.com/embed/wEz70tcwWx8',
            heading: strings.videoCarouselHeadingSubscribe,
            description: strings.videoCarouselSubHeadingSubscribe,
        },
        {
            id: 5,
            embedId: 'https://www.youtube.com/embed/7PvsxM_nzBo',
            heading: strings.videoCarouselHeading3wDataCollection,
            description: strings.videoCarouselSubHeading3wDataCollection,
        },
    ];

    return (
        <div className={styles.videoList}>
            {videoLinks.map(
                (videoLink) => (
                    <div
                        key={videoLink.id}
                        className={styles.videoItem}
                    >
                        <iframe
                            className={styles.iframe}
                            title={videoLink.heading}
                            src={videoLink.embedId}
                            allow=""
                            allowFullScreen
                        />
                        <Heading level={4}>
                            {videoLink.heading}
                        </Heading>
                        <div className={styles.description}>
                            {videoLink.description}
                        </div>
                    </div>
                ),
            )}
        </div>
    );
}

export default VideoList;
