import { json } from '@sveltejs/kit'
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }) {
    const groupName = url.searchParams.get('group');
    if (!groupName) {
		return json({ error: 'Missing group param' }, { status: 400 });
	}
	const { data, error } = await supabase
		.from('calendars')
		.select('*, groups(name), calendar_events(*)')
		.eq('groups.name', groupName)
		.single()

	if (error) json({ error: error.message }, { status: 500 });
    return json({ calendar: data });
}