import Link from '#components/Link';

export interface Props {
    eruId: number;
}

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component(props: Props) {
    const {
        eruId,
    } = props;

    return (
        <Link
            to="updateERUReadinessForm"
            variant="primary"
            state={{ eruId }}
        >
            Update ERU Readiness
        </Link>
    );
}

Component.displayName = 'EmergencyResponseUnit';
