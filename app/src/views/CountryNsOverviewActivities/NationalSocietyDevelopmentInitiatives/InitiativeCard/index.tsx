import {
    Container,
    ListView,
    NumberOutput,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToString } from '@ifrc-go/ui/utils';

import { type GoApiResponse } from '#utils/restRequest';

import i18n from './i18n.json';

type CountryResponse = NonNullable<GoApiResponse<'/api/v2/country/{id}/'>>
interface Props {
    className?: string;
    initiative: NonNullable<CountryResponse['initiatives']>[number];
}

function InitiativeCard(props: Props) {
    const {
        className,
        initiative,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            pending={false}
            errored={false}
            empty={false}
            filtered={false}
            className={className}
            headingLevel={4}
            withHeaderBorder
            withFooterBorder
            heading={initiative.title}
            headerDescription={resolveToString(
                strings.initiativeFund,
                {
                    fundType: initiative.fund_type,
                },
            )}
            footer={(
                <TextOutput
                    label={strings.initiativeCategoriesTitle}
                    value={initiative.categories}
                    valueType="text"
                />
            )}
            backgroundColor="foreground"
            boxShadow="md"
            withPadding
        >
            <ListView
                layout="grid"
                minGridColumnSize="6rem"
            >
                <TextOutput
                    value={resolveToString(
                        strings.initiativeYearApprovedAndDuration,
                        {
                            yearApproved: initiative.year,
                            duration: initiative.funding_period,
                        },
                    )}
                    description={strings.initiativeYearApprovedTitle}
                    strongValue
                    withoutLabelColon
                />
                <TextOutput
                    value={(
                        <NumberOutput
                            value={initiative.allocation}
                        />
                    )}
                    description={strings.initiativeAllocationTitle}
                    strongValue
                    withoutLabelColon
                />
            </ListView>
        </Container>
    );
}

export default InitiativeCard;
