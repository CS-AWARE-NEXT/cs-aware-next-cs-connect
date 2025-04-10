import React, {FC} from 'react';

import {MarkdownEditWithID} from 'src/components/commons/markdown_edit';
import {HorizontalSeparator} from 'src/components/backstage/grid';

import {LabelWithInfoTextBig} from './label_with_info_text';

const MARKDOWN_LINKS_TIPS = `
##### Syntax:
To create a link in Markdown, use the following syntax:

\`\`\`markdown
[Link Text](https://example.com)
\`\`\`

- **Link Text**: The text that will be displayed as the clickable link.
- **URL**: The web address the link points to.

##### Example:
\`\`\`markdown
[Visit GitHub](https://github.com)
\`\`\`

This will render as: [Visit GitHub](https://github.com).

##### Copy:
You can copy the following template to use in your Markdown:

\`\`\`markdown
[Your Link Text](https://your-url.com)
\`\`\`
`;

const MARKDOWN_LISTS_TIPS = `
##### Syntax:
To create a list in Markdown, use the following syntax:

**Unordered List:**
\`\`\`markdown
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
\`\`\`

**Ordered List:**
\`\`\`markdown
1. Item 1
2. Item 2
   1. Subitem 2.1
   2. Subitem 2.2
\`\`\`

##### Example:
**Unordered List:**
\`\`\`markdown
- Apples
- Oranges
  - Mandarins
  - Clementines
\`\`\`

**Ordered List:**
\`\`\`markdown
1. Step 1
2. Step 2
   1. Substep 2.1
   2. Substep 2.2
\`\`\`

##### Copy:
You can copy the following templates to use in your Markdown:

**Unordered List Template:**
\`\`\`markdown
- Item 1
- Item 2
  - Subitem 2.1
\`\`\`

**Ordered List Template:**
\`\`\`markdown
1. Item 1
2. Item 2
   1. Subitem 2.1
\`\`\`
`;

const MARKDOWN_TABLES_TIPS = `
##### Syntax:
To create a table in Markdown, use the following syntax:

\`\`\`markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data 1   | Data 2   |
| Row 2    | Data 3   | Data 4   |
\`\`\`

- **Headers**: The first row contains the column headers, separated by pipes (\`|\`).
- **Alignment**: Use colons (\`:\`) in the separator row to align text:
  - \`|:---|\` for left alignment.
  - \`|:---:|\` for center alignment.
  - \`|---:|\` for right alignment.

##### Example:
\`\`\`markdown
| Name       | Age | City       |
|------------|-----|------------|
| Alice      | 25  | New York   |
| Bob        | 30  | San Francisco |
| Charlie    | 35  | Chicago    |
\`\`\`

This will render as:

| Name       | Age | City          |
|------------|-----|---------------|
| Alice      | 25  | New York      |
| Bob        | 30  | San Francisco |
| Charlie    | 35  | Chicago       |

##### Copy:
You can copy the following template to use in your Markdown:

\`\`\`markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
\`\`\`
`;

type Props = {
}

const WritingTips: FC<Props> = () => {
    return (
        <>
            <LabelWithInfoTextBig
                label='How to write links'
                infoText='This section provides tips on how to write links in Markdown format.'
            />
            <MarkdownEditWithID
                id={'writing-md-links'}
                opaqueText={true}
                textBoxProps={{
                    value: MARKDOWN_LINKS_TIPS,
                    placeholder: 'Writing links tips here...',
                }}
            />

            <LabelWithInfoTextBig
                label='How to write lists'
                infoText='This section provides tips on how to write lists in Markdown format.'
            />
            <MarkdownEditWithID
                id={'writing-md-lists'}
                opaqueText={true}
                textBoxProps={{
                    value: MARKDOWN_LISTS_TIPS,
                    placeholder: 'Writing lists tips here...',
                }}
            />

            <HorizontalSeparator/>

            <LabelWithInfoTextBig
                label='How to write tables'
                infoText='This section provides tips on how to write tables in Markdown format.'
            />
            <MarkdownEditWithID
                id={'writing-md-tables'}
                opaqueText={true}
                textBoxProps={{
                    value: MARKDOWN_TABLES_TIPS,
                    placeholder: 'Writing tables tips here...',
                }}
            />
        </>
    );
};

export default WritingTips;