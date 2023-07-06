import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export const useUrlHash = (): string => {
    const {hash: urlHash} = useLocation();
    let renderHash = localStorage.getItem('previousHash') || '';
    renderHash = urlHash && urlHash !== '' ? urlHash : renderHash;
    return renderHash;
};

export const useCleanHash = () => {
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

export const useScrollIntoView = (hash: string) => {
    useCleanHash();

    // When first loading the page, the element with the ID corresponding to the URL
    // hash is not mounted, so the browser fails to automatically scroll to such section.
    // To fix this, we need to manually scroll to the component
    useEffect(() => {
        const previousHash = localStorage.getItem('previousHash');
        if (hash !== '' || previousHash) {
            console.log('scrolling');
            setTimeout(() => {
                let urlHash = hash;
                if (urlHash === '' && previousHash) {
                    urlHash = previousHash;
                }
                document.querySelector(urlHash)?.scrollIntoView({behavior: 'smooth'});
                localStorage.setItem('previousHash', urlHash);
                window.location.hash = '';
            }, 300);
        }
    }, [hash]);
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