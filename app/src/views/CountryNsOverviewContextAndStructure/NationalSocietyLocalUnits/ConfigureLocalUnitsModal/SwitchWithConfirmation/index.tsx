import {
    useCallback,
    useEffect,
    useState,
} from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Button,
    ListView,
    Modal,
    Switch,
    TextInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { isFalsyString } from '@togglecorp/fujs';

import { type CountryOutletContext } from '#utils/outletContext';

import i18n from './i18n.json';

interface Props<NAME> {
    name: NAME;
    value: boolean | null | undefined;
    onChange: (newValue: boolean, name: NAME) => void;
    label: React.ReactNode;
}

function SwitchWithConfirmation<const NAME extends number>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        label,
    } = props;

    const strings = useTranslation(i18n);
    const [confirmationText, setConfirmationText] = useState<string>();
    const [newValue, setNewValue] = useState(value);

    const { countryResponse } = useOutletContext<CountryOutletContext>();
    const confirmDisabled = isFalsyString(countryResponse?.society_name)
        || confirmationText?.trim() !== countryResponse?.society_name;

    useEffect(() => {
        setNewValue(value);
    }, [value]);

    const handleConfirmButtonClick = useCallback(() => {
        onChange(!!newValue, name);
    }, [name, newValue, onChange]);

    const handleCancelButtonClick = useCallback(() => {
        setNewValue(value);
    }, [value]);

    return (
        <>
            <Switch
                name={name}
                label={label}
                value={value}
                withInvertedView
                withDarkBackground
                onChange={setNewValue}
            />
            {newValue !== value && (
                <Modal
                    onClose={handleCancelButtonClick}
                    heading={strings.confirmationModalHeading}
                    headerDescription={strings.confirmationModalDescription}
                    size="sm"
                    footerActions={(
                        <ListView spacing="sm">
                            <Button
                                name={undefined}
                                onClick={handleCancelButtonClick}
                            >
                                {strings.cancelButtonLabel}
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleConfirmButtonClick}
                                styleVariant="filled"
                                disabled={confirmDisabled}
                            >
                                {strings.confirmButtonLabel}
                            </Button>
                        </ListView>
                    )}
                >
                    <ListView layout="block">
                        <TextInput
                            name={undefined}
                            value={confirmationText}
                            onChange={setConfirmationText}
                            placeholder={strings.societyNameTextLabel}
                        />
                        {newValue
                            ? resolveToComponent(
                                strings.confirmationModalMakeExternallyManagedDescription,
                                { localUnitType: label },
                            ) : resolveToComponent(
                                strings.confirmationModalRemoveExternallyManagedDescription,
                                { localUnitType: label },
                            )}
                    </ListView>
                </Modal>
            )}
        </>
    );
}

export default SwitchWithConfirmation;
