import {
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';

import DiffWrapper from '#components/DiffWrapper';

import { type PartialLocalUnits } from '../../LocalUnitsFormModal/LocalUnitsForm/schema';

import i18n from './i18n.json';

type OtherProfile = NonNullable<
    NonNullable<PartialLocalUnits['health']>['other_profiles']
>[number];

interface Props {
    newValue: OtherProfile;
    oldValue: OtherProfile | undefined;
}

function OtherProfilesDiffOutput(props: Props) {
    const { newValue, oldValue } = props;

    const strings = useTranslation(i18n);

    return (
        <ListView>
            <DiffWrapper
                hideOnPristine
                value={newValue?.position}
                previousValue={oldValue?.position}
                diffViewEnabled
            >
                <TextOutput
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
                <TextOutput
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
