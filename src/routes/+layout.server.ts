export const ssr = false;
export const prerender = true
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    return {
        session: await event.locals.auth()
    }
}