import {
    DataDisplay,
    ListView,
    type ListViewProps,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import DiffWrapper from '#components/DiffWrapper';

import { type PartialLocalUnits } from '../../LocalUnitsFormModal/schema';

import i18n from './i18n.json';

type OtherProfile = NonNullable<
    NonNullable<PartialLocalUnits['health']>['other_profiles']
>[number];

interface Props {
    newValue: OtherProfile;
    oldValue: OtherProfile | undefined;
    backgroundColor?: ListViewProps['backgroundColor'];
}

function OtherProfilesDiffOutput(props: Props) {
    const {
        newValue,
        oldValue,
        backgroundColor,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <ListView
            withPadding={isDefined(backgroundColor)}
            backgroundColor={backgroundColor}
            spacing="sm"
            layout="grid"
        >
            <DiffWrapper
                hideOnPristine
                value={newValue?.position}
                previousValue={oldValue?.position}
                diffViewEnabled
            >
                <DataDisplay
                    strongValue
                    value={newValue.position}
                    label={strings.otherProfilePositionOutputLabel}
                />
            </DiffWrapper>
            <DiffWrapper
                hideOnPristine
                value={newValue?.number}
                previousValue={oldValue?.number}
                diffViewEnabled
            >
                <DataDisplay
                    strongValue
                    valueType="number"
                    label={strings.otherProfileNumberOutputLabel}
                    value={newValue.number}
                />
            </DiffWrapper>
        </ListView>
    );
}

export default OtherProfilesDiffOutput;
