import Link from '#components/Link';

// eslint-disable-next-line import/prefer-default-export
export function Component() {
    return (
        <Link
            to="updateERUReadinessForm"
            variant="primary"
        >
            Update ERU Readiness
        </Link>
    );
}

Component.displayName = 'EmergencyResponseUnit';
