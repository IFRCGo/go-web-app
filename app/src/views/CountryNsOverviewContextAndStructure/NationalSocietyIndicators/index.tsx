import {
    Container,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { sumSafe } from '@ifrc-go/ui/utils';

import Link from '#components/Link';
import { GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props {
    databankResponse: GoApiResponse<'/api/v2/country/{id}/databank/'> | undefined;
}

function NationalSocietyIndicators(props: Props) {
    const strings = useTranslation(i18n);
    const { databankResponse } = props;

    if (!databankResponse) {
        return null;
    }

    const youthValue = sumSafe([
        databankResponse?.volunteer_age_6_12,
        databankResponse?.volunteer_age_13_17,
        databankResponse?.volunteer_age_18_29,
        databankResponse?.staff_age_18_29,
    ]);

    return (
        <Container
            heading={strings.nationalSocietyIndicatorsTitle}
            actions={(
                <Link
                    href="https://data.ifrc.org/FDRS/"
                    external
                    withLinkIcon
                    variant="primary"
                >
                    {strings.goToFDRS}
                </Link>
            )}
            headingLevel={4}
            withHeaderBorder
            contentViewType="grid"
            numPreferredGridContentColumns={3}
        >
            <TextOutput
                label={strings.nationalSocietyFoundedDateLabel}
                value={databankResponse?.founded_date}
                valueType="date"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyTrainedInFirstAidLabel}
                value={databankResponse?.trained_in_first_aid}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyIncomeLabel}
                value={databankResponse?.income}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyVolunteersLabel}
                value={databankResponse?.volunteer_total}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyYouthLabel}
                value={youthValue}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyExpendituresLabel}
                value={databankResponse?.expenditures}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyBranchesLabel}
                value={databankResponse?.branches}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyStaffLabel}
                value={databankResponse?.staff_total}
                valueType="number"
                strongValue
            />
            <TextOutput
                label={strings.nationalSocietyTrainedInFirstAidLabel}
                value={databankResponse?.trained_in_first_aid}
                valueType="number"
                strongValue
            />
        </Container>
    );
}

export default NationalSocietyIndicators;
