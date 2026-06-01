import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    ChevronDownLineIcon,
    CopyLineIcon,
    SearchLineIcon,
} from '@ifrc-go/icons';
import {
    Container,
    DropdownMenu,
    InlineLayout,
    Label,
    ListView,
    RadioInput,
    RawButton,
    Switch,
    TextInput,
} from '@ifrc-go/ui';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import {
    DEFAULT_HDX_OPACITY,
    type HdxLayerSelection,
    type HdxOptionGroup,
    type HdxRepresentation,
} from '../hdxLayers';
import OpacitySlider from './OpacitySlider';

import styles from './styles.module.css';

interface RepresentationOption {
    key: HdxRepresentation;
    label: string;
}
// FIXME: use strings
const REPRESENTATION_OPTIONS: RepresentationOption[] = [
    { key: 'choropleth', label: 'Choropleth' },
    { key: 'bubble', label: 'Bubble' },
];
function representationKeySelector(option: RepresentationOption) { return option.key; }
function representationLabelSelector(option: RepresentationOption) { return option.label; }

interface LayerControlsProps {
    selection: HdxLayerSelection;
    onRepresentationChange: (representation: HdxRepresentation, key: string) => void;
    onOpacityChange: (opacity: number, key: string) => void;
}

// Per-layer representation + opacity controls shown beneath an active row.
function LayerControls(props: LayerControlsProps) {
    const { selection, onRepresentationChange, onOpacityChange } = props;
    return (
        <ListView
            layout="block"
            withDarkBackground
            spacing="sm"
            withSpacingOpticalCorrection
            withPadding
        >
            <RadioInput
                name={selection.key}
                value={selection.representation}
                options={REPRESENTATION_OPTIONS}
                keySelector={representationKeySelector}
                labelSelector={representationLabelSelector}
                onChange={onRepresentationChange}
            />
            <OpacitySlider
                name={selection.key}
                value={selection.opacity}
                onChange={onOpacityChange}
            />
        </ListView>
    );
}

interface LayerGroupProps {
    group: HdxOptionGroup;
    selectionByKey: Map<string, HdxLayerSelection>;
    normalizedSearch: string;
    isOpen: boolean;
    onToggleSection: (name: string) => void;
    onToggle: (on: boolean, key: string) => void;
    onRepresentationChange: (representation: HdxRepresentation, key: string) => void;
    onOpacityChange: (opacity: number, key: string) => void;
}

// One collapsible dataset section. A custom header button + a single
// ChevronDownLineIcon rotated via CSS (never swapped/remounted), so clicking to
// expand OR collapse never detaches the click target — detaching it would defeat
// the portaled DropdownMenu's contains()-based blur check and close the popup.
function LayerGroup(props: LayerGroupProps) {
    const {
        group,
        selectionByKey,
        normalizedSearch,
        isOpen,
        onToggleSection,
        onToggle,
        onRepresentationChange,
        onOpacityChange,
    } = props;

    const isSearching = normalizedSearch.length > 0;
    const matchedOptions = group.options.filter((option) => (
        !isSearching
        || option.metric.label.toLowerCase().includes(normalizedSearch)
        || group.label.toLowerCase().includes(normalizedSearch)
    ));
    if (isSearching && matchedOptions.length === 0) {
        return null;
    }
    const activeCount = group.options.filter(
        (option) => selectionByKey.has(option.key),
    ).length;

    return (
        <Container
            className={styles.section}
            withBorder
            withPadding
            headingLevel={4}
            heading={(
                <RawButton
                    className={styles.sectionHeader}
                    name={group.datasetName}
                    onClick={onToggleSection}
                    aria-expanded={isOpen}
                >
                    <InlineLayout
                        spacing="xs"
                        before={(
                            <ChevronDownLineIcon
                                className={_cs(styles.chevron, isOpen && styles.chevronExpanded)}
                            />
                        )}
                        after={activeCount > 0 && (
                            <div className={styles.countBadge}>{activeCount}</div>
                        )}
                    >
                        <Label strong>
                            {group.label}
                        </Label>
                    </InlineLayout>
                </RawButton>
            )}
        >
            {isOpen && (
                <ListView
                    className={styles.sectionBody}
                    layout="block"
                    spacing="xs"
                >
                    {matchedOptions.map((option) => {
                        const selection = selectionByKey.get(option.key);
                        return (
                            <ListView
                                layout="block"
                                spacing="3xs"
                                key={option.key}
                            >
                                <Switch
                                    name={option.key}
                                    label={option.metric.label}
                                    value={isDefined(selection)}
                                    onChange={onToggle}
                                    withInvertedView
                                />
                                {isDefined(selection) && (
                                    <LayerControls
                                        selection={selection}
                                        onRepresentationChange={onRepresentationChange}
                                        onOpacityChange={onOpacityChange}
                                    />
                                )}
                            </ListView>
                        );
                    })}
                </ListView>
            )}
        </Container>
    );
}

interface Props {
    optionGroups: HdxOptionGroup[];
    value: HdxLayerSelection[];
    onChange: (next: HdxLayerSelection[]) => void;
    // Local units point layer (a single toggleable marker layer + opacity).
    localUnitsActive: boolean;
    localUnitsOpacity: number;
    onLocalUnitsToggle: (active: boolean) => void;
    onLocalUnitsOpacityChange: (opacity: number) => void;
}

// Searchable, collapsible, grouped map-layers panel (design handoff "Tidy" / D1).
// Multi-select: each active data layer carries its own representation + opacity.
function LayersPanel(props: Props) {
    const {
        optionGroups,
        value,
        onChange,
        localUnitsActive,
        localUnitsOpacity,
        onLocalUnitsToggle,
        onLocalUnitsOpacityChange,
    } = props;

    const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const selectionByKey = useMemo(
        () => new Map(value.map((selection) => [selection.key, selection])),
        [value],
    );

    const normalizedSearch = (searchValue ?? '').trim().toLowerCase();
    const isSearching = normalizedSearch.length > 0;
    const activeCount = value.length + (localUnitsActive ? 1 : 0);
    // "Local units" matches search by its own name (no metric rows to filter).
    const localUnitsVisible = !isSearching || 'local units'.includes(normalizedSearch);

    const handleToggle = useCallback(
        (on: boolean, key: string) => {
            if (on) {
                if (value.some((selection) => selection.key === key)) {
                    return;
                }
                onChange([
                    ...value,
                    { key, representation: 'choropleth', opacity: DEFAULT_HDX_OPACITY },
                ]);
            } else {
                onChange(value.filter((selection) => selection.key !== key));
            }
        },
        [value, onChange],
    );

    const handleRepresentationChange = useCallback(
        (representation: HdxRepresentation, key: string) => {
            onChange(value.map((selection) => (
                selection.key === key ? { ...selection, representation } : selection
            )));
        },
        [value, onChange],
    );

    const handleOpacityChange = useCallback(
        (opacity: number, key: string) => {
            onChange(value.map((selection) => (
                selection.key === key ? { ...selection, opacity } : selection
            )));
        },
        [value, onChange],
    );

    const handleClearAll = useCallback(() => {
        onChange([]);
        onLocalUnitsToggle(false);
    }, [onChange, onLocalUnitsToggle]);

    const handleSectionToggle = useCallback(
        (datasetName: string) => {
            if (!datasetName) {
                return;
            }
            setExpanded((prev) => {
                const group = optionGroups.find((g) => g.datasetName === datasetName);
                const activeN = group
                    ? group.options.filter((o) => selectionByKey.has(o.key)).length
                    : 0;
                const current = prev[datasetName] ?? activeN > 0;
                return { ...prev, [datasetName]: !current };
            });
        },
        [optionGroups, selectionByKey],
    );

    return (
        <DropdownMenu
            // FIXME: use strings
            label={activeCount > 0 ? `Layers (${activeCount})` : 'Layers'}
            labelBefore={<CopyLineIcon />}
            labelStyleVariant="outline"
            persistent
            preferredPopupWidth={26}
        >
            <Container
                className={styles.layersPanel}
                withContentOverflow
                headerDescription={(
                    <TextInput
                        name="layerSearch"
                        // FIXME: use strings
                        placeholder="Search layers"
                        value={searchValue}
                        onChange={setSearchValue}
                        icons={<SearchLineIcon />}
                    />
                )}
            >
                {/* Always mounted (hidden when empty) so clicking "Clear all" never
                    unmounts its own button — unmounting the click target would
                    detach it and close the popup. */}
                <div className={_cs(styles.activeSummary, activeCount === 0 && styles.hidden)}>
                    {/* FIXME: use strings */}
                    <span>{`${activeCount} active`}</span>
                    <button
                        type="button"
                        className={styles.clearAll}
                        onClick={handleClearAll}
                    >
                        Clear all
                    </button>
                </div>
                <ListView
                    layout="block"
                    spacing="2xs"
                >
                    {optionGroups.map((group) => {
                        const activeN = group.options.filter(
                            (option) => selectionByKey.has(option.key),
                        ).length;
                        const isOpen = isSearching
                            ? true
                            : (expanded[group.datasetName] ?? activeN > 0);
                        return (
                            <LayerGroup
                                key={group.datasetName}
                                group={group}
                                selectionByKey={selectionByKey}
                                normalizedSearch={normalizedSearch}
                                isOpen={isOpen}
                                onToggleSection={handleSectionToggle}
                                onToggle={handleToggle}
                                onRepresentationChange={handleRepresentationChange}
                                onOpacityChange={handleOpacityChange}
                            />
                        );
                    })}
                    {localUnitsVisible && (
                        <ListView layout="block">
                            <Switch
                                name="localUnits"
                                // FIXME: use strings
                                label={(
                                    <span className={styles.markerLabel}>
                                        <span className={styles.markerDot} />
                                        Local units
                                    </span>
                                )}
                                value={localUnitsActive}
                                onChange={onLocalUnitsToggle}
                                withInvertedView
                                withDarkBackground
                            />
                            {localUnitsActive && (
                                <div className={styles.controlBlock}>
                                    <OpacitySlider
                                        name="localUnits"
                                        value={localUnitsOpacity}
                                        onChange={onLocalUnitsOpacityChange}
                                    />
                                </div>
                            )}
                        </ListView>
                    )}
                </ListView>
            </Container>
        </DropdownMenu>
    );
}

export default LayersPanel;
