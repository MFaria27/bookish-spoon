export const prerender = true;
import { supabase } from '$lib/supabaseClient';

export async function getCalendarByGroupName(groupName : string) {
    if (!groupName) { return { error: 'Missing group param' }; }
    
    const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('name', groupName)
        .single();
    if (groupError || !groupData) { return { error: groupError?.message || 'Group not found' }; }
    const group_id = groupData.id;

    const { data, error } = await supabase
        .from('calendars')
        .select('*, groups(name), calendar_events(*)')
        .eq('group_id', group_id)
        .single();
    if (error) return { error: error.message };
    return { calendar : data, success : true };
}