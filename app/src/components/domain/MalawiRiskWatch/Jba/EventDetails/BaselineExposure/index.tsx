import {
    Container,
    InfoPopup,
    KeyFigure,
    ListView,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isNotDefined } from '@togglecorp/fujs';

import { HDX_ADM2_JOIN_COLUMN } from '../../../constants';
import useCsvRows from '../../../useCsvRows';
import useHdxDatasets from '../../../useHdxDatasets';
import { parseNumber } from '../../../utils';

import i18n from './i18n.json';

const FLOOD_EXPOSURE_DATASET = 'MWI_ADM2_flood_exposure';

const figureOptions = {
    compact: true,
    maximumFractionDigits: 0,
};

interface Props {
    pcode: string;
}

function BaselineExposure(props: Props) {
    const { pcode } = props;

    const strings = useTranslation(i18n);
    const { datasetByName } = useHdxDatasets();
    const { rows } = useCsvRows(datasetByName[FLOOD_EXPOSURE_DATASET]?.hdxUrl ?? undefined);

    const row = rows?.find((item) => item[HDX_ADM2_JOIN_COLUMN] === pcode);
    if (isNotDefined(row)) {
        return null;
    }

    return (
        <Container
            heading={strings.jbaBaselineExposureHeading}
            headingLevel={5}
            withBackground
            withPadding
            headerActions={(
                <InfoPopup
                    title={strings.jbaBaselineExposureHeading}
                    description={strings.jbaBaselineExposureInfo}
                />
            )}
        >
            <ListView
                withWrap
                withSpaceBetweenContents
            >
                <KeyFigure
                    label={strings.jbaBaselineExposureUnder15}
                    value={parseNumber(row.RP100_pop_u15_30cm)}
                    valueType="number"
                    valueOptions={figureOptions}
                    size="sm"
                />
                <KeyFigure
                    label={strings.jbaBaselineExposureElderly}
                    value={parseNumber(row.RP100_elderly_30cm)}
                    valueType="number"
                    valueOptions={figureOptions}
                    size="sm"
                />
                <KeyFigure
                    label={strings.jbaBaselineExposureFemale}
                    value={parseNumber(row.RP100_female_pop_30cm)}
                    valueType="number"
                    valueOptions={figureOptions}
                    size="sm"
                />
                <KeyFigure
                    label={strings.jbaBaselineExposureUnder5}
                    value={parseNumber(row.RP100_children_u5_30cm)}
                    valueType="number"
                    valueOptions={figureOptions}
                    size="sm"
                />
            </ListView>
        </Container>
    );
}

export default BaselineExposure;
