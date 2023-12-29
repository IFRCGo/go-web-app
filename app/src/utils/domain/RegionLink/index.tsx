import Link from '#components/Link';

export interface Props {
    id: number;
    name: string;
}

function RegionLink(props: Props) {
    const { id, name } = props;

    return (
        <Link
            to="regionsLayout"
            urlParams={{ regionId: id }}
        >
            {name}
        </Link>
    );
}

export default RegionLink;
