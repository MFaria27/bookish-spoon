export const prerender = true;
import { supabase } from '$lib/supabaseClient';

export async function renameGroup(id : string, name : string) {
    if (!id || !name) { return { error: 'Missing groupId or name' }; }
    const { data, error } = await supabase
        .from('groups')
        .update({ name: name })
        .eq('id', id)
        .select()
        .single();
    if (error) { return { error: error.message }; }

    return { group: data, success : true };
}