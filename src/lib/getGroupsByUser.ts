import { supabase } from '$lib/supabaseClient';

export async function getGroupsByUser(email : string) {
    if (!email) { return { error: 'Missing email param' }; }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
    if (userError || !userData) { return { error: 'User not found' }; }

    const { data: groupMemberData, error: groupMemberError } = await supabase
        .from('groupmembers')
        .select('group_id, groups(name)')
        .eq('user_id', userData.id);
    if (groupMemberError) { return { error: groupMemberError.message }; }

    return { groups : groupMemberData, success : true };
}