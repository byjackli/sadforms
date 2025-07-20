import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    return { 
        home: url.pathname
    };
};