import { TopBanner } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import i18n from './i18n.json';

function ViewOnlyModeBanner() {
    const strings = useTranslation(i18n);

    return (
        <TopBanner variant="warning">
            {strings.viewOnlyModeBannerMessage}
        </TopBanner>
    );
}

export default ViewOnlyModeBanner;
