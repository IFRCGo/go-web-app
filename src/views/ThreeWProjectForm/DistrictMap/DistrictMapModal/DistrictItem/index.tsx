import { useMemo } from 'react';
import {
    _cs,
    listToMap,
} from '@togglecorp/fujs';
import { CloseFillIcon } from '@ifrc-go/icons';

import Button from '#components/Button';
import { type DistrictItem } from '#components/domain/DistrictSearchMultiSelectInput';

import styles from './styles.module.css';

interface Props {
    className?: string;
    districtId: number;
    admin2Selections: number[] | undefined;
    onDistrictRemove: (item: number) => void;
    onAdmin2Remove: (item: number) => void;
    districtOptions: DistrictItem[] | undefined | null;
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
            <Button
                className={styles.button}
                name={districtId}
                onClick={onDistrictRemove}
                variant="tertiary"
                actionsContainerClassName={styles.actions}
                actions={(<CloseFillIcon />)}
            >
                {districtItem?.name}
            </Button>
            <div className={styles.admin2Items}>
                {admin2InCurrentDistrict?.map((item) => (
                    <Button
                        className={styles.button}
                        name={item}
                        onClick={onAdmin2Remove}
                        variant="tertiary"
                        actionsContainerClassName={styles.actions}
                        actions={(<CloseFillIcon />)}
                    >
                        {admin2ObjectMap?.[item].name}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default DistrictItem;
