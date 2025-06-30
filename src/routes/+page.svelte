<script lang="ts">
    import { browser } from '$app/environment';
    import Calendar from "./calendar.svelte";
    import Groups from './groups.svelte';
    import { session } from '../store';

    let groupsLoaded = false;
    function onGroupsMounted(){ groupsLoaded = true }

</script>

<main>
    <div class="container is-flex is-flex-direction-column is-justify-content-center is-align-items-center">
        {#if browser && $session}
            <Groups mounted={onGroupsMounted}/>
            {#if groupsLoaded} <Calendar /> {/if}
        {:else}
            <h1>You are not logged in</h1>
        {/if}
    </div>
</main>
