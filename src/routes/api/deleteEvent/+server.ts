import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function DELETE({ request }) {
	try {
		const { id } = await request.json();
		if (!id) { return json({ error: 'Missing eventId' }, { status: 400 }); }
		const { error } = await supabase
			.from('calendar_events')
			.delete()
			.eq('id', id);
		if (error) { return json({ error: error.message }, { status: 500 }); }
        return json({ success: true });
	} catch (err: any) { return json({ error: err.message || 'Unexpected error' }, { status: 500 }); }
}