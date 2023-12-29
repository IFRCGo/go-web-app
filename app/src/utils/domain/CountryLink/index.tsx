import Link from '#components/Link';

export interface Props {
    id: number;
    name: string;
}

function CountryLink(props: Props) {
    const { id, name } = props;

    return (
        <Link
            to="countriesLayout"
            urlParams={{ countryId: id }}
        >
            {name}
        </Link>
    );
}

export default CountryLink;
