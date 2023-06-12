import { useRequest } from '#utils/restRequest';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const {
        pending,
        response,
    } = useRequest({
        url: 'api/v2/per/',
    });

    console.info(response);

    return (
        <div>
            PER Forms
        </div>
    );
}

Component.displayName = 'AccountPerForms';
