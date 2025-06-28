import { supabase } from '$lib/supabaseClient';

export async function editEvent(id : string, event_name : string, event_details : string, event_date : string) {
    if (!id || !event_name || !event_details || !event_date) { return { error: 'Event not found or missing details' }; }
    const { data, error } = await supabase
        .from('calendar_events')
        .update({ event_name : event_name, event_details : event_details, event_date : event_date })
        .eq('id', id)
        .select()
        .single();
    if (error) { return { error: error.message }; }

    return { group : data, success : true};
}