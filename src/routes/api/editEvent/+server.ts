import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
    const { id, event_name, event_details, event_date } = await request.json();
    if (!id || !event_name || !event_details || !event_date) { return json({ error: 'Event not found or missing details' }, { status: 400 }); }
    const { data, error } = await supabase
        .from('calendar_events')
        .update({ event_name : event_name, event_details : event_details, event_date : event_date })
        .eq('id', id)
        .select()
        .single();
    if (error) { return json({ error: error.message }, { status: 500 }); }

    return json({ group: data });
}