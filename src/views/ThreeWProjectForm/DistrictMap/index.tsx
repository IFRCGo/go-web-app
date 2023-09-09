import Button from '#components/Button';
import useBooleanState from '#hooks/useBooleanState';

import DistrictMapModal, { type Props as MapModalProps } from './DistrictMapModal';

type Props<NAME, ADMIN2_NAME> = Omit<MapModalProps<NAME, ADMIN2_NAME>, 'countryId' | 'onModalClose'> & {
    countryId: number | undefined;
    className?: string;
};

function DistrictMap<
    const NAME,
    const ADMIN2_NAME,
>(props: Props<NAME, ADMIN2_NAME>) {
    const {
        className,
        countryId,
        disabled,
        ...otherProps
    } = props;

    const [
        modalShown,
        {
            setTrue: showModal,
            setFalse: hideModal,
        },
    ] = useBooleanState(false);

    return (
        <>
            <Button
                className={className}
                name={undefined}
                disabled={!countryId || disabled}
                onClick={showModal}
                variant="tertiary"
            >
                {/* FIXME: Use translations */}
                Select Province / Region
            </Button>
            {modalShown && countryId && (
                <DistrictMapModal
                    countryId={countryId}
                    disabled={disabled}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                    onModalClose={hideModal}
                />
            )}
        </>
    );
}

export default DistrictMap;
