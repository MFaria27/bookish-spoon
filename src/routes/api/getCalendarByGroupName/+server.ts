import { json } from '@sveltejs/kit'
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }) {
    const groupName = url.searchParams.get('group');
    if (!groupName) { return json({ error: 'Missing group param' }, { status: 400 }); }
	
	const { data: groupData, error: groupError } = await supabase
		.from('groups')
		.select('id')
		.eq('name', groupName)
		.single();
	if (groupError || !groupData) { return json({ error: groupError?.message || 'Group not found' }, { status: 404 }); }
	const group_id = groupData.id;

	const { data, error } = await supabase
		.from('calendars')
		.select('*, groups(name), calendar_events(*)')
		.eq('group_id', group_id)
		.single();
	if (error) json({ error: error.message }, { status: 500 });
    return json({ calendar: data });
}