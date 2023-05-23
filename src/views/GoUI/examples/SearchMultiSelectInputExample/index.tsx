import { useState } from 'react';

import SearchMultiSelectInput from '#components/SearchMultiSelectInput';
import Heading from '#components/Heading';

import useQuery, { entityListTransformer } from '#hooks/useQuery';

import styles from './styles.module.css';

interface Option {
    id: string;
    name: string;
}

const options: Option[] = [
    { id: '1', name: 'Abiu' },
    { id: '2', name: 'Açaí' },
    { id: '3', name: 'Acerola' },
    { id: '4', name: 'Ackee' },
    { id: '5', name: 'African cucumber' },
    { id: '6', name: 'Apple' },
    { id: '7', name: 'Apricot' },
    { id: '8', name: 'Avocado' },
    { id: '9', name: 'Banana' },
    { id: '10', name: 'Bilberry' },
    { id: '11', name: 'Blackberry' },
    { id: '12', name: 'Blackcurrant' },
    { id: '13', name: 'Black sapote' },
    { id: '14', name: 'Blueberry' },
    { id: '15', name: 'Boysenberry' },
    { id: '16', name: 'Breadfruit' },
    { id: '17', name: 'Buddha\'s hand (fingered citron)' },
    { id: '18', name: 'Cactus pear' },
    { id: '19', name: 'Canistel' },
    { id: '20', name: 'Cempedak' },
    { id: '21', name: 'Crab apple' },
    { id: '22', name: 'Currant' },
    { id: '23', name: 'Cherry' },
    { id: '24', name: 'Cherimoya (Custard Apple)' },
    { id: '25', name: 'Chico fruit' },
    { id: '26', name: 'Cloudberry' },
    { id: '27', name: 'Coco De Mer' },
    { id: '28', name: 'Coconut' },
    { id: '29', name: 'Cranberry' },
    { id: '30', name: 'Damson' },
    { id: '31', name: 'Date' },
    { id: '32', name: 'Dragonfruit (or Pitaya)' },
    { id: '33', name: 'Durian' },
    { id: '34', name: 'Egg Fruit' },
    { id: '35', name: 'Elderberry' },
    { id: '36', name: 'Feijoa' },
    { id: '37', name: 'Fig' },
    { id: '38', name: 'Goji berry' },
    { id: '39', name: 'Gooseberry' },
    { id: '40', name: 'Grape' },
    { id: '41', name: 'Grewia asiatica (phalsa or falsa)' },
    { id: '42', name: 'Raisin' },
    { id: '43', name: 'Grapefruit' },
    { id: '44', name: 'Guava' },
    { id: '45', name: 'Hala Fruit' },
    { id: '46', name: 'Honeyberry' },
    { id: '47', name: 'Huckleberry' },
    { id: '48', name: 'Jabuticaba' },
    { id: '49', name: 'Jackfruit' },
    { id: '50', name: 'Jambul' },
    { id: '51', name: 'Japanese plum' },
    { id: '52', name: 'Jostaberry' },
    { id: '53', name: 'Jujube' },
    { id: '54', name: 'Juniper berry' },
    { id: '55', name: 'Kaffir Lime' },
    { id: '56', name: 'Kiwano (horned melon)' },
    { id: '57', name: 'Kiwifruit' },
    { id: '58', name: 'Kumquat' },
    { id: '59', name: 'Lemon' },
    { id: '60', name: 'Lime' },
    { id: '61', name: 'Loganberry' },
    { id: '62', name: 'Loquat' },
    { id: '63', name: 'Longan' },
    { id: '64', name: 'Lulo' },
    { id: '65', name: 'Lychee' },
    { id: '66', name: 'Magellan Barberry' },
    { id: '67', name: 'Mamey Apple' },
    { id: '68', name: 'Mamey Sapote' },
    { id: '69', name: 'Mango' },
    { id: '70', name: 'Mangosteen' },
    { id: '71', name: 'Marionberry' },
    { id: '72', name: 'Melon' },
    { id: '73', name: 'Cantaloupe' },
    { id: '74', name: 'Galia melon' },
    { id: '75', name: 'Honeydew' },
    { id: '76', name: 'Mouse Melon' },
    { id: '77', name: 'Watermelon' },
    { id: '78', name: 'Miracle fruit' },
    { id: '79', name: 'Monstera deliciosa' },
    { id: '80', name: 'Mulberry' },
    { id: '81', name: 'Nance' },
    { id: '82', name: 'Nectarine' },
    { id: '83', name: 'Orange' },
    { id: '84', name: 'Blood orange' },
    { id: '85', name: 'Clementine' },
    { id: '86', name: 'Mandarine' },
    { id: '87', name: 'Tangerine' },
    { id: '88', name: 'Papaya' },
    { id: '89', name: 'Passionfruit' },
    { id: '90', name: 'Peach' },
    { id: '91', name: 'Pear' },
    { id: '92', name: 'Persimmon' },
    { id: '93', name: 'Plantain' },
    { id: '94', name: 'Plum' },
    { id: '95', name: 'Prune (dried plum)' },
    { id: '96', name: 'Pineapple' },
    { id: '97', name: 'Pineberry' },
    { id: '98', name: 'Plumcot (or Pluot)' },
    { id: '99', name: 'Pomegranate' },
    { id: '100', name: 'Pomelo' },
    { id: '101', name: 'Purple mangosteen' },
    { id: '102', name: 'Quince' },
    { id: '103', name: 'Raspberry' },
    { id: '104', name: 'Salmonberry' },
    { id: '105', name: 'Rambutan (or Mamin Chino)' },
    { id: '106', name: 'Redcurrant' },
    { id: '107', name: 'Rose apple' },
    { id: '108', name: 'Salal berry' },
    { id: '109', name: 'Salak' },
    { id: '110', name: 'Satsuma' },
    { id: '111', name: 'Shine Muscat or Vitis Vinifera' },
    { id: '112', name: 'Sloe or Hawthorn Berry' },
    { id: '113', name: 'Soursop' },
    { id: '114', name: 'Star apple' },
    { id: '115', name: 'Star fruit' },
    { id: '116', name: 'Strawberry' },
    { id: '117', name: 'Surinam cherry' },
    { id: '118', name: 'Tamarillo' },
    { id: '119', name: 'Tamarind' },
    { id: '120', name: 'Tangelo' },
    { id: '121', name: 'Tayberry' },
    { id: '122', name: 'Tomato' },
    { id: '123', name: 'Ugli fruit' },
    { id: '124', name: 'White currant' },
    { id: '125', name: 'White sapote' },
    { id: '126', name: 'Yuzu' },
];

function SearchMultiSelectInputExample() {
    const [value, setValue] = useState<string[] | undefined>();
    const [searchValue, setSearchValue] = useState<string | undefined>();
    const [cacheOptions, setCacheOptions] = useState<Option[] | undefined | null>([
        options[0],
    ]);
    const [pending, searchOptions, , totalCount] = useQuery(
        options,
        searchValue,
        entityListTransformer,
        false,
        // !searchValue,
    );

    return (
        <div className={styles.searchMultiSelectExample}>
            <Heading>
                Search Multi Select Input
            </Heading>
            <SearchMultiSelectInput
                label="Search Multi Select Input"
                name="country"
                totalOptionsCount={totalCount}
                options={cacheOptions}
                keySelector={(item) => item.id}
                labelSelector={(item) => item.name}
                onChange={setValue}
                value={value}
                searchOptions={searchOptions}
                onSearchValueChange={setSearchValue}
                optionsPending={pending}
                optionsErrored={false}
                onOptionsChange={setCacheOptions}
            />
            <SearchMultiSelectInput
                label="Search Multi Select input that is disabled"
                name="country"
                totalOptionsCount={totalCount}
                options={cacheOptions}
                keySelector={(item) => item.id}
                labelSelector={(item) => item.name}
                onChange={setValue}
                value={value}
                searchOptions={searchOptions}
                onSearchValueChange={setSearchValue}
                optionsPending={pending}
                optionsErrored={false}
                onOptionsChange={setCacheOptions}
                disabled
            />
            <SearchMultiSelectInput
                label="Search Multi Select input that is read only"
                name="country"
                totalOptionsCount={totalCount}
                options={cacheOptions}
                keySelector={(item) => item.id}
                labelSelector={(item) => item.name}
                onChange={setValue}
                value={value}
                searchOptions={searchOptions}
                onSearchValueChange={setSearchValue}
                optionsPending={pending}
                optionsErrored={false}
                onOptionsChange={setCacheOptions}
                readOnly
            />
        </div>
    );
}
export default SearchMultiSelectInputExample;
