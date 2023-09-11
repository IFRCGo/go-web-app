import {
    useState,
    useCallback,
} from 'react';
import { isNotDefined, isDefined } from '@togglecorp/fujs';

import Button from '#components/Button';
import CheckList from '#components/Checklist';
import Grid from '#components/Grid';
import Pager from '#components/Pager';
import Container from '#components/Container';
import useInputState from '#hooks/useInputState';
import useTranslation from '#hooks/useTranslation';
import { resolveToString } from '#utils/translation';
import { useRequest, type GoApiResponse } from '#utils/restRequest';
import { type components } from '#generated/types';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import EmergencyResponseUnitOwnerCard from './EmergencyResponseUnitOwnerCard';
import i18n from './i18n.json';
import styles from './styles.module.css';

type DeploymentsEruTypeEnum = components<'read'>['schemas']['DeploymentsEruTypeEnum'];

type GetERUOwnersResponse = GoApiResponse<'/api/v2/eru_owner/'>;
type ERUOwnerListItem = NonNullable<GetERUOwnersResponse['results']>[number];

const PAGE_SIZE = 10;

const eruOwnerKeySelector = (item: ERUOwnerListItem) => item.id;

const emergencyResponseUnitTypeKeySelector = (item: DeploymentsEruTypeEnum) => item.key;
const emergencyResponseUnitTypeLabelSelector = (item: DeploymentsEruTypeEnum) => item.value ?? '?';

function Readiness() {
    const [selectedERUTypes, setSelectedERUTypes] = useInputState<
        Array<DeploymentsEruTypeEnum['key']> | undefined
    >(undefined);
    const [page, setPage] = useState(1);

    const strings = useTranslation(i18n);

    // FIXME: use useFilterState
    const {
        error: eruOwnersError,
        pending: eruOwnersPending,
        response: eruOwnersResponse,
    } = useRequest({
        url: '/api/v2/eru_owner/',
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
        deployments_eru_type,
    } = useGlobalEnums();

    const handleERUOwnerTypesChange = useCallback((values: DeploymentsEruTypeEnum['key'][] | undefined) => {
        if (isDefined(values) && values.length > 0) {
            setSelectedERUTypes(values);
        } else {
            setSelectedERUTypes(undefined);
        }
        setPage(1);
    }, [setSelectedERUTypes]);

    const rendererParams = useCallback((_: number, eruOwner: ERUOwnerListItem) => ({
        data: eruOwner,
    }), []);

    const handleClearFilter = useCallback(() => {
        setSelectedERUTypes(undefined);
        setPage(1);
    }, [setSelectedERUTypes]);

    return (
        <Container
            className={styles.eruOwnersTable}
            withHeaderBorder
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={eruOwnersResponse?.count ?? 0}
                    maxItemsPerPage={PAGE_SIZE}
                    onActivePageChange={setPage}
                />
            )}
            childrenContainerClassName={styles.content}
            filtersContainerClassName={styles.filters}
            filters={(
                <Container
                    heading={strings.eruOwnersTableFilterReady}
                    headingLevel={3}
                >
                    <CheckList
                        listContainerClassName={styles.checklistContainer}
                        name="eruType"
                        options={deployments_eru_type}
                        value={selectedERUTypes}
                        keySelector={emergencyResponseUnitTypeKeySelector}
                        labelSelector={emergencyResponseUnitTypeLabelSelector}
                        onChange={handleERUOwnerTypesChange}
                    />
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={handleClearFilter}
                        disabled={isNotDefined(selectedERUTypes)}
                    >
                        {strings.eruOwnersTableFilterClear}
                    </Button>
                </Container>
            )}
        >
            <Container
                heading={resolveToString(
                    strings.eruOwnersTableHeading,
                    { count: eruOwnersResponse?.count },
                )}
                headingLevel={3}
            >
                <Grid
                    numPreferredColumns={3}
                    data={eruOwnersResponse?.results}
                    pending={eruOwnersPending}
                    errored={isDefined(eruOwnersError)}
                    filtered={isDefined(selectedERUTypes)}
                    keySelector={eruOwnerKeySelector}
                    renderer={EmergencyResponseUnitOwnerCard}
                    rendererParams={rendererParams}
                />
            </Container>
        </Container>
    );
}

export default Readiness;
