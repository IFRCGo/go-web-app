import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#components/Button';
import useReduxState from '#hooks/useReduxState';
import useBooleanState from '#hooks/useBooleanState';
import { SetValueArg } from '#utils/common';

import RegionSelectionModal from './RegionSelectionModal';
import styles from './styles.module.scss';

interface Props<DN, DV extends number, AN, AV extends number> {
    className?: string;
    countryId?: number;
    districtsInputName: DN;
    districtsInputValue: DV[] | undefined | null;
    onDistrictsChange: (newValue: SetValueArg<DV[] | undefined>, name: DN) => void;
    admin2sInputName: AN;
    admin2sInputValue: AV[] | undefined | null;
    onAdmin2sChange: (newValue: SetValueArg<AV[] | undefined>, name: AN) => void;
}

function RegionSelectionInput<
    DN,
    DV extends number,
    AN,
    AV extends number,
>(props: Props<DN, DV, AN, AV>) {
    const {
        className,
        countryId,
        districtsInputName,
        districtsInputValue,
        onDistrictsChange,
        admin2sInputName,
        admin2sInputValue,
        onAdmin2sChange,
    } = props;

    const [
        showModal,
        setShowModalTrue,
        setShowModalFalse,
    ] = useBooleanState(false);

    const [districts, setDistricts] = React.useState<DV[]>(districtsInputValue ?? []);
    const [admin2s, setAdmin2s] = React.useState<AV[]>(admin2sInputValue ?? []);

    const allCountries = useReduxState('allCountries');
    const countryDetails = allCountries.data.results.find((c) => c.id === countryId);

    const handleCloseButtonClick = React.useCallback(() => {
        setShowModalFalse();
    }, [setShowModalFalse]);

    const handleSaveButtonClick = React.useCallback(() => {
        setShowModalFalse();
        onDistrictsChange(districts, districtsInputName);

        // TODO: validate all admin2s before submission
        onAdmin2sChange(admin2s, admin2sInputName);
    }, [
        admin2s,
        districts,
        onDistrictsChange,
        onAdmin2sChange,
        setShowModalFalse,
        admin2sInputName,
        districtsInputName,
    ]);

    const handleSelectButtonClick = React.useCallback(() => {
        setDistricts(districtsInputValue ?? []);
        setAdmin2s(admin2sInputValue ?? []);
        setShowModalTrue();
    }, [admin2sInputValue, districtsInputValue, setShowModalTrue]);

    return (
        <>
            <Button
                className={_cs(styles.provinceButton, className)}
                name="district"
                onClick={handleSelectButtonClick}
                disabled={!countryId}
                variant="tertiary"
            >
                {!districtsInputValue || districtsInputValue.length === 0 ?
                    'Select Province/Region' : 'Edit Province/Region'}
            </Button>
            {showModal && countryDetails && (
                <RegionSelectionModal
                    countryDetails={countryDetails}
                    districts={districts}
                    onDistrictsChange={setDistricts}
                    admin2s={admin2s}
                    onAdmin2sChange={setAdmin2s}
                    onCloseButtonClick={handleCloseButtonClick}
                    onSaveButtonClick={handleSaveButtonClick}
                />
            )}
        </>
    );
}

export default RegionSelectionInput;


