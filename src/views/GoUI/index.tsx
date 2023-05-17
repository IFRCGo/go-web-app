import React, { useCallback, useState } from 'react';
import Button from '#components/Button';
import Links from './examples/Links';
import Buttons from './examples/Buttons';
import Cards from './examples/Cards';
// import Alerts from './examples/Alerts';
import OverlayExample from './examples/OverlayExample';
import Modals from './examples/Modals';
import Headings from './examples/Headings';
import DropdownExample from './examples/DropdownExample';
// import IconButtons from './examples/IconButtons';
import Navigation from './examples/Navigation';
import TextAreaExample from './examples/TextAreaExample';
import TextInputExample from './examples/TextInputExample';
import SwitchExample from './examples/SwitchExample';
import CheckboxExample from './examples/CheckboxExample';
import DateInputExample from './examples/DateInputExample';
import NumberInputExample from './examples/NumberInputExample';
import RichTextAreaExample from './examples/RichTextAreaExample';
import RadioInputExample from './examples/RadioInputExample';
import BlockLoadingExample from './examples/BlockLoadingExample';
import BreadcrumbsExample from './examples/BreadcrumbsExample';
import PasswordInputExample from './examples/PasswordInputExample';
import ChecklistExample from './examples/ChecklistExample';
import TopBannerExample from './examples/TopBannerExample';
import PagerExample from './examples/PagerExample';
import SelectInputExample from './examples/SelectInputExample';
import SearchSelectInputExample from './examples/SearchSelectInputExample';
import MultiSelectInputExample from './examples/MultiSelectInputExample';
import SearchMultiSelectInputExample from './examples/SearchMultiSelectInputExample';

import styles from './styles.module.css';

export function Component() {
    const [element, setElement] = useState<string | undefined>('links');

    const handleNewComponent = useCallback((name: string) => {
        setElement(name);
    }, [setElement]);

    return (
        <div className={styles.mainContainer}>
            <div className={styles.sideContent}>
                <Button
                    name="links"
                    className={element === 'links' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Links
                </Button>
                <Button
                    name="buttons"
                    className={element === 'buttons' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Buttons
                </Button>
                <Button
                    name="headings"
                    className={element === 'headings' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Headings
                </Button>
                <Button
                    name="dropdown"
                    className={element === 'dropdown' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Dropdown
                </Button>
                <Button
                    name="text-area"
                    className={element === 'text-area' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Text Area
                </Button>
                <Button
                    name="text-input"
                    className={element === 'text-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Text Input
                </Button>
                <Button
                    name="date-input"
                    className={element === 'date-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    DateInput
                </Button>
                <Button
                    name="rich-text-area"
                    className={element === 'rich-text-area' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    RichTextArea
                </Button>
                <Button
                    name="switch"
                    className={element === 'switch' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Switch
                </Button>
                <Button
                    name="checkbox"
                    className={element === 'checkbox' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Check Box
                </Button>
                <Button
                    name="number-input"
                    className={element === 'number-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Number Input
                </Button>
                <Button
                    name="radio-input"
                    className={element === 'radio-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    RadioInput
                </Button>
                <Button
                    name="password-input"
                    className={element === 'password-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    PasswordInput
                </Button>
                <Button
                    name="checklist"
                    className={element === 'checklist' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Checklist
                </Button>
                <Button
                    name="block-loading"
                    className={element === 'block-loading' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    BlockLoading
                </Button>
                <Button
                    name="cards"
                    className={element === 'cards' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Cards
                </Button>
                <Button
                    name="alerts"
                    className={element === 'alerts' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Alerts
                </Button>
                <Button
                    name="top-banner"
                    className={element === 'top-banner' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    TopBanner
                </Button>
                <Button
                    name="overlay"
                    className={element === 'overlay' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Overlay
                </Button>
                <Button
                    name="tabs"
                    className={element === 'tabs' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Tab Panel
                </Button>
                <Button
                    name="modals"
                    className={element === 'modals' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Modal
                </Button>
                <Button
                    name="iconButton"
                    className={element === 'iconButton' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    IconButton
                </Button>
                <Button
                    name="breadcrumbs"
                    className={element === 'breadcrumbs' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Breadcrumbs
                </Button>
                <Button
                    name="pager"
                    className={styles.option}
                    onClick={handleNewComponent}
                >
                    Pager
                </Button>
                <Button
                    name="select-input"
                    className={element === 'select-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Select Input
                </Button>
                <Button
                    name="search-select-input"
                    className={element === 'search-select-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Search Select Input
                </Button>
                <Button
                    name="multi-select-input"
                    className={element === 'multi-select-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Multi Select Input
                </Button>
                <Button
                    name="search-multi-select-input"
                    className={element === 'search-multi-select-input' ? styles.selectedOption : styles.option}
                    onClick={handleNewComponent}
                >
                    Search Multi Select Input
                </Button>
            </div>
            <div className={styles.componentLayout}>
                {element === 'links' && <Links />}
                {element === 'cards' && <Cards />}
                {/* element === "alerts" && <Alerts /> */}
                {element === 'overlay' && <OverlayExample />}
                {element === 'buttons' && <Buttons />}
                {element === 'headings' && <Headings />}
                {element === 'dropdown' && <DropdownExample />}
                {element === 'tabs' && <Navigation />}
                {element === 'modals' && <Modals />}
                {element === 'text-area' && <TextAreaExample />}
                {element === 'text-input' && <TextInputExample />}
                {element === 'switch' && <SwitchExample />}
                {element === 'checkbox' && <CheckboxExample />}
                {/* element === 'iconButton' && <IconButtons /> */}
                {element === 'number-input' && <NumberInputExample />}
                {element === 'date-input' && <DateInputExample />}
                {element === 'rich-text-area' && <RichTextAreaExample />}
                {element === 'radio-input' && <RadioInputExample />}
                {element === 'block-loading' && <BlockLoadingExample />}
                {element === 'breadcrumbs' && <BreadcrumbsExample />}
                {element === 'password-input' && <PasswordInputExample />}
                {element === 'checklist' && <ChecklistExample />}
                {element === 'top-banner' && <TopBannerExample />}
                {element === 'pager' && <PagerExample />}
                {element === 'select-input' && <SelectInputExample />}
                {element === 'multi-select-input' && <MultiSelectInputExample />}
                {element === 'search-select-input' && <SearchSelectInputExample />}
                {element === 'search-multi-select-input' && <SearchMultiSelectInputExample />}
            </div>
        </div>
    );
}

Component.displayName = 'GoUI';
