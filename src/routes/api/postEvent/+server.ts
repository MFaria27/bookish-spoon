import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
	try {
		const { calendar_id, event_name, event_details, event_date } = await request.json();
		if ( !event_name || !event_details || !event_date ) { return json({ error: 'Missing required fields' }, { status: 400 }); }

		const { data: insertData, error: insertError } = await supabase
			.from('calendar_events')
			.insert([ { calendar_id, event_name, event_details, event_date } ])
			.select();

		if (insertError) { return json({ error: insertError.message }, { status: 500 }); }

		return json({ success: true, event: insertData[0] });
	} catch (err: any) {
		return json({ error: err.message || 'Unexpected server error' }, { status: 500 });
	}
}