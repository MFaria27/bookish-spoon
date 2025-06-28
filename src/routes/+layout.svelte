<script lang="ts">
	let { children } = $props();
	import { signIn, signOut } from "@auth/sveltekit/client";
    import { page } from "$app/stores";
	import { syncUser } from "$lib";

	const fallbackImage = '/images/fallbackImage.jpg';

	function handleImageError(event: Event) {
		const target = event.target as HTMLImageElement;
		target.src = fallbackImage;
	}

	$effect(() => {
		const s = $page.data.session
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
				{#if $page.data.session}
					<h1 class="px-3 has-text-weight-semibold is-hidden-mobile">{$page.data.session.user?.name}</h1>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
					<figure class="image is-48x48 clickable-figure dropdown is-hoverable is-right">
						<div class="dropdown-trigger">
							<img class="is-rounded" src={$page.data.session.user?.image} alt="Profile" onerror={handleImageError}/>
						</div>
						<div class="dropdown-menu" id="dropdown-menu4" role="menu">
							<div class="dropdown-content">
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div class="dropdown-item is-flex is-justify-content-center is-align-items-center" onclick={() => signOut()}>
									<!-- svelte-ignore a11y_missing_attribute -->
									<a class="has-text-danger is-size-6 clickable-figure"><strong>Sign Out</strong></a>
								</div>
							</div>
						</div>
					</figure>
				{:else}
					<button class="button is-bold" onclick={() => signIn("google")}>Sign in with Google</button>
				{/if}
			</div>
		</div>
    </nav>
</main>

{@render children()}