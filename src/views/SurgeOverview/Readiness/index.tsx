import {
    useState,
    useCallback,
} from 'react';
import { isNotDefined, isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import CheckList from '#components/Checklist';
import List from '#components/List';
import Pager from '#components/Pager';
import Container from '#components/Container';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { useRequest } from '#utils/restRequest';
import { paths } from '#generated/types';

import EmergencyResponseUnitOwnerCard from './EmergencyResponseUnitOwnerCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

type GetERUOwners = paths['/api/v2/eru_owner/']['get'];
type GetERUOwnersResponse = GetERUOwners['responses']['200']['content']['application/json'];
type ERUOwnerListItem = NonNullable<GetERUOwnersResponse['results']>[number];

interface EmergencyResponseUnitType {
    key: number;
    label: string;
}
const PAGE_SIZE = 10;
const eruOwnerKeySelector = (item: ERUOwnerListItem) => item.id;
const emergencyResponseUnitTypeKeySelector = (item: EmergencyResponseUnitType) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: EmergencyResponseUnitType) => item.label;

function Readiness() {
    const [page, setPage] = useState(1);
    const [selectedERUTypes, setSelectedERUTypes] = useInputState<Array<EmergencyResponseUnitType['key']> | undefined>(undefined);

    const strings = useTranslation(i18n);

    const {
        error: eruOwnersError,
        pending: eruOwnersPending,
        response: eruOwnersResponse,
    } = useRequest<GetERUOwnersResponse>({
        url: 'api/v2/eru_owner/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            offset: PAGE_SIZE * (page - 1),
            eru_type: selectedERUTypes,
            available: isDefined(selectedERUTypes)
                && selectedERUTypes.length > 0 ? true : undefined,
        },
    });

    const {
        pending: emergencyResponseUnitTypesPending,
        response: emergencyResponseUnitTypesResponse,
    } = useRequest<EmergencyResponseUnitType[]>({
        url: 'api/v2/erutype/',
    });

    const handleERUOwnerTypesChange = useCallback((values: EmergencyResponseUnitType['key'][] | undefined) => {
        if (isDefined(values) && values.length > 0) {
            setSelectedERUTypes(values);
        } else {
            setSelectedERUTypes(undefined);
        }
        setPage(1);
    }, [setSelectedERUTypes]);

    const rendererParams = useCallback((_: ERUOwnerListItem['id'], eruOwner: ERUOwnerListItem) => ({
        data: eruOwner,
        className: styles.eruOwner,
    }), []);

    const handleClearFilter = useCallback(() => {
        setSelectedERUTypes(undefined);
        setPage(1);
    }, [setSelectedERUTypes]);

    return (
        <Container
            className={styles.eruOwnersTable}
            heading={resolveToString(
                strings.eruOwnersTableHeading,
                { count: eruOwnersResponse?.count },
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eruOwnersResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            childrenContainerClassName={styles.content}
        >
            <Container
                heading={strings.eruOwnersTableFilterReady}
                childrenContainerClassName={styles.filterContainer}
            >
                <CheckList
                    listContainerClassName={styles.filter}
                    name="eruType"
                    options={emergencyResponseUnitTypesResponse}
                    value={selectedERUTypes}
                    keySelector={emergencyResponseUnitTypeKeySelector}
                    labelSelector={emergencyResponseUnitTypeLabelSelector}
                    onChange={handleERUOwnerTypesChange}
                />
                <Button
                    name={undefined}
                    variant="secondary"
                    onClick={handleClearFilter}
                    disabled={emergencyResponseUnitTypesPending || isNotDefined(selectedERUTypes)}
                >
                    {strings.eruOwnersTableFilterClear}
                </Button>
            </Container>
            <div className={styles.eruOwnersList}>
                <List
                    data={eruOwnersResponse?.results}
                    pending={eruOwnersPending}
                    errored={!!eruOwnersError}
                    filtered={false}
                    keySelector={eruOwnerKeySelector}
                    renderer={EmergencyResponseUnitOwnerCard}
                    rendererParams={rendererParams}
                />
            </div>
        </Container>
    );
}

export default Readiness;
