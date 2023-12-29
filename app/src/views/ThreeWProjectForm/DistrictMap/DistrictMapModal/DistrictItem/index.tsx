import { useMemo } from 'react';
import { DeleteBinFillIcon } from '@ifrc-go/icons';
import { Button } from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    _cs,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import { type DistrictItem as DistrictSearchItem } from '#components/domain/DistrictSearchMultiSelectInput';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface Props {
    className?: string;
    districtId: number;
    admin2Selections: number[] | undefined;
    onDistrictRemove: (item: number) => void;
    onAdmin2Remove: (item: number) => void;
    districtOptions: DistrictSearchItem[] | undefined | null;
    admin2Options: {id: number; name: string; district_id: number }[] | undefined | null;
}

function DistrictItem(props: Props) {
    const {
        className,
        districtId,
        onDistrictRemove,
        districtOptions,
        admin2Selections,
        admin2Options,
        onAdmin2Remove,
    } = props;

    const strings = useTranslation(i18n);

    const districtItem = useMemo(
        () => districtOptions?.find((item) => item.id === districtId),
        [
            districtOptions,
            districtId,
        ],
    );

    const admin2ObjectMap = useMemo(() => (
        listToMap(
            admin2Options,
            (item) => item.id,
            (item) => item,
        )
    ), [admin2Options]);

    const admin2InCurrentDistrict = useMemo(() => (
        admin2Selections?.filter((item) => admin2ObjectMap?.[item].district_id === districtId)
    ), [
        admin2ObjectMap,
        districtId,
        admin2Selections,
    ]);

    return (
        <div className={_cs(className, styles.districtItem)}>
            <div className={styles.district}>
                <div className={styles.name}>
                    {districtItem?.name}
                </div>
                <Button
                    name={districtId}
                    className={styles.removeButton}
                    onClick={onDistrictRemove}
                    variant="tertiary"
                    title={strings.removeDistrict}
                >
                    <DeleteBinFillIcon />
                </Button>
            </div>
            {isDefined(admin2InCurrentDistrict) && admin2InCurrentDistrict?.length > 0 && (
                <div className={styles.admin2Items}>
                    {admin2InCurrentDistrict.map((item) => (
                        <div
                            key={item}
                            className={styles.admin2Item}
                        >
                            <div className={styles.name}>
                                {admin2ObjectMap?.[item].name ?? '?'}
                            </div>
                            <Button
                                className={styles.removeButton}
                                name={item}
                                onClick={onAdmin2Remove}
                                variant="tertiary"
                                title={strings.removeAdmin2}
                            >
                                <DeleteBinFillIcon />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DistrictItem;
