import {fetchSectionInfo} from 'src/clients';
import {
    ecosystemElementsFields,
    ecosystemElementsWidget,
    ecosystemRolesFields,
    ecosystemRolesWidget,
} from 'src/constants';
import {formatName, formatStringToLowerCase} from 'src/helpers';
import {Object, Section, Widget} from 'src/types/organization';
import {HyperlinkReference, ParseOptions, WidgetHash} from 'src/types/parser';
import {Element, Role} from 'src/types/scenario_wizard';

// TableReference example: #participants-and-roles-23e6db73-68c5-4362-ae73-d7eed4dac16a-0-section
// RowReference example: #paginated-table-row-8a0f6fa0-2602-4cf3-8069-90869be61fae
export const parsePaginatedTableWidgetId = async (
    {section, object}: HyperlinkReference,
    tokens: string[],
    {name}: Widget,
    options?: ParseOptions,
): Promise<WidgetHash> => {
    const tableWidgetHash = {
        hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
        text: name as string,
    };
    const isReferenceToTable = tokens.length < 1;
    if (isReferenceToTable) {
        return tableWidgetHash;
    }
    if (!options?.isIssues) {
        // TODO: add here logic for classic widget, not only ecosystem
        return tableWidgetHash;
    }
    const widgetHash = await parseIssuesWidgetId(tokens, name as string, section, object);
    if (!widgetHash) {
        return tableWidgetHash;
    }
    return widgetHash;
};

const parseIssuesWidgetId = async (
    tokens: string[],
    widgetName: string,
    section: Section | undefined,
    object: Object | undefined,
): Promise<WidgetHash | null> => {
    const columnName = tokens.splice(0, 1)[0];
    const rowValue = tokens.splice(0, 1)[0];
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return null;
    }
    switch (formatStringToLowerCase(widgetName)) {
    case ecosystemRolesWidget:
        return parseRolesWidgetId(sectionInfo.roles, columnName, rowValue);
    case ecosystemElementsWidget:
        return parseElementsWidgetId(sectionInfo.elements, columnName, rowValue);
    default:
        return null;
    }
};

const parseRolesWidgetId = async (
    roles: Role[],
    columnName: string,
    rowValue: string,
): Promise<WidgetHash | null> => {
    const [role, text] = getRoleAndText(roles, columnName, rowValue);
    if (!role) {
        return null;
    }
    return {
        hash: `paginated-table-row-${role.id as string}`,
        text,
    };
};

const getRoleAndText = (
    roles: Role[],
    columnName: string,
    rowValue: string,
): [Role | undefined, string] => {
    let role: Role | undefined;
    let text = '';
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[0]) {
        role = roles.find(({userId}) => userId === rowValue);
        text = role?.userId as string;
    }
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[1]) {
        role = roles.find((rl) => rl.roles.some((r) => r === rowValue));
        text = role?.roles.find((r) => r === rowValue) as string;
    }
    return [role, text];
};

const parseElementsWidgetId = async (
    elements: Element[],
    columnName: string,
    rowValue: string,
): Promise<WidgetHash | null> => {
    const [element, text] = getElementAndText(elements, columnName, rowValue);
    if (!element) {
        return null;
    }
    return {
        hash: `paginated-table-row-${element.id as string}`,
        text,
    };
};

const getElementAndText = (
    elements: Element[],
    columnName: string,
    rowValue: string,
): [Element | undefined, string] => {
    let element: Element | undefined;
    let text = '';
    if (formatStringToLowerCase(columnName) === ecosystemElementsFields[1]) {
        element = elements.find(({name}) => name === rowValue);
        text = element?.name as string;
    }

    // TODO: somehting similar to list widget can be done here (ellipsis for description too long)
    if (formatStringToLowerCase(columnName) === ecosystemElementsFields[2]) {
        element = elements.find(({description}) => description?.startsWith(rowValue));
        text = element?.description as string;
    }
    return [element, text];
};
