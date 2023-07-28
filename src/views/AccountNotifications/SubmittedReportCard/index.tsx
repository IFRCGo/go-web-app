import { _cs } from '@togglecorp/fujs';

import Header from '#components/Header';
import TextOutput from '#components/TextOutput';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    notificationData: any;
}

function SubmittedReportCard(props: Props) {
    const {
        className,
        notificationData,
    } = props;

    const strings = useTranslation(i18n);
    console.log('Check Account Notification::>>', notificationData);

    return (
        <Header
            className={_cs(styles.reportCard, className)}
            heading="Submitted Report"
            headingLevel={4}
            ellipsizeHeading
        >
            <TextOutput
                label={strings.submittedReportsLabel}
                value={undefined}
                valueType="date"
            />
        </Header>
    );
}

export default SubmittedReportCard;
