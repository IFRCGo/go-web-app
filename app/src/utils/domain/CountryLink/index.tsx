import Link from '#components/Link';
import {
    COUNTRY_RECORD_TYPE_REGION,
    type CountryRecordTypeEnum,
} from '#utils/constants';
import { countryIdToRegionIdMap } from '#utils/domain/country';

export interface Props {
    id: number;
    name: string;
    recordType?: CountryRecordTypeEnum;
}

function CountryLink(props: Props) {
    const { id, name, recordType } = props;

    if (recordType === COUNTRY_RECORD_TYPE_REGION) {
        return (
            <Link
                to="regionsLayout"
                urlParams={{ regionId: countryIdToRegionIdMap[id] }}
            >
                {name}
            </Link>
        );
    }

    return (
        <Link
            to="countriesLayout"
            urlParams={{ countryId: id }}
        >
            {name}
        </Link>
    );
}

export default CountryLink;
