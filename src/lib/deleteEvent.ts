import { supabase } from '$lib/supabaseClient';

export async function deleteEvent(id : string) {
	try {
		if (!id) { return { error: 'Missing eventId' }; }
		const { error } = await supabase
			.from('calendar_events')
			.delete()
			.eq('id', id);
		if (error) { return { error: error.message }; }
        return { success: true };
	} catch (err: any) { return { error: err.message || 'Unexpected error' }; }
}