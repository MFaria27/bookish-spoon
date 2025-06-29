import { supabase } from '$lib/supabaseClient';

export async function postEvent(calendar_id : string, event_name : string, event_details : string, event_date : string) {
    if ( !event_name || !event_details || !event_date ) { return { error: 'Missing required fields' }; }

    const { data: insertData, error: insertError } = await supabase
        .from('calendar_events')
        .insert([ { calendar_id, event_name, event_details, event_date } ])
        .select();
    if (insertError) { return { error: insertError.message }; }

    return { success: true, event: insertData[0] };
}