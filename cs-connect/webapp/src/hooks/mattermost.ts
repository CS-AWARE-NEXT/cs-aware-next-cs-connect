import {useState} from 'react';

/**
 * Boilerplate to add a state signalling when a specific DOM node on the Mattermost side of the webapp is ready.
 *
 * The implementation is currently based on a setTimeout, which is the same method used inside the Mattermost source code: https://github.com/mattermost/mattermost/blob/dd1e5bc9d091fef3cf4e9236a3ec652aec49bd10/webapp/channels/src/components/quick_switch_modal/quick_switch_modal.tsx#L109
 * @param id The ID attribute of the DOM element you want to be ready.
 * @returns A state variable that can be used to execute code when the DOM node is ready.
 */
export const useDOMReadyById = (id: string): boolean => {
    const [DOMReady, setDOMReady] = useState(false);
    if (!DOMReady) {
        setTimeout(() => {
            if (document.getElementById(id)) {
                setDOMReady(true);
            }
        });
    }
    return DOMReady;
};
