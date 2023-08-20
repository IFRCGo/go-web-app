import Button from '#components/Button';
import useBoolean from '#hooks/useBoolean';

import DistrictMapModal, { type Props as MapModalProps } from './DistrictMapModal';

type Props<NAME> = Omit<MapModalProps<NAME>, 'countryId'> & {
    countryId: number | undefined;
    className?: string;
};

function DistrictMap<const NAME>(props: Props<NAME>) {
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
    ] = useBoolean(false);

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
