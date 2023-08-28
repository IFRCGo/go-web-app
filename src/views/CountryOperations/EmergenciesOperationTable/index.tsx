import { useRequest, type GoApiResponse } from '#utils/restRequest';
import {
    useSortState,
    SortContext,
    getOrdering,
} from '#components/Table/useSorting';

const PAGE_SIZE = 5;
const now = new Date();
now.setDate(now.getDate() - 30);
now.setHours(0, 0, 0, 0);

const startDate = now.toISOString();

interface Props {
    countryId?: string;
}

function EmergenciesOperationTable(props: Props) {
    const { countryId } = props;

    const sortState = useSortState();
    const { sorting } = sortState;

    const {
        pending: countryEmergenciesPending,
        response: countryEmergenciesResponse,
    } = useRequest({
        url: '/api/v2/event/',
        preserveResponse: true,
        query: {
            limit: PAGE_SIZE,
            countries__in: Number(countryId),
            ordering: '-disaster_start_date',
            disaster_start_date__gte: startDate,
        },
    });
    console.log('emergencies', countryEmergenciesResponse);
    return (
        /*
        <SortContext.Provider value={sortState}>
            <Table
                filtered={false}
                pending={countryEmergenciesPending}
                data={countryEmergenciesPending?.results}
                keySelector={keySelector}
                columns={columns}
            />
        </SortContext.Provider>
         */
        <div>emergencies</div>
    );
}

export default EmergenciesOperationTable;
