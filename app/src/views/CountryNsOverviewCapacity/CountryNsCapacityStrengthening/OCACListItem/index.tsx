import {
    Container,
    KeyFigure,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';

type CapacityItem = NonNullable<NonNullable<CountryOutletContext['countryResponse']>['capacity']>[number];

interface Props {
    capacity: CapacityItem;
}

function OCACListItem(props: Props) {
    const {
        capacity,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <Container
            empty={false}
            errored={false}
            filtered={false}
            pending={false}
            heading={
                `${capacity.assessment_type_display.toUpperCase()}
                ${strings.capacityListItemAssessment}`
            }
            headingLevel={4}
            withPadding
            backgroundColor="foreground"
            boxShadow="md"
        >
            <KeyFigure
                value={capacity.submission_date}
                valueType="date"
                format="MMM yyyy"
                label={strings.capacityListItemDateOfAssessment}
            />
        </Container>
    );
}

export default OCACListItem;
