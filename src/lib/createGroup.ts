export const prerender = true;
import { supabase } from '$lib/supabaseClient';

export async function createGroup(name : string, email : string) {
    if (!name || !email) { return { error: 'Missing group name or email' }; }

    const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({ name: name })
        .select()
        .single();
    if (groupError) { return { error: groupError.message }; }

    const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .insert({ group_id: groupData.id })
        .select()
        .single();
    if (calendarError) { return { error: calendarError.message }; }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
    if (userError || !userData) { return { error: 'User not found' }; }

    const { error: memberError } = await supabase
        .from('groupmembers')
        .insert({ user_id: userData.id, group_id: groupData.id });
    if (memberError) { return { error: memberError.message }; }

    return { group: groupData, calendar: calendarData, success : true };
}