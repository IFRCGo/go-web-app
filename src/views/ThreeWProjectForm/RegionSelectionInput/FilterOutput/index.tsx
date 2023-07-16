import React from 'react';
import {
  _cs,
  listToMap,
  listToGroupList,
} from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';

import Button from '#components/Button';
import styles from './styles.module.scss';

interface Value {
  value: number;
  label: string;
}

interface Props<DV extends number, AV extends number> {
  className?: string;
  districtOptions: Value[];
  admin2IdToLabelMap: Record<string, string>
  districts: DV[];
  admin2s: AV[];
  onDistrictsChange: (newValue: DV[]) => void;
  onAdmin2sChange: (newValue: AV[]) => void;
  admin2ToDistrictMap: Record<string, number>;
  doubleClickedDistrict?: number;
}

function FilterOutput<DV extends number, AV extends number>(props: Props<DV, AV>) {
  const {
    className,
    districtOptions,
    districts,
    admin2s,
    admin2ToDistrictMap,
    onDistrictsChange,
    admin2IdToLabelMap,
    onAdmin2sChange,
    doubleClickedDistrict,
  } = props;

  const districtLabelMap = React.useMemo(() => (
    listToMap(districtOptions, (o) => o.value, (o) => o.label)
  ), [districtOptions]);

  const handleDistrictDismiss = React.useCallback((districtId: number)=> {
    if (!districts) {
      return undefined;
    }

    const newDistricts = [...districts];
    const index = newDistricts.findIndex((district) => district === districtId);
    if (index !== -1) {
      newDistricts.splice(index, 1);
    }

    onDistrictsChange(newDistricts);
  }, [districts, onDistrictsChange]);

  const handleAdmin2Dismiss = React.useCallback((admin2Id: number)=> {
    if (!admin2s) {
      return undefined;
    }

    const newAdmin2s = [...admin2s];
    const index = newAdmin2s.findIndex((admin2) => admin2 === admin2Id);
    if (index !== -1) {
      newAdmin2s.splice(index, 1);
    }

    onAdmin2sChange(newAdmin2s);
  }, [admin2s, onAdmin2sChange]);

  const admin2sForSelectedDistricts = React.useMemo(() => {
    return listToGroupList(
      admin2s ?? [],
      (admin2) => admin2ToDistrictMap[admin2],
      (admin2) => admin2,
    );
  }, [admin2ToDistrictMap, admin2s]);

  return (
    <div className={_cs(styles.filterOutput, className)}>
      <div className={styles.districtList}>
          {[...districts ?? []].reverse().map((district) => (
            <div
              className={styles.districtItem}
              key={String(district)}
            >
              <div className={styles.districtName}>
                <div className={styles.label}>
                  {districtLabelMap[district]}
                </div>
                {doubleClickedDistrict !== district && (
                  <Button
                    className={styles.dismissButton}
                    name={district}
                    onClick={handleDistrictDismiss}
                    variant="action"
                  >
                    <IoClose />
                  </Button>
                )}
              </div>
              {admin2sForSelectedDistricts[district] && (
                <div className={styles.adminTwoList}>
                  {admin2sForSelectedDistricts[district].map((admin2) => (
                    <div
                      className={styles.adminTwoItem}
                      key={admin2}
                    >
                      <div className={styles.label}>
                        {admin2IdToLabelMap[admin2]}
                      </div>
                      <Button
                        className={styles.dismissButton}
                        name={admin2}
                        onClick={handleAdmin2Dismiss}
                        variant="action"
                      >
                        <IoClose />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default FilterOutput;
