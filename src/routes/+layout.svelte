<!-- <svelte:head>
  <link rel="stylesheet" href="/global.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" />
</svelte:head> -->

<script lang="ts">
	let { children } = $props();
	import { supabase } from "$lib/supabaseClient";
	import { syncUser } from "$lib";
	import '../../static/global.css';
	import 'bulma/css/bulma.css';
	import { session } from "../store";
    import { onMount } from "svelte";

	async function signInWithGoogle(){
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin
			}
		});
		if (error) {
			console.log("Google Sign-in Error:", error.message)
		}
	}

	onMount(async () => {
		const { data } = await supabase.auth.getSession();
		session.set(data.session);

		supabase.auth.onAuthStateChange((_event, newSession) => {
			session.set(newSession);
		})
	});

	const fallbackImage = '/images/fallbackImage.jpg';

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = fallbackImage;
	}

	$effect(() => {
		const s = $session
		if (!s || !s.user) return;
		const user = s.user;
		uploadUser(user);
	});

	async function uploadUser(user : any){
		try {
            const res = await syncUser(user);
			if (!res.success || res.error) throw new Error(res.error || 'Failed to sync user');
        } catch (err: any) { console.error(err.message || 'Unknown error'); }
	}

</script>

<main>
    <nav class="navbar is-opaque px-3 py-2">
		<div class="navbar-container is-flex is-justify-content-space-between is-align-items-center" style="width: 100%;">
			<div class="navbar-brand">
				<h1 class="navbar-item has-text-weight-semibold is-size-5">BOOKISH SPOON</h1>
			</div>
			<div class="navbar-end is-flex is-align-items-center">
				{#if $session}
					<h1 class="px-3 has-text-weight-semibold is-hidden-mobile">{$session.user?.user_metadata.full_name}</h1>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
					<figure class="image is-48x48 clickable-figure dropdown is-hoverable is-right">
						<div class="dropdown-trigger">
							<img class="is-rounded" src={$session.user?.user_metadata.avatar_url} alt="Profile" onerror={handleImageError}/>
						</div>
						<div class="dropdown-menu" id="dropdown-menu4" role="menu">
							<div class="dropdown-content">
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="dropdown-item is-flex is-justify-content-center is-align-items-center" onclick={() => supabase.auth.signOut()}>
									<!-- svelte-ignore a11y_missing_attribute -->
									<a class="has-text-danger is-size-6 clickable-figure"><strong>Sign Out</strong></a>
								</div>
							</div>
						</div>
					</figure>
				{:else}
					<button class="button is-bold" onclick={() => signInWithGoogle()}>Sign in with Google</button>
				{/if}
			</div>
		</div>
    </nav>
</main>

{@render children()}