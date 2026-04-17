import { useOutletContext } from 'react-router-dom';
import { isDefined } from '@togglecorp/fujs';

import TabPage from '#components/TabPage';
import { type CountryOutletContext } from '#utils/outletContext';

import RiskAnalysis from './RiskAnalysis';

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const { countryResponse } = useOutletContext<CountryOutletContext>();

    const countryId = isDefined(countryResponse?.id)
        ? String(countryResponse.id)
        : undefined;

    return (
        <TabPage>
            <RiskAnalysis
                countryId={countryId}
            />
        </TabPage>
    );
}

Component.displayName = 'Background';
