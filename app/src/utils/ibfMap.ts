// TODO: Find a better differentiation between ibfMap.ts and ibfMapHelpers.ts and simplify
// Task: https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41662

import { maptilerApiKey } from '#config';

// Map property strings
export const isoA2CountryNameProperty = 'iso_a2';
export const noCountrySelectedValue = 'None';

// URL search parameter keys
export const countryParamsKey = 'c';
export const eventIdParamsKey = 'e';

// Data constants
export const COUNTRY_FIELD_KEY = 'country';
export const PLACE_CODE_FIELD_KEY = 'code';

// Map URLs
const maptilerBaseUrl = 'https://api.maptiler.com';
// Vector map with Admin0 and Admin1 boundaries for all countries
export const mapUrlCountryVectorTiles = `${maptilerBaseUrl}/tiles/countries/{z}/{x}/{y}.pbf?key=${maptilerApiKey}`;
// Simple, default IBF data map
export const mapUrlSimpleStyleJson = `${maptilerBaseUrl}/maps/019c41d2-17c7-7e5e-9a47-d3b3f9515a5b/style.json?key=${maptilerApiKey}`;

// CountryData has the minimal data needed to display countries on the map.
// Additional data can be pulled from IBF, Montando, or other sources.
export interface CountryData {
    name_en: string;
    iso_a3: string;
    ibfSupported: boolean;

    // Initial zoom range is based on north/south extent of the country
    // 3000km or more = zoom 4
    // 2000km = zoom 5
    // 1000km = zoom 6
    // 600km or less= zoom 7
    initialZoom: number;

    // Center of country, for the map to focus on.
    latlon: [number, number];

    // Extents in Web Mercator (EPSG:3857) since this is the native projection for the map
    extents3857: [number, number, number, number];

    // Safe extents have several hundred km added to them so that the country fits
    // well within the map view when using these extents.
    safeExtents: [number, number, number, number];
}

// TODO: Try to switch to ISO3 in the data, so we can avoid ISO2 -> ISO3 mapping.
// If not, simplify this.
// See task https://dev.azure.com/redcrossnl/IBF/_workitems/edit/41656
// Extent and zoom should also be calculated on the fly, to allow for clusters
// of selected admin areas.
export const CountryData: Map<string, CountryData> = new Map([
    ['AF', {
        name_en: 'Afghanistan', iso_a3: 'AFG', ibfSupported: false, initialZoom: 6, latlon: [33.94, 67.71], extents3857: [6612067, 3385918, 8294920, 4559121], safeExtents: [6012067, 2785918, 8894920, 5159121],
    }],
    ['AL', {
        name_en: 'Albania', iso_a3: 'ALB', ibfSupported: false, initialZoom: 7, latlon: [41.15, 20.17], extents3857: [2190731, 4837257, 2346426, 5139428], safeExtents: [1590731, 4237257, 2946426, 5739428],
    }],
    ['DZ', {
        name_en: 'Algeria', iso_a3: 'DZA', ibfSupported: false, initialZoom: 5, latlon: [28.03, 1.66], extents3857: [-985853, 2154227, 1328398, 4377978], safeExtents: [-1585853, 1554227, 1928398, 4977978],
    }],
    ['AD', {
        name_en: 'Andorra', iso_a3: 'AND', ibfSupported: false, initialZoom: 7, latlon: [42.55, 1.60], extents3857: [159622, 5238143, 194829, 5274419], safeExtents: [-440378, 4638143, 794829, 5874419],
    }],
    ['AO', {
        name_en: 'Angola', iso_a3: 'AGO', ibfSupported: false, initialZoom: 6, latlon: [-11.20, 17.87], extents3857: [1291693, -2015139, 2690915, -511199], safeExtents: [691693, -2615139, 3290915, 88801],
    }],
    ['AG', {
        name_en: 'Antigua and Barbuda', iso_a3: 'ATG', ibfSupported: false, initialZoom: 7, latlon: [17.06, -61.80], extents3857: [-6899802, 1910677, -6861247, 1984277], safeExtents: [-7499802, 1310677, -6261247, 2584277],
    }],
    ['AR', {
        name_en: 'Argentina', iso_a3: 'ARG', ibfSupported: false, initialZoom: 4, latlon: [-38.42, -63.62], extents3857: [-7780215, -7309310, -5826665, -2470431], safeExtents: [-8380215, -7909310, -5226665, -1870431],
    }],
    ['AM', {
        name_en: 'Armenia', iso_a3: 'ARM', ibfSupported: false, initialZoom: 7, latlon: [40.07, 45.04], extents3857: [4855519, 4787155, 5141982, 5035037], safeExtents: [4255519, 4187155, 5741982, 5635037],
    }],
    ['AU', {
        name_en: 'Australia', iso_a3: 'AUS', ibfSupported: false, initialZoom: 4, latlon: [-25.27, 133.78], extents3857: [12669382, -5440985, 17115707, -1227009], safeExtents: [12069382, -6040985, 17715707, -627009],
    }],
    ['AT', {
        name_en: 'Austria', iso_a3: 'AUT', ibfSupported: false, initialZoom: 7, latlon: [47.52, 14.55], extents3857: [1050396, 5856497, 1912548, 6164869], safeExtents: [450396, 5256497, 2512548, 6764869],
    }],
    ['AZ', {
        name_en: 'Azerbaijan', iso_a3: 'AZE', ibfSupported: false, initialZoom: 7, latlon: [40.14, 47.58], extents3857: [5021753, 4707619, 5585855, 5111424], safeExtents: [4421753, 4107619, 6185855, 5711424],
    }],
    ['BS', {
        name_en: 'Bahamas', iso_a3: 'BHS', ibfSupported: false, initialZoom: 7, latlon: [25.03, -77.40], extents3857: [-8782665, 2568568, -8311019, 3073505], safeExtents: [-9382665, 1968568, -7711019, 3673505],
    }],
    ['BH', {
        name_en: 'Bahrain', iso_a3: 'BHR', ibfSupported: false, initialZoom: 7, latlon: [26.07, 50.56], extents3857: [5613878, 2904041, 5649744, 3025925], safeExtents: [5013878, 2304041, 6249744, 3625925],
    }],
    ['BD', {
        name_en: 'Bangladesh', iso_a3: 'BGD', ibfSupported: false, initialZoom: 7, latlon: [23.68, 90.36], extents3857: [9765956, 2375696, 10304539, 3049507], safeExtents: [9165956, 1775696, 10904539, 3649507],
    }],
    ['BB', {
        name_en: 'Barbados', iso_a3: 'BRB', ibfSupported: false, initialZoom: 7, latlon: [13.19, -59.54], extents3857: [-6641268, 1453571, -6618285, 1510621], safeExtents: [-7241268, 853571, -6018285, 2110621],
    }],
    ['BY', {
        name_en: 'Belarus', iso_a3: 'BLR', ibfSupported: false, initialZoom: 7, latlon: [53.71, 27.95], extents3857: [2582802, 6716847, 3579589, 7474186], safeExtents: [1982802, 6116847, 4179589, 8074186],
    }],
    ['BE', {
        name_en: 'Belgium', iso_a3: 'BEL', ibfSupported: false, initialZoom: 7, latlon: [50.50, 4.47], extents3857: [288795, 6422813, 695027, 6712962], safeExtents: [-311205, 5822813, 1295027, 7312962],
    }],
    ['BZ', {
        name_en: 'Belize', iso_a3: 'BLZ', ibfSupported: false, initialZoom: 7, latlon: [17.19, -88.50], extents3857: [-9938946, 1799567, -9803063, 2059920], safeExtents: [-10538946, 1199567, -9203063, 2659920],
    }],
    ['BJ', {
        name_en: 'Benin', iso_a3: 'BEN', ibfSupported: false, initialZoom: 6, latlon: [9.31, 2.32], extents3857: [74946, 690716, 425831, 1365916], safeExtents: [-525054, 90716, 1025831, 1965916],
    }],
    ['BT', {
        name_en: 'Bhutan', iso_a3: 'BTN', ibfSupported: false, initialZoom: 7, latlon: [27.51, 90.43], extents3857: [9863775, 3037254, 10227649, 3239091], safeExtents: [9263775, 2437254, 10827649, 3839091],
    }],
    ['BO', {
        name_en: 'Bolivia', iso_a3: 'BOL', ibfSupported: false, initialZoom: 6, latlon: [-16.29, -63.59], extents3857: [-7693476, -2539908, -6102543, -1067689], safeExtents: [-8293476, -3139908, -5502543, -467689],
    }],
    ['BA', {
        name_en: 'Bosnia and Herzegovina', iso_a3: 'BIH', ibfSupported: false, initialZoom: 7, latlon: [43.92, 17.68], extents3857: [1719817, 5314008, 2150680, 5664376], safeExtents: [1119817, 4714008, 2750680, 6264376],
    }],
    ['BW', {
        name_en: 'Botswana', iso_a3: 'BWA', ibfSupported: false, initialZoom: 6, latlon: [-22.33, 24.68], extents3857: [2218557, -2992428, 3239826, -2054188], safeExtents: [1618557, -3592428, 3839826, -1454188],
    }],
    ['BR', {
        name_en: 'Brazil', iso_a3: 'BRA', ibfSupported: false, initialZoom: 4, latlon: [-14.24, -51.93], extents3857: [-8206099, -3861795, -3801987, 601519], safeExtents: [-8806099, -4461795, -3201987, 1201519],
    }],
    ['BN', {
        name_en: 'Brunei', iso_a3: 'BRN', ibfSupported: false, initialZoom: 7, latlon: [4.54, 114.73], extents3857: [12674166, 458673, 12858993, 567051], safeExtents: [12074166, -141327, 13458993, 1167051],
    }],
    ['BG', {
        name_en: 'Bulgaria', iso_a3: 'BGR', ibfSupported: false, initialZoom: 7, latlon: [42.73, 25.49], extents3857: [2474654, 5127038, 3197046, 5532925], safeExtents: [1874654, 4527038, 3797046, 6132925],
    }],
    ['BF', {
        name_en: 'Burkina Faso', iso_a3: 'BFA', ibfSupported: false, initialZoom: 6, latlon: [12.24, -1.56], extents3857: [-608741, 1067037, 255655, 1706890], safeExtents: [-1208741, 467037, 855655, 2306890],
    }],
    ['BI', {
        name_en: 'Burundi', iso_a3: 'BDI', ibfSupported: false, initialZoom: 7, latlon: [-3.37, 29.92], extents3857: [3203073, -509654, 3393619, -240399], safeExtents: [2603073, -1109654, 3993619, 359601],
    }],
    ['CV', {
        name_en: 'Cabo Verde', iso_a3: 'CPV', ibfSupported: false, initialZoom: 7, latlon: [16.00, -24.01], extents3857: [-2843908, 1650689, -2562097, 1958849], safeExtents: [-3443908, 1050689, -1962097, 2558849],
    }],
    ['KH', {
        name_en: 'Cambodia', iso_a3: 'KHM', ibfSupported: false, initialZoom: 7, latlon: [12.57, 104.99], extents3857: [11456632, 1151082, 11919422, 1657821], safeExtents: [10856632, 551082, 12519422, 2257821],
    }],
    ['CM', {
        name_en: 'Cameroon', iso_a3: 'CMR', ibfSupported: false, initialZoom: 6, latlon: [7.37, 12.35], extents3857: [944095, 211831, 1806505, 1469913], safeExtents: [344095, -388169, 2406505, 2069913],
    }],
    ['CA', {
        name_en: 'Canada', iso_a3: 'CAN', ibfSupported: false, initialZoom: 4, latlon: [56.13, -106.35], extents3857: [-15654303, 5765851, -5765851, 13746651], safeExtents: [-16254303, 5165851, -5165851, 14346651],
    }],
    ['CF', {
        name_en: 'Central African Republic', iso_a3: 'CAF', ibfSupported: false, initialZoom: 6, latlon: [6.61, 20.94], extents3857: [1598979, 245299, 3045681, 1287765], safeExtents: [998979, -354701, 3645681, 1887765],
    }],
    ['TD', {
        name_en: 'Chad', iso_a3: 'TCD', ibfSupported: false, initialZoom: 5, latlon: [15.45, 18.73], extents3857: [1545279, 864680, 2679584, 2694987], safeExtents: [945279, 264680, 3279584, 3294987],
    }],
    ['CL', {
        name_en: 'Chile', iso_a3: 'CHL', ibfSupported: false, initialZoom: 4, latlon: [-35.68, -71.54], extents3857: [-8261582, -7527767, -7427888, -2020000], safeExtents: [-8861582, -8127767, -6827888, -1420000],
    }],
    ['CN', {
        name_en: 'China', iso_a3: 'CHN', ibfSupported: false, initialZoom: 4, latlon: [35.86, 104.20], extents3857: [8206964, 2092404, 14913410, 6989715], safeExtents: [7606964, 1492404, 15513410, 7589715],
    }],
    ['CO', {
        name_en: 'Colombia', iso_a3: 'COL', ibfSupported: true, initialZoom: 6, latlon: [4.57, -74.30], extents3857: [-8712728, -460388, -7449163, 1418055], safeExtents: [-9312728, -1060388, -6849163, 2018055],
    }],
    ['KM', {
        name_en: 'Comoros', iso_a3: 'COM', ibfSupported: false, initialZoom: 7, latlon: [-11.88, 43.87], extents3857: [4809947, -1403378, 4970505, -1305048], safeExtents: [4209947, -2003378, 5570505, -705048],
    }],
    ['CG', {
        name_en: 'Congo', iso_a3: 'COG', ibfSupported: false, initialZoom: 6, latlon: [-0.23, 15.83], extents3857: [1223579, -598445, 2039609, 426755], safeExtents: [623579, -1198445, 2639609, 1026755],
    }],
    ['CD', {
        name_en: 'Congo (Democratic Republic)', iso_a3: 'COD', ibfSupported: false, initialZoom: 5, latlon: [-4.04, 21.76], extents3857: [1354389, -1535753, 3471817, 649217], safeExtents: [754389, -2135753, 4071817, 1249217],
    }],
    ['CR', {
        name_en: 'Costa Rica', iso_a3: 'CRI', ibfSupported: false, initialZoom: 7, latlon: [9.75, -83.75], extents3857: [-9589439, 912076, -9177611, 1253024], safeExtents: [-10189439, 312076, -8577611, 1853024],
    }],
    ['CI', {
        name_en: "Côte d'Ivoire", iso_a3: 'CIV', ibfSupported: false, initialZoom: 6, latlon: [7.54, -5.55], extents3857: [-944413, 482099, -287170, 1165916], safeExtents: [-1544413, -117901, 312830, 1765916],
    }],
    ['HR', {
        name_en: 'Croatia', iso_a3: 'HRV', ibfSupported: false, initialZoom: 7, latlon: [45.10, 15.20], extents3857: [1486432, 5365862, 2124167, 5816879], safeExtents: [886432, 4765862, 2724167, 6416879],
    }],
    ['CU', {
        name_en: 'Cuba', iso_a3: 'CUB', ibfSupported: false, initialZoom: 7, latlon: [21.52, -77.78], extents3857: [-9591308, 2218557, -8266893, 2641444], safeExtents: [-10191308, 1618557, -7666893, 3241444],
    }],
    ['CY', {
        name_en: 'Cyprus', iso_a3: 'CYP', ibfSupported: false, initialZoom: 7, latlon: [35.13, 33.43], extents3857: [3597044, 4092717, 3903048, 4266051], safeExtents: [2997044, 3492717, 4503048, 4866051],
    }],
    ['CZ', {
        name_en: 'Czechia', iso_a3: 'CZE', ibfSupported: false, initialZoom: 7, latlon: [49.82, 15.47], extents3857: [1343394, 6197765, 2073025, 6548850], safeExtents: [743394, 5597765, 2673025, 7148850],
    }],
    ['DK', {
        name_en: 'Denmark', iso_a3: 'DNK', ibfSupported: false, initialZoom: 7, latlon: [56.26, 9.50], extents3857: [891771, 7329232, 1712938, 8037624], safeExtents: [291771, 6729232, 2312938, 8637624],
    }],
    ['DJ', {
        name_en: 'Djibouti', iso_a3: 'DJI', ibfSupported: false, initialZoom: 7, latlon: [11.83, 42.59], extents3857: [4670929, 1208115, 4818765, 1424896], safeExtents: [4070929, 608115, 5418765, 2024896],
    }],
    ['DM', {
        name_en: 'Dominica', iso_a3: 'DMA', ibfSupported: false, initialZoom: 7, latlon: [15.41, -61.37], extents3857: [-6847896, 1699587, -6821282, 1759574], safeExtents: [-7447896, 1099587, -6221282, 2359574],
    }],
    ['DO', {
        name_en: 'Dominican Republic', iso_a3: 'DOM', ibfSupported: false, initialZoom: 7, latlon: [18.74, -70.16], extents3857: [-7948756, 2022397, -7573815, 2269116], safeExtents: [-8548756, 1422397, -6973815, 2869116],
    }],
    ['EC', {
        name_en: 'Ecuador', iso_a3: 'ECU', ibfSupported: false, initialZoom: 7, latlon: [-1.83, -78.18], extents3857: [-9218339, -568645, -8364887, 167831], safeExtents: [-9818339, -1168645, -7764887, 767831],
    }],
    ['EG', {
        name_en: 'Egypt', iso_a3: 'EGY', ibfSupported: false, initialZoom: 6, latlon: [26.82, 30.80], extents3857: [2750341, 2464989, 4118380, 3684549], safeExtents: [2150341, 1864989, 4718380, 4284549],
    }],
    ['SV', {
        name_en: 'El Salvador', iso_a3: 'SLV', ibfSupported: false, initialZoom: 7, latlon: [13.79, -88.90], extents3857: [-10012266, 1490846, -9795442, 1619044], safeExtents: [-10612266, 890846, -9195442, 2219044],
    }],
    ['GQ', {
        name_en: 'Equatorial Guinea', iso_a3: 'GNQ', ibfSupported: false, initialZoom: 7, latlon: [1.65, 10.27], extents3857: [547556, -18871, 1282298, 263568], safeExtents: [-52444, -618871, 1882298, 863568],
    }],
    ['ER', {
        name_en: 'Eritrea', iso_a3: 'ERI', ibfSupported: false, initialZoom: 7, latlon: [15.18, 39.78], extents3857: [4022476, 1327831, 4842309, 2088445], safeExtents: [3422476, 727831, 5442309, 2688445],
    }],
    ['EE', {
        name_en: 'Estonia', iso_a3: 'EST', ibfSupported: false, initialZoom: 7, latlon: [58.60, 25.01], extents3857: [2418158, 7924555, 3149451, 8357854], safeExtents: [1818158, 7324555, 3749451, 8957854],
    }],
    ['SZ', {
        name_en: 'Eswatini', iso_a3: 'SWZ', ibfSupported: false, initialZoom: 7, latlon: [-26.52, 31.47], extents3857: [3436862, -3142287, 3595180, -2968379], safeExtents: [2836862, -3742287, 4195180, -2368379],
    }],
    ['ET', {
        name_en: 'Ethiopia', iso_a3: 'ETH', ibfSupported: true, initialZoom: 6, latlon: [9.15, 40.49], extents3857: [3647789, 388927, 5322802, 1691515], safeExtents: [3047789, -211073, 5922802, 2291515],
    }],
    ['FJ', {
        name_en: 'Fiji', iso_a3: 'FJI', ibfSupported: false, initialZoom: 7, latlon: [-17.71, 178.07], extents3857: [19538892, -2380795, 20037508, -1444850], safeExtents: [18938892, -2980795, 20637508, -844850],
    }],
    ['FI', {
        name_en: 'Finland', iso_a3: 'FIN', ibfSupported: false, initialZoom: 6, latlon: [61.92, 25.75], extents3857: [2217713, 8257820, 3585765, 11114858], safeExtents: [1617713, 7657820, 4185765, 11714858],
    }],
    ['FR', {
        name_en: 'France', iso_a3: 'FRA', ibfSupported: false, initialZoom: 6, latlon: [46.23, 2.21], extents3857: [-581087, 5099687, 1064454, 6636717], safeExtents: [-1181087, 4499687, 1664454, 7236717],
    }],
    ['GA', {
        name_en: 'Gabon', iso_a3: 'GAB', ibfSupported: false, initialZoom: 7, latlon: [-0.80, 11.61], extents3857: [985253, -430961, 1641268, 269398], safeExtents: [385253, -1030961, 2241268, 869398],
    }],
    ['GM', {
        name_en: 'Gambia', iso_a3: 'GMB', ibfSupported: false, initialZoom: 7, latlon: [13.44, -15.31], extents3857: [-1907823, 1461476, -1512379, 1549028], safeExtents: [-2507823, 861476, -912379, 2149028],
    }],
    ['GE', {
        name_en: 'Georgia', iso_a3: 'GEO', ibfSupported: false, initialZoom: 7, latlon: [42.32, 43.36], extents3857: [4459958, 5041310, 5118006, 5462091], safeExtents: [3859958, 4441310, 5718006, 6062091],
    }],
    ['DE', {
        name_en: 'Germany', iso_a3: 'DEU', ibfSupported: false, initialZoom: 6, latlon: [51.17, 10.45], extents3857: [640749, 6025634, 1681091, 7361866], safeExtents: [40749, 5425634, 2281091, 7961866],
    }],
    ['GH', {
        name_en: 'Ghana', iso_a3: 'GHA', ibfSupported: false, initialZoom: 6, latlon: [7.95, -1.02], extents3857: [-379697, 493770, 132929, 1270949], safeExtents: [-979697, -106230, 732929, 1870949],
    }],
    ['GR', {
        name_en: 'Greece', iso_a3: 'GRC', ibfSupported: false, initialZoom: 7, latlon: [39.07, 21.82], extents3857: [2188891, 4269014, 3205706, 5020303], safeExtents: [1588891, 3669014, 3805706, 5620303],
    }],
    ['GD', {
        name_en: 'Grenada', iso_a3: 'GRD', ibfSupported: false, initialZoom: 7, latlon: [12.12, -61.68], extents3857: [-6879419, 1332875, -6851626, 1404167], safeExtents: [-7479419, 732875, -6251626, 2004167],
    }],
    ['GT', {
        name_en: 'Guatemala', iso_a3: 'GTM', ibfSupported: false, initialZoom: 7, latlon: [15.78, -90.23], extents3857: [-10208621, 1568628, -9845649, 2009619], safeExtents: [-10808621, 968628, -9245649, 2609619],
    }],
    ['GN', {
        name_en: 'Guinea', iso_a3: 'GIN', ibfSupported: false, initialZoom: 7, latlon: [9.95, -9.70], extents3857: [-1684046, 829006, -847407, 1380025], safeExtents: [-2284046, 229006, -247407, 1980025],
    }],
    ['GW', {
        name_en: 'Guinea-Bissau', iso_a3: 'GNB', ibfSupported: false, initialZoom: 7, latlon: [11.80, -15.18], extents3857: [-1824034, 1246832, -1502741, 1414024], safeExtents: [-2424034, 646832, -902741, 2014024],
    }],
    ['GY', {
        name_en: 'Guyana', iso_a3: 'GUY', ibfSupported: false, initialZoom: 6, latlon: [4.86, -58.93], extents3857: [-6722997, 111325, -6349688, 960879], safeExtents: [-7322997, -488675, -5749688, 1560879],
    }],
    ['HT', {
        name_en: 'Haiti', iso_a3: 'HTI', ibfSupported: false, initialZoom: 7, latlon: [18.97, -72.29], extents3857: [-8243476, 2039915, -7987893, 2274267], safeExtents: [-8843476, 1439915, -7387893, 2874267],
    }],
    ['HN', {
        name_en: 'Honduras', iso_a3: 'HND', ibfSupported: false, initialZoom: 7, latlon: [15.20, -86.24], extents3857: [-9939523, 1476508, -9358929, 1849553], safeExtents: [-10539523, 876508, -8758929, 2449553],
    }],
    ['HU', {
        name_en: 'Hungary', iso_a3: 'HUN', ibfSupported: false, initialZoom: 7, latlon: [47.16, 19.50], extents3857: [1772949, 5759645, 2556813, 6175073], safeExtents: [1172949, 5159645, 3156813, 6775073],
    }],
    ['IS', {
        name_en: 'Iceland', iso_a3: 'ISL', ibfSupported: false, initialZoom: 7, latlon: [64.96, -19.02], extents3857: [-2759174, 9098336, -1393148, 9787181], safeExtents: [-3359174, 8498336, -793148, 10387181],
    }],
    ['IN', {
        name_en: 'India', iso_a3: 'IND', ibfSupported: false, initialZoom: 4, latlon: [20.59, 78.96], extents3857: [7581028, 736665, 10807254, 4383204], safeExtents: [6981028, 136665, 11407254, 4983204],
    }],
    ['ID', {
        name_en: 'Indonesia', iso_a3: 'IDN', ibfSupported: false, initialZoom: 5, latlon: [-0.79, 113.92], extents3857: [10624907, -1248583, 15545891, 664715], safeExtents: [10024907, -1848583, 16145891, 1264715],
    }],
    ['IR', {
        name_en: 'Iran', iso_a3: 'IRN', ibfSupported: false, initialZoom: 6, latlon: [32.43, 53.69], extents3857: [4869481, 2904041, 7022115, 4712189], safeExtents: [4269481, 2304041, 7622115, 5312189],
    }],
    ['IQ', {
        name_en: 'Iraq', iso_a3: 'IRQ', ibfSupported: false, initialZoom: 6, latlon: [33.22, 43.68], extents3857: [4207389, 3398166, 5330619, 4461927], safeExtents: [3607389, 2798166, 5930619, 5061927],
    }],
    ['IE', {
        name_en: 'Ireland', iso_a3: 'IRL', ibfSupported: false, initialZoom: 7, latlon: [53.14, -7.69], extents3857: [-1167322, 6793101, -656978, 7430641], safeExtents: [-1767322, 6193101, -56978, 8030641],
    }],
    ['IL', {
        name_en: 'Israel', iso_a3: 'ISR', ibfSupported: false, initialZoom: 7, latlon: [31.05, 34.85], extents3857: [3875281, 3422089, 3966052, 3921341], safeExtents: [3275281, 2822089, 4566052, 4521341],
    }],
    ['IT', {
        name_en: 'Italy', iso_a3: 'ITA', ibfSupported: false, initialZoom: 5, latlon: [41.87, 12.57], extents3857: [695027, 4279969, 2056096, 5959808], safeExtents: [95027, 3679969, 2656096, 6559808],
    }],
    ['JM', {
        name_en: 'Jamaica', iso_a3: 'JAM', ibfSupported: false, initialZoom: 7, latlon: [18.11, -77.30], extents3857: [-8715920, 1990227, -8458789, 2100691], safeExtents: [-9315920, 1390227, -7858789, 2700691],
    }],
    ['JP', {
        name_en: 'Japan', iso_a3: 'JPN', ibfSupported: false, initialZoom: 5, latlon: [36.20, 138.25], extents3857: [14005983, 2824396, 16277236, 5708234], safeExtents: [13405983, 2224396, 16877236, 6308234],
    }],
    ['JO', {
        name_en: 'Jordan', iso_a3: 'JOR', ibfSupported: false, initialZoom: 7, latlon: [30.59, 36.24], extents3857: [3876394, 3385918, 4331927, 3921341], safeExtents: [3276394, 2785918, 4931927, 4521341],
    }],
    ['KZ', {
        name_en: 'Kazakhstan', iso_a3: 'KAZ', ibfSupported: false, initialZoom: 5, latlon: [48.02, 66.92], extents3857: [5139688, 5041310, 9703838, 7063379], safeExtents: [4539688, 4441310, 10303838, 7663379],
    }],
    ['KE', {
        name_en: 'Kenya', iso_a3: 'KEN', ibfSupported: true, initialZoom: 6, latlon: [-0.02, 37.91], extents3857: [3765252, -536247, 4633583, 593894], safeExtents: [3165252, -1136247, 5233583, 1193894],
    }],
    ['KI', {
        name_en: 'Kiribati', iso_a3: 'KIR', ibfSupported: false, initialZoom: 7, latlon: [-3.37, -168.73], extents3857: [-20037508, -379585, -17305877, 462575], safeExtents: [-20637508, -979585, -16705877, 1062575],
    }],
    ['KP', {
        name_en: 'Korea (North)', iso_a3: 'PRK', ibfSupported: false, initialZoom: 7, latlon: [40.34, 127.51], extents3857: [13829789, 4633584, 14556627, 5253227], safeExtents: [13229789, 4033584, 15156627, 5853227],
    }],
    ['KR', {
        name_en: 'Korea (South)', iso_a3: 'KOR', ibfSupported: false, initialZoom: 7, latlon: [35.91, 127.77], extents3857: [13900979, 3927741, 14461741, 4653217], safeExtents: [13300979, 3327741, 15061741, 5253217],
    }],
    ['KW', {
        name_en: 'Kuwait', iso_a3: 'KWT', ibfSupported: false, initialZoom: 7, latlon: [29.31, 47.48], extents3857: [5202579, 3254041, 5390858, 3496189], safeExtents: [4602579, 2654041, 5990858, 4096189],
    }],
    ['KG', {
        name_en: 'Kyrgyzstan', iso_a3: 'KGZ', ibfSupported: false, initialZoom: 7, latlon: [41.20, 74.77], extents3857: [7727866, 4756549, 8873963, 5288547], safeExtents: [7127866, 4156549, 9473963, 5888547],
    }],
    ['LA', {
        name_en: 'Laos', iso_a3: 'LAO', ibfSupported: false, initialZoom: 6, latlon: [19.86, 102.50], extents3857: [11107458, 1552987, 11918857, 2561665], safeExtents: [10507458, 952987, 12518857, 3161665],
    }],
    ['LV', {
        name_en: 'Latvia', iso_a3: 'LVA', ibfSupported: false, initialZoom: 7, latlon: [56.88, 24.60], extents3857: [2331291, 7661042, 3142426, 8087756], safeExtents: [1731291, 7061042, 3742426, 8687756],
    }],
    ['LB', {
        name_en: 'Lebanon', iso_a3: 'LBN', ibfSupported: false, initialZoom: 7, latlon: [33.85, 35.86], extents3857: [3914965, 3857784, 4046089, 4156303], safeExtents: [3314965, 3257784, 4646089, 4756303],
    }],
    ['LS', {
        name_en: 'Lesotho', iso_a3: 'LSO', ibfSupported: false, initialZoom: 7, latlon: [-29.61, 28.23], extents3857: [3023116, -3524583, 3277346, -3334507], safeExtents: [2423116, -4124583, 3877346, -2734507],
    }],
    ['LR', {
        name_en: 'Liberia', iso_a3: 'LBR', ibfSupported: false, initialZoom: 7, latlon: [6.43, -9.43], extents3857: [-1271050, 430961, -830059, 923579], safeExtents: [-1871050, -169039, -230059, 1523579],
    }],
    ['LY', {
        name_en: 'Libya', iso_a3: 'LBY', ibfSupported: false, initialZoom: 5, latlon: [26.34, 17.23], extents3857: [1008064, 2188449, 2832823, 3821342], safeExtents: [408064, 1588449, 3432823, 4421342],
    }],
    ['LI', {
        name_en: 'Liechtenstein', iso_a3: 'LIE', ibfSupported: false, initialZoom: 7, latlon: [47.17, 9.56], extents3857: [1053421, 5920988, 1068535, 5977296], safeExtents: [453421, 5320988, 1668535, 6577296],
    }],
    ['LT', {
        name_en: 'Lithuania', iso_a3: 'LTU', ibfSupported: false, initialZoom: 7, latlon: [55.17, 23.88], extents3857: [2327013, 7348965, 3009024, 7797673], safeExtents: [1727013, 6748965, 3609024, 8397673],
    }],
    ['LU', {
        name_en: 'Luxembourg', iso_a3: 'LUX', ibfSupported: false, initialZoom: 7, latlon: [49.82, 6.13], extents3857: [643774, 6341375, 720991, 6454087], safeExtents: [43774, 5741375, 1320991, 7054087],
    }],
    ['MG', {
        name_en: 'Madagascar', iso_a3: 'MDG', ibfSupported: false, initialZoom: 5, latlon: [-18.77, 46.87], extents3857: [4783625, -2903598, 5655933, -1318553], safeExtents: [4183625, -3503598, 6255933, -718553],
    }],
    ['MW', {
        name_en: 'Malawi', iso_a3: 'MWI', ibfSupported: true, initialZoom: 6, latlon: [-13.25, 34.30], extents3857: [3647789, -1996051, 4018198, -1065809], safeExtents: [3047789, -2596051, 4618198, -465809],
    }],
    ['MY', {
        name_en: 'Malaysia', iso_a3: 'MYS', ibfSupported: false, initialZoom: 6, latlon: [4.21, 101.98], extents3857: [11025569, 111325, 13177116, 856413], safeExtents: [10425569, -488675, 13777116, 1456413],
    }],
    ['MV', {
        name_en: 'Maldives', iso_a3: 'MDV', ibfSupported: false, initialZoom: 7, latlon: [3.20, 73.22], extents3857: [8102905, -83936, 8211361, 827032], safeExtents: [7502905, -683936, 8811361, 1427032],
    }],
    ['ML', {
        name_en: 'Mali', iso_a3: 'MLI', ibfSupported: false, initialZoom: 5, latlon: [17.57, -4.00], extents3857: [-1336945, 1197367, 494818, 2914669], safeExtents: [-1936945, 597367, 1094818, 3514669],
    }],
    ['MT', {
        name_en: 'Malta', iso_a3: 'MLT', ibfSupported: false, initialZoom: 7, latlon: [35.94, 14.38], extents3857: [1586785, 4228965, 1633478, 4332519], safeExtents: [986785, 3628965, 2233478, 4932519],
    }],
    ['MH', {
        name_en: 'Marshall Islands', iso_a3: 'MHL', ibfSupported: false, initialZoom: 7, latlon: [7.13, 171.18], extents3857: [18295192, 462575, 19330086, 1278254], safeExtents: [17695192, -137425, 19930086, 1878254],
    }],
    ['MR', {
        name_en: 'Mauritania', iso_a3: 'MRT', ibfSupported: false, initialZoom: 6, latlon: [21.01, -10.94], extents3857: [-1907823, 1675425, -504479, 3104420], safeExtents: [-2507823, 1075425, 95521, 3704420],
    }],
    ['MU', {
        name_en: 'Mauritius', iso_a3: 'MUS', ibfSupported: false, initialZoom: 7, latlon: [-20.35, 57.55], extents3857: [6357831, -2365316, 6630197, -1978908], safeExtents: [5757831, -2965316, 7230197, -1378908],
    }],
    ['MX', {
        name_en: 'Mexico', iso_a3: 'MEX', ibfSupported: false, initialZoom: 5, latlon: [23.63, -102.55], extents3857: [-13049005, 1623906, -9668687, 3741305], safeExtents: [-13649005, 1023906, -9068687, 4341305],
    }],
    ['FM', {
        name_en: 'Micronesia', iso_a3: 'FSM', ibfSupported: false, initialZoom: 7, latlon: [7.43, 150.55], extents3857: [16224393, 548676, 17161621, 1151814], safeExtents: [15624393, -51324, 17761621, 1751814],
    }],
    ['MD', {
        name_en: 'Moldova', iso_a3: 'MDA', ibfSupported: false, initialZoom: 7, latlon: [47.41, 28.37], extents3857: [2942635, 5685143, 3379349, 6200851], safeExtents: [2342635, 5085143, 3979349, 6800851],
    }],
    ['MC', {
        name_en: 'Monaco', iso_a3: 'MCO', ibfSupported: false, initialZoom: 7, latlon: [43.75, 7.41], extents3857: [823333, 5416138, 829082, 5430308], safeExtents: [223333, 4816138, 1429082, 6030308],
    }],
    ['MN', {
        name_en: 'Mongolia', iso_a3: 'MNG', ibfSupported: false, initialZoom: 5, latlon: [46.86, 103.85], extents3857: [9780355, 5041310, 13250866, 6762680], safeExtents: [9180355, 4441310, 13850866, 7362680],
    }],
    ['ME', {
        name_en: 'Montenegro', iso_a3: 'MNE', ibfSupported: false, initialZoom: 7, latlon: [42.71, 19.37], extents3857: [2071247, 5174817, 2295847, 5395063], safeExtents: [1471247, 4574817, 2895847, 5995063],
    }],
    ['MA', {
        name_en: 'Morocco', iso_a3: 'MAR', ibfSupported: false, initialZoom: 6, latlon: [31.79, -7.09], extents3857: [-1517213, 3104420, -113869, 4300190], safeExtents: [-2117213, 2504420, 486131, 4900190],
    }],
    ['MZ', {
        name_en: 'Mozambique', iso_a3: 'MOZ', ibfSupported: false, initialZoom: 5, latlon: [-18.67, 35.53], extents3857: [3383627, -3058914, 4530836, -1132139], safeExtents: [2783627, -3658914, 5130836, -532139],
    }],
    ['MM', {
        name_en: 'Myanmar', iso_a3: 'MMR', ibfSupported: false, initialZoom: 5, latlon: [21.91, 95.96], extents3857: [10180185, 1093557, 11154925, 3294023], safeExtents: [9580185, 493557, 11754925, 3894023],
    }],
    ['NA', {
        name_en: 'Namibia', iso_a3: 'NAM', ibfSupported: false, initialZoom: 6, latlon: [-22.96, 18.49], extents3857: [1285323, -3371666, 2833935, -1996051], safeExtents: [685323, -3971666, 3433935, -1396051],
    }],
    ['NR', {
        name_en: 'Nauru', iso_a3: 'NRU', ibfSupported: false, initialZoom: 7, latlon: [-0.52, 166.93], extents3857: [18579310, -65381, 18593402, -51212], safeExtents: [17979310, -665381, 19193402, 548788],
    }],
    ['NP', {
        name_en: 'Nepal', iso_a3: 'NPL', ibfSupported: false, initialZoom: 7, latlon: [28.39, 84.12], extents3857: [8914707, 3023116, 9651473, 3496189], safeExtents: [8314707, 2423116, 10251473, 4096189],
    }],
    ['NL', {
        name_en: 'Netherlands', iso_a3: 'NLD', ibfSupported: false, initialZoom: 7, latlon: [52.13, 5.29], extents3857: [364539, 6609234, 777811, 7158629], safeExtents: [-235461, 6009234, 1377811, 7758629],
    }],
    ['NZ', {
        name_en: 'New Zealand', iso_a3: 'NZL', ibfSupported: false, initialZoom: 5, latlon: [-40.90, 174.89], extents3857: [18443085, -5914295, 20037508, -4092564], safeExtents: [17843085, -6514295, 20637508, -3492564],
    }],
    ['NI', {
        name_en: 'Nicaragua', iso_a3: 'NIC', ibfSupported: false, initialZoom: 7, latlon: [12.87, -85.21], extents3857: [-9766127, 1259699, -9276048, 1709898], safeExtents: [-10366127, 659699, -8676048, 2309898],
    }],
    ['NE', {
        name_en: 'Niger', iso_a3: 'NER', ibfSupported: false, initialZoom: 6, latlon: [17.61, 8.08], extents3857: [21791, 1286960, 1811582, 2690437], safeExtents: [-578209, 686960, 2411582, 3290437],
    }],
    ['NG', {
        name_en: 'Nigeria', iso_a3: 'NGA', ibfSupported: false, initialZoom: 6, latlon: [9.08, 8.68], extents3857: [294464, 462575, 1617345, 1549028], safeExtents: [-305536, -137425, 2217345, 2149028],
    }],
    ['MK', {
        name_en: 'North Macedonia', iso_a3: 'MKD', ibfSupported: false, initialZoom: 7, latlon: [41.51, 21.75], extents3857: [2276959, 5020303, 2574166, 5280020], safeExtents: [1676959, 4420303, 3174166, 5880020],
    }],
    ['NO', {
        name_en: 'Norway', iso_a3: 'NOR', ibfSupported: false, initialZoom: 5, latlon: [60.47, 8.47], extents3857: [494818, 7561117, 3585765, 11306048], safeExtents: [-105182, 6961117, 4185765, 11906048],
    }],
    ['OM', {
        name_en: 'Oman', iso_a3: 'OMN', ibfSupported: false, initialZoom: 6, latlon: [21.51, 55.92], extents3857: [5764757, 1866978, 6647088, 2944050], safeExtents: [5164757, 1266978, 7247088, 3544050],
    }],
    ['PK', {
        name_en: 'Pakistan', iso_a3: 'PAK', ibfSupported: false, initialZoom: 6, latlon: [30.38, 69.35], extents3857: [6717248, 2761339, 8676793, 4461927], safeExtents: [6117248, 2161339, 9276793, 5061927],
    }],
    ['PW', {
        name_en: 'Palau', iso_a3: 'PLW', ibfSupported: false, initialZoom: 7, latlon: [7.51, 134.58], extents3857: [14909303, 232769, 15006736, 917830], safeExtents: [14309303, -367231, 15606736, 1517830],
    }],
    ['PA', {
        name_en: 'Panama', iso_a3: 'PAN', ibfSupported: false, initialZoom: 7, latlon: [8.54, -80.78], extents3857: [-9153382, 802371, -8594455, 1100851], safeExtents: [-9753382, 202371, -7994455, 1700851],
    }],
    ['PG', {
        name_en: 'Papua New Guinea', iso_a3: 'PNG', ibfSupported: false, initialZoom: 6, latlon: [-6.31, 143.96], extents3857: [15530688, -1296461, 16838866, 20479], safeExtents: [14930688, -1896461, 17438866, 620479],
    }],
    ['PY', {
        name_en: 'Paraguay', iso_a3: 'PRY', ibfSupported: false, initialZoom: 6, latlon: [-23.44, -58.44], extents3857: [-6907212, -3219651, -6034905, -2188449], safeExtents: [-7507212, -3819651, -5434905, -1588449],
    }],
    ['PE', {
        name_en: 'Peru', iso_a3: 'PER', ibfSupported: false, initialZoom: 5, latlon: [-9.19, -75.02], extents3857: [-9157660, -2105312, -7571037, 18871], safeExtents: [-9757660, -2705312, -6971037, 618871],
    }],
    ['PH', {
        name_en: 'Philippines', iso_a3: 'PHL', ibfSupported: true, initialZoom: 5, latlon: [12.88, 121.77], extents3857: [13249754, 545652, 15088521, 2380795], safeExtents: [12649754, -54348, 15688521, 2980795],
    }],
    ['PL', {
        name_en: 'Poland', iso_a3: 'POL', ibfSupported: false, initialZoom: 6, latlon: [51.92, 19.15], extents3857: [1572694, 6200851, 2728802, 7165547], safeExtents: [972694, 5600851, 3328802, 7765547],
    }],
    ['PT', {
        name_en: 'Portugal', iso_a3: 'PRT', ibfSupported: false, initialZoom: 7, latlon: [39.40, -8.22], extents3857: [-1027363, 4279969, -693296, 5171286], safeExtents: [-1627363, 3679969, -93296, 5771286],
    }],
    ['QA', {
        name_en: 'Qatar', iso_a3: 'QAT', ibfSupported: false, initialZoom: 7, latlon: [25.35, 51.18], extents3857: [5611330, 2773404, 5764757, 3016619], safeExtents: [5011330, 2173404, 6364757, 3616619],
    }],
    ['RO', {
        name_en: 'Romania', iso_a3: 'ROU', ibfSupported: false, initialZoom: 7, latlon: [45.94, 24.97], extents3857: [2303372, 5288547, 3389327, 6197765], safeExtents: [1703372, 4688547, 3989327, 6797765],
    }],
    ['RU', {
        name_en: 'Russia', iso_a3: 'RUS', ibfSupported: false, initialZoom: 4, latlon: [61.52, 105.32], extents3857: [2089802, 5041310, 20037508, 15496570], safeExtents: [1489802, 4441310, 20637508, 16096570],
    }],
    ['RW', {
        name_en: 'Rwanda', iso_a3: 'RWA', ibfSupported: false, initialZoom: 7, latlon: [-1.94, 29.87], extents3857: [3205706, -309239, 3403611, -111325], safeExtents: [2605706, -909239, 4003611, 488675],
    }],
    ['KN', {
        name_en: 'Saint Kitts and Nevis', iso_a3: 'KNA', ibfSupported: false, initialZoom: 7, latlon: [17.36, -62.78], extents3857: [-7007669, 1925296, -6958199, 1983614], safeExtents: [-7607669, 1325296, -6358199, 2583614],
    }],
    ['LC', {
        name_en: 'Saint Lucia', iso_a3: 'LCA', ibfSupported: false, initialZoom: 7, latlon: [13.91, -60.98], extents3857: [-6797379, 1535697, -6762681, 1610199], safeExtents: [-7397379, 935697, -6162681, 2210199],
    }],
    ['VC', {
        name_en: 'Saint Vincent and the Grenadines', iso_a3: 'VCT', ibfSupported: false, initialZoom: 7, latlon: [12.98, -61.29], extents3857: [-6835186, 1397873, -6782740, 1505423], safeExtents: [-7435186, 797873, -6182740, 2105423],
    }],
    ['WS', {
        name_en: 'Samoa', iso_a3: 'WSM', ibfSupported: false, initialZoom: 7, latlon: [-13.76, -172.10], extents3857: [-19231988, -1593880, -19202806, -1557464], safeExtents: [-19831988, -2193880, -18602806, -957464],
    }],
    ['SM', {
        name_en: 'San Marino', iso_a3: 'SMR', ibfSupported: false, initialZoom: 7, latlon: [43.94, 12.46], extents3857: [1379692, 5388765, 1397873, 5416138], safeExtents: [779692, 4788765, 1997873, 6016138],
    }],
    ['ST', {
        name_en: 'Sao Tome and Principe', iso_a3: 'STP', ibfSupported: false, initialZoom: 7, latlon: [0.19, 6.61], extents3857: [721547, -18315, 782841, 189779], safeExtents: [121547, -618315, 1382841, 789779],
    }],
    ['SA', {
        name_en: 'Saudi Arabia', iso_a3: 'SAU', ibfSupported: false, initialZoom: 5, latlon: [23.89, 45.08], extents3857: [3876394, 1866978, 6201084, 3684549], safeExtents: [3276394, 1266978, 6801084, 4284549],
    }],
    ['SN', {
        name_en: 'Senegal', iso_a3: 'SEN', ibfSupported: false, initialZoom: 6, latlon: [14.50, -14.45], extents3857: [-1988442, 1380025, -1285323, 1866978], safeExtents: [-2588442, 780025, -685323, 2466978],
    }],
    ['RS', {
        name_en: 'Serbia', iso_a3: 'SRB', ibfSupported: false, initialZoom: 7, latlon: [44.02, 21.01], extents3857: [2108357, 5193905, 2584144, 5616442], safeExtents: [1508357, 4593905, 3184144, 6216442],
    }],
    ['SC', {
        name_en: 'Seychelles', iso_a3: 'SYC', ibfSupported: false, initialZoom: 7, latlon: [-4.68, 55.49], extents3857: [5990659, -609620, 6417263, -256793], safeExtents: [5390659, -1209620, 7017263, 343207],
    }],
    ['SL', {
        name_en: 'Sierra Leone', iso_a3: 'SLE', ibfSupported: false, initialZoom: 7, latlon: [8.46, -11.78], extents3857: [-1467743, 753545, -1129832, 1093557], safeExtents: [-2067743, 153545, -529832, 1693557],
    }],
    ['SG', {
        name_en: 'Singapore', iso_a3: 'SGP', ibfSupported: false, initialZoom: 7, latlon: [1.35, 103.82], extents3857: [11524609, 140813, 11590122, 158901], safeExtents: [10924609, -459187, 12190122, 758901],
    }],
    ['SK', {
        name_en: 'Slovakia', iso_a3: 'SVK', ibfSupported: false, initialZoom: 7, latlon: [48.67, 19.70], extents3857: [1889234, 6003899, 2553261, 6548850], safeExtents: [1289234, 5403899, 3153261, 7148850],
    }],
    ['SI', {
        name_en: 'Slovenia', iso_a3: 'SVN', ibfSupported: false, initialZoom: 7, latlon: [46.15, 14.99], extents3857: [1482470, 5694689, 1851789, 5937965], safeExtents: [882470, 5094689, 2451789, 6537965],
    }],
    ['SB', {
        name_en: 'Solomon Islands', iso_a3: 'SLB', ibfSupported: false, initialZoom: 6, latlon: [-9.65, 160.16], extents3857: [17295898, -1469755, 18454752, -563996], safeExtents: [16695898, -2069755, 19054752, 36004],
    }],
    ['SO', {
        name_en: 'Somalia', iso_a3: 'SOM', ibfSupported: false, initialZoom: 6, latlon: [5.15, 46.20], extents3857: [4633583, -193454, 5764757, 1404167], safeExtents: [4033583, -793454, 6364757, 2004167],
    }],
    ['ZA', {
        name_en: 'South Africa', iso_a3: 'ZAF', ibfSupported: false, initialZoom: 6, latlon: [-30.56, 22.94], extents3857: [1757746, -4070715, 3685106, -2519213], safeExtents: [1157746, -4670715, 4285106, -1919213],
    }],
    ['SS', {
        name_en: 'South Sudan', iso_a3: 'SSD', ibfSupported: false, initialZoom: 6, latlon: [6.88, 31.31], extents3857: [2673587, 363886, 4095685, 1368073], safeExtents: [2073587, -236114, 4695685, 1968073],
    }],
    ['ES', {
        name_en: 'Spain', iso_a3: 'ESP', ibfSupported: false, initialZoom: 6, latlon: [40.46, -3.75], extents3857: [-2056096, 4136468, 493706, 5437193], safeExtents: [-2656096, 3536468, 1093706, 6037193],
    }],
    ['LK', {
        name_en: 'Sri Lanka', iso_a3: 'LKA', ibfSupported: false, initialZoom: 7, latlon: [7.87, 80.77], extents3857: [8835894, 651532, 9182963, 1115005], safeExtents: [8235894, 51532, 9782963, 1715005],
    }],
    ['SD', {
        name_en: 'Sudan', iso_a3: 'SDN', ibfSupported: false, initialZoom: 5, latlon: [12.86, 30.22], extents3857: [2418158, 983457, 4254633, 2587168], safeExtents: [1818158, 383457, 4854633, 3187168],
    }],
    ['SR', {
        name_en: 'Suriname', iso_a3: 'SUR', ibfSupported: false, initialZoom: 7, latlon: [3.92, -56.03], extents3857: [-6246787, 193454, -5915407, 675943], safeExtents: [-6846787, -406546, -5315407, 1275943],
    }],
    ['SE', {
        name_en: 'Sweden', iso_a3: 'SWE', ibfSupported: false, initialZoom: 5, latlon: [60.13, 18.64], extents3857: [1198479, 7430641, 2728802, 11040449], safeExtents: [598479, 6830641, 3328802, 11640449],
    }],
    ['CH', {
        name_en: 'Switzerland', iso_a3: 'CHE', ibfSupported: false, initialZoom: 7, latlon: [46.82, 8.23], extents3857: [658888, 5754979, 1152623, 6075815], safeExtents: [58888, 5154979, 1752623, 6675815],
    }],
    ['SY', {
        name_en: 'Syria', iso_a3: 'SYR', ibfSupported: false, initialZoom: 7, latlon: [34.80, 39.00], extents3857: [3966052, 3875505, 4768460, 4461927], safeExtents: [3366052, 3275505, 5368460, 5061927],
    }],
    ['TW', {
        name_en: 'Taiwan', iso_a3: 'TWN', ibfSupported: false, initialZoom: 7, latlon: [23.70, 120.96], extents3857: [13336622, 2474011, 13611211, 2903598], safeExtents: [12736622, 1874011, 14211211, 3503598],
    }],
    ['TJ', {
        name_en: 'Tajikistan', iso_a3: 'TJK', ibfSupported: false, initialZoom: 7, latlon: [38.86, 71.28], extents3857: [7516873, 4573601, 8253542, 5000960], safeExtents: [6916873, 3973601, 8853542, 5600960],
    }],
    ['TZ', {
        name_en: 'Tanzania', iso_a3: 'TZA', ibfSupported: true, initialZoom: 6, latlon: [-6.37, 34.89], extents3857: [3267368, -1336945, 4542793, 65381], safeExtents: [2667368, -1936945, 5142793, 665381],
    }],
    ['TH', {
        name_en: 'Thailand', iso_a3: 'THA', ibfSupported: false, initialZoom: 5, latlon: [15.87, 100.99], extents3857: [10967251, 658889, 11703441, 2367206], safeExtents: [10367251, 58889, 12303441, 2967206],
    }],
    ['TL', {
        name_en: 'Timor-Leste', iso_a3: 'TLS', ibfSupported: false, initialZoom: 7, latlon: [-8.87, 125.73], extents3857: [13827011, -1120254, 14053834, -952229], safeExtents: [13227011, -1720254, 14653834, -352229],
    }],
    ['TG', {
        name_en: 'Togo', iso_a3: 'TGO', ibfSupported: false, initialZoom: 7, latlon: [8.62, 0.82], extents3857: [-23011, 663139, 207867, 1261105], safeExtents: [-623011, 63139, 807867, 1861105],
    }],
    ['TO', {
        name_en: 'Tonga', iso_a3: 'TON', ibfSupported: false, initialZoom: 7, latlon: [-21.18, -175.20], extents3857: [-19504353, -2468523, -19329271, -1794429], safeExtents: [-20104353, -3068523, -18729271, -1194429],
    }],
    ['TT', {
        name_en: 'Trinidad and Tobago', iso_a3: 'TTO', ibfSupported: false, initialZoom: 7, latlon: [10.69, -61.22], extents3857: [-6891376, 1134120, -6791851, 1259699], safeExtents: [-7491376, 534120, -6191851, 1859699],
    }],
    ['TN', {
        name_en: 'Tunisia', iso_a3: 'TUN', ibfSupported: false, initialZoom: 7, latlon: [33.89, 9.54], extents3857: [840312, 3604217, 1322019, 4461927], safeExtents: [240312, 3004217, 1922019, 5061927],
    }],
    ['TR', {
        name_en: 'Turkey', iso_a3: 'TUR', ibfSupported: false, initialZoom: 6, latlon: [38.96, 35.24], extents3857: [2861206, 4279969, 4970826, 5306523], safeExtents: [2261206, 3679969, 5570826, 5906523],
    }],
    ['TM', {
        name_en: 'Turkmenistan', iso_a3: 'TKM', ibfSupported: false, initialZoom: 6, latlon: [38.97, 59.56], extents3857: [5668536, 4344477, 7739823, 5306523], safeExtents: [5068536, 3744477, 8339823, 5906523],
    }],
    ['TV', {
        name_en: 'Tuvalu', iso_a3: 'TUV', ibfSupported: false, initialZoom: 7, latlon: [-7.11, 177.65], extents3857: [19634102, -1170837, 20035285, -536247], safeExtents: [19034102, -1770837, 20635285, 63753],
    }],
    ['UG', {
        name_en: 'Uganda', iso_a3: 'UGA', ibfSupported: true, initialZoom: 6, latlon: [1.37, 32.29], extents3857: [3267368, -160013, 4018198, 494818], safeExtents: [2667368, -760013, 4618198, 1094818],
    }],
    ['UA', {
        name_en: 'Ukraine', iso_a3: 'UKR', ibfSupported: false, initialZoom: 6, latlon: [48.38, 31.17], extents3857: [2519213, 5524618, 4428595, 6831374], safeExtents: [1919213, 4924618, 5028595, 7431374],
    }],
    ['AE', {
        name_en: 'United Arab Emirates', iso_a3: 'ARE', ibfSupported: false, initialZoom: 7, latlon: [23.42, 53.85], extents3857: [5688624, 2604347, 6378476, 3004554], safeExtents: [5088624, 2004347, 6978476, 3604554],
    }],
    ['GB', {
        name_en: 'United Kingdom', iso_a3: 'GBR', ibfSupported: false, initialZoom: 6, latlon: [55.38, -3.44], extents3857: [-915501, 6043322, 214785, 8262823], safeExtents: [-1515501, 5443322, 814785, 8862823],
    }],
    ['US', {
        name_en: 'United States', iso_a3: 'USA', ibfSupported: false, initialZoom: 4, latlon: [37.09, -95.71], extents3857: [-13885086, 2873282, -7452848, 6340263], safeExtents: [-14485086, 2273282, -6852848, 6940263],
    }],
    ['UY', {
        name_en: 'Uruguay', iso_a3: 'URY', ibfSupported: false, initialZoom: 7, latlon: [-32.52, -55.77], extents3857: [-6505687, -4070715, -5936854, -3558791], safeExtents: [-7105687, -4670715, -5336854, -2958791],
    }],
    ['UZ', {
        name_en: 'Uzbekistan', iso_a3: 'UZB', ibfSupported: false, initialZoom: 6, latlon: [41.38, 64.59], extents3857: [6186992, 4523729, 8287066, 5605377], safeExtents: [5586992, 3923729, 8887066, 6205377],
    }],
    ['VU', {
        name_en: 'Vanuatu', iso_a3: 'VUT', ibfSupported: false, initialZoom: 7, latlon: [-15.38, 166.96], extents3857: [18432083, -2342018, 18862820, -1523217], safeExtents: [17832083, -2942018, 19462820, -923217],
    }],
    ['VA', {
        name_en: 'Vatican City', iso_a3: 'VAT', ibfSupported: false, initialZoom: 7, latlon: [41.90, 12.45], extents3857: [1385442, 5148028, 1386553, 5149139], safeExtents: [785442, 4548028, 1986553, 5749139],
    }],
    ['VE', {
        name_en: 'Venezuela', iso_a3: 'VEN', ibfSupported: false, initialZoom: 6, latlon: [6.42, -66.59], extents3857: [-8017982, 65381, -6654162, 1404896], safeExtents: [-8617982, -534619, -6054162, 2004896],
    }],
    ['VN', {
        name_en: 'Vietnam', iso_a3: 'VNM', ibfSupported: false, initialZoom: 5, latlon: [14.06, 108.28], extents3857: [11477916, 949128, 12207547, 2706139], safeExtents: [10877916, 349128, 12807547, 3306139],
    }],
    ['YE', {
        name_en: 'Yemen', iso_a3: 'YEM', ibfSupported: false, initialZoom: 7, latlon: [15.55, 48.52], extents3857: [4754882, 1380025, 5968459, 2099579], safeExtents: [4154882, 780025, 6568459, 2699579],
    }],
    ['ZM', {
        name_en: 'Zambia', iso_a3: 'ZMB', ibfSupported: false, initialZoom: 6, latlon: [-13.13, 27.85], extents3857: [2418158, -2099579, 3820675, -979179], safeExtents: [1818158, -2699579, 4420675, -379179],
    }],
    ['ZW', {
        name_en: 'Zimbabwe', iso_a3: 'ZWE', ibfSupported: false, initialZoom: 6, latlon: [-19.02, 29.15], extents3857: [2791693, -2556813, 3683994, -1745515], safeExtents: [2191693, -3156813, 4283994, -1145515],
    }],
]);
