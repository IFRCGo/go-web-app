import { useState, useCallback } from 'react';
import { unique } from '@togglecorp/fujs';
import SearchSelectInput from '#components/SearchSelectInput';
import Heading from '#components/Heading';

import styles from './styles.module.css';

interface Option {
  label: string;
  value: string;
}

interface Data {
  id: string;
  title: string;
}
const mapResponseToValuesAndLabels = (data: Data) => ({
    value: data.id,
    label: data.title,
});

const keySelector = (d: Option) => d.value;

function SearchSelectInputExample() {
    const [selectedOption, setSearchSelectedOption] = useState<string | null>();
    const [options, setOptions] = useState<Option[]>([]);

    const handleChange = useCallback((value: string | null | undefined) => {
        setSearchSelectedOption(value);
    }, []);

    async function callApi(value: string) {
        const data = await fetch(`https://dummyjson.com/products/search?q=${value}`)
            .then((response) => response.json())
            .then((response) => response.products.map(mapResponseToValuesAndLabels));

        setOptions((prevData) => unique([...prevData, ...data], (d) => d.value));
        return data;
    }

    return (
        <div className={styles.searchSelectExample}>
            <Heading>Search Select Input</Heading>
            <SearchSelectInput
                label="Search Select Input"
                name="country"
                options={options}
                keySelector={keySelector}
                value={selectedOption}
                onChange={handleChange}
                loadOptions={callApi}
            />
            <SearchSelectInput
                label="Search Select input that is clearable"
                name="country"
                options={options}
                keySelector={keySelector}
                value={selectedOption}
                onChange={handleChange}
                loadOptions={callApi}
                isClearable
            />
            <SearchSelectInput
                label="Search Select input that is required"
                name="country"
                options={options}
                value={selectedOption}
                keySelector={keySelector}
                onChange={handleChange}
                loadOptions={callApi}
                required
            />
            <SearchSelectInput
                label="Search Select input that is disabled"
                name="country"
                options={options}
                value={selectedOption}
                keySelector={keySelector}
                onChange={handleChange}
                loadOptions={callApi}
                disabled
            />
            <SearchSelectInput
                label="Search Select input that is read only"
                name="country"
                options={options}
                value={selectedOption}
                keySelector={keySelector}
                loadOptions={callApi}
                onChange={handleChange}
                readOnly
            />
        </div>
    );
}
export default SearchSelectInputExample;
