export const prerender = true;
import { supabase } from '$lib/supabaseClient';

export async function addUserToGroup(email : string, group_id : string) {
    if (!email || !group_id) { return { error : 'Missing email or groupId' }; }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
    if (userError || !userData) { return { error : 'User not found' }; }

    const { error: insertError } = await supabase
        .from('groupmembers')
        .insert({ user_id: userData.id, group_id: group_id });
    if (insertError) { return { error : insertError.message }; }

    return { success : true };
}