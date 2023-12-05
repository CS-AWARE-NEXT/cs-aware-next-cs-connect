import {RefObject, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router-dom';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

// If you need re-renderings based on url hash changes,
// you may need to use const {hash} = useLocation();
// This is to prevent components losing reference to the last non-empty url hash
// when useScrollIntoView cleans it after scrolling
export const useUrlHash = (): string => {
    const {hash: urlHash} = useLocation();
    let renderHash = localStorage.getItem('previousHash') || '';
    renderHash = urlHash && urlHash !== '' ? urlHash : renderHash;
    return renderHash;
};

export const useCleanUrlHash = () => {
    useEffect(() => {
        const hash = localStorage.getItem('previousHash');
        if (!hash) {
            localStorage.setItem('previousHash', '');
            return;
        }
        const element = document.querySelector(hash);
        if (!element) {
            localStorage.setItem('previousHash', '');
        }
    });
};

export const useCleanUrlHashOnChannelChange = () => {
    const channelId = useSelector(getCurrentChannelId);
    useEffect(() => {
        localStorage.setItem('previousHash', '');
    }, [channelId]);
};

type ScrollIntoViewPositions = {
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
};

export const useScrollIntoView = (hash: string, positions?: ScrollIntoViewPositions) => {
    useCleanUrlHash();

    // When first loading the page, the element with the ID corresponding to the URL
    // hash is not mounted, so the browser fails to automatically scroll to such section.
    // To fix this, we need to manually scroll to the component
    useEffect(() => {
        const options = buildOptions(positions);
        const previousHash = localStorage.getItem('previousHash');
        if (hash !== '' || previousHash) {
            setTimeout(() => {
                let urlHash = hash;
                if (urlHash === '' && previousHash) {
                    urlHash = previousHash;
                }
                document.querySelector(urlHash)?.scrollIntoView(options);
                localStorage.setItem('previousHash', urlHash);
                window.location.hash = '';
            }, 300);
        }
    }, [hash]);

    useCleanUrlHashOnChannelChange();
};

// Doc: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
const buildOptions = (positions: ScrollIntoViewPositions | undefined): ScrollIntoViewOptions => {
    let options: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
    };
    if (positions) {
        const {block, inline} = positions;
        options = {...options, block, inline};
    }
    return options;
};

// export const useScrollIntoViewWithCustomTime = (hash: string, time: number) => {
//     useEffect(() => {
//         if (hash !== '') {
//             setTimeout(() => {
//                 document.querySelector(hash)?.scrollIntoView({behavior: 'smooth'});
//             }, time);
//         }
//     }, [hash]);
// };

export const useOnScreen = (ref: RefObject<HTMLDivElement | null>, options?: IntersectionObserverInit): boolean => {
    const current = ref.current;
    const [isIntersecting, setIntersecting] = useState(false);

    const observer: IntersectionObserver = new IntersectionObserver(([entry]) => {
        setIntersecting(entry.isIntersecting);
    }, options);

    useEffect(() => {
        if (current) {
            observer.observe(current);
        }
        return () => {
            if (current) {
                observer.disconnect();
            }
        };
    }, [current]);

    return isIntersecting;
};

/**
 * Boilerplate to add a state signalling when a specific DOM node on the Mattermost side of the webapp is ready.
 *
 * The implementation is currently based on a setTimeout, which is the same method used inside the Mattermost source code: https://github.com/mattermost/mattermost/blob/dd1e5bc9d091fef3cf4e9236a3ec652aec49bd10/webapp/channels/src/components/quick_switch_modal/quick_switch_modal.tsx#L109
 * @param id The ID attribute of the DOM element you want to be ready.
 * @returns A state variable that can be used to execute code when the DOM node is ready.
 */
export const useDOMReadyById = (id: string): boolean => {
    const [DOMReady, setDOMReady] = useState(false);
    setTimeout(() => {
        setDOMReady(document.getElementById(id) !== null);
    });
    return DOMReady;
};
