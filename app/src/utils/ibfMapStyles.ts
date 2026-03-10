import { FeatureLike } from "ol/Feature";
import { CountryData, isoA2CountryNameProperty } from "./ibfMap";
import { Fill, Stroke, Style } from 'ol/style';

export type MvtStyleCreator = (feature: FeatureLike, selected: string) => Style;

// Debug style
// Fix later
//
// Style for vector tile (MVT) maps
export const styleMvtGreyWorldMap : MvtStyleCreator = (feature: FeatureLike, selected: string) => {
    const iso_a2 = feature.get(isoA2CountryNameProperty);
    const isSelected = iso_a2 === selected;
    const countryInfo = CountryData.get(iso_a2);
    const isIbfSupported = countryInfo?.ibfSupported ?? false;

    let fillColor = "#000000";

    if (isIbfSupported) {
        fillColor = isSelected ? "#f98cc2" : "#f8bbd9" ;
    }
    else {
        fillColor = isSelected ? "#ababab" : "#e0e0e0";
    }

    return new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: "#a4a4a4", width: 1 }),
    });
}

// Debug style
// Fix later
//
// Style for vector tile (MVT) maps
export const styleSelectedCountryOverlay : MvtStyleCreator = (feature: FeatureLike, selected: string) => {
    const iso_a2 = feature.get(isoA2CountryNameProperty);
    const isSelected = iso_a2 === selected;
    const fillColor = isSelected ? "#ff00ee0a" : "#00000000";
    return new Style({
        fill: new Fill({ color: fillColor })
    });
}