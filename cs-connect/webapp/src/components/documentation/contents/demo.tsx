import React from 'react';

import channelView from 'src/components/assets/img/channel_view.png';
import copyHyperlink from 'src/components/assets/img/copy_link.png';
import clickHyperlink from 'src/components/assets/img/click_on_link.png';
import hyperlinked from 'src/components/assets/img/hyperlinked.png';
import objectPage from 'src/components/assets/img/object_page.png';
import copyHyperlinkObjectPage from 'src/components/assets/img/copy_link_object_page.png';
import {ImageBoxFull} from 'src/components/commons/image';

const Demo = () => {
    return (
        <>
            <p>
                {'Consider the following image reporting an incident in Organization X related to a Dos attack 1.'}
                <br/>
                {'The right-hand sidebar is showing all the incident\'s properties.'}
            </p>
            <ImageBoxFull
                src={channelView}
                alt='OrganizarionX.DoSAttack1'
            />
            <p>
                {'By scrolling down the sidebar, it is possible to find the Observed Data for the incident.'}
                <br/>
                {'Hovering a row into the Observed Data widget will display an icon, which generates and copies an hyperlink to the row when clicked.'}
            </p>
            <ImageBoxFull
                src={copyHyperlink}
                alt={'OrganizarionX.DoSattack1\'s observed data'}
            />
            <p>{'Now the hyperlink can be pasted into the chat.'}</p>
            <ImageBoxFull
                src={clickHyperlink}
                alt='Paste hyperlink in the chat window'
            />
            <p>{'Clicking on the hyperlink in the message will result into the targeted row being highlighted in the Observerd Data widget.'}</p>
            <ImageBoxFull
                src={hyperlinked}
                alt={'Click on the hyperlink\'s effect'}
            />
            <p>{'The same can be achieved from the Dos attack 1\'s details page.'}</p>
            <ImageBoxFull
                src={objectPage}
                alt={'OrganizarionX.DoSattack1\'s details page'}
            />
            <p>{'By scrolling down the page to the Observed Data widget, it is possible to hover a row into the table and click on the icon to generate and copy an hyperlink to the row.'}</p>
            <ImageBoxFull
                src={copyHyperlinkObjectPage}
                alt={'Copy hyperlink in the OrganizarionX.DoSAttack1\'s details page'}
            />
        </>
    );
};

export default Demo;