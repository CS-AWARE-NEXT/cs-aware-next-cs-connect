import {useEffect} from 'react';

export const useScrollIntoView = (hash: string) => {
    // When first loading the page, the element with the ID corresponding to the URL
    // hash is not mounted, so the browser fails to automatically scroll to such section.
    // To fix this, we need to manually scroll to the component
    useEffect(() => {
        if (hash !== '') {
            setTimeout(() => {
                document.querySelector(hash)?.scrollIntoView({behavior: 'smooth'});
            }, 400);
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