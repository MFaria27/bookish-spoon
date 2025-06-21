<script lang="ts">
    import { Calendar } from "bits-ui";
    import CaretLeft from "phosphor-svelte/lib/CaretLeft";
    import CaretRight from "phosphor-svelte/lib/CaretRight";
    import Trash from "phosphor-svelte/lib/Trash";
    import { getLocalTimeZone, today, isSameDay, type DateValue, CalendarDate, parseDate } from "@internationalized/date";
    import { onMount } from "svelte";
    import { currentGroup } from "../store";

    let groupName : any;
    let calendarID = ''

	onMount(async () => {
		loadCalendar()
	});

    $effect(() => {
        const newGroup = $currentGroup;
        console.log(`New group loaded: ${newGroup}`)
        loadCalendar();
    });

    let value = $state(today(getLocalTimeZone()));
    const currentDate = today(getLocalTimeZone());
    
    let placeholderEventTitle = $state("");
    let placeholderEventDetails = $state("");
    let placeholderEventDate = $state("");
    
    let isModalOpen = $state(false);
    function openModal() { isModalOpen = true; }
    function closeModal() { isModalOpen = false; }

    let saved_dates : any = $state([ ])

    async function loadCalendar() {
        try {
            currentGroup.subscribe(value => { groupName = value; })
			const res = await fetch(`/api/getCalendarByGroupName?group=${encodeURIComponent(groupName)}`);
			if (!res.ok) throw new Error('Failed to fetch calendar');
			const data = await res.json();
			if (data.error) throw new Error(data.error);
			let calendar = data.calendar;
            calendarID = calendar['id']
            saved_dates = []
            calendar['calendar_events'].forEach((saved_date:any) => {
                saved_dates.push({
                    "id": saved_date["id"],
                    "title": saved_date["event_name"],
                    "details": saved_date["event_details"],
                    "date": parseDate(saved_date["event_date"])
                })
            });
		} catch (err:any) { console.log(err.message || 'Unknown error'); }
    }

    async function addSavedDate() {
        try {
            const res = await fetch('/api/postEvent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calendar_id: calendarID, 
                    event_name: placeholderEventTitle,
                    event_details: placeholderEventDetails,
                    event_date: placeholderEventDate
                })
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.error || 'Failed to post event'); }
            await loadCalendar();
            // console.log('Event saved to DB:', data.event);
        } catch (err: any) { console.error('Error saving event:', err.message); }

        placeholderEventTitle = "";
        placeholderEventDetails = "";
        placeholderEventDate = "";
        closeModal()
    }

    async function deleteEvent( eventID : any ) {
        try {
            const res = await fetch('/api/deleteEvent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: eventID })
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.error || 'Failed to delete event'); }
            await loadCalendar();
        } catch (err: any) { console.error('Error deleting event:', err.message); }
    }

    function isToday(date: DateValue): boolean {
        return isSameDay(date, currentDate);
    }

    function isSaved(date: DateValue): boolean {
        let saved = false;
        saved_dates.forEach((saved_date:any) => {
            if (isSameDay(date, saved_date["date"])) saved = true;
        });
        return saved;
    }
</script>

<main>
    <div class="calendar-wrapper">
        <Calendar.Root class="card has-background-black-ter" weekdayFormat="short" fixedWeeks={true} type="single" style="width: 350px;" bind:value>
            {#snippet children({ months, weekdays })}
                <Calendar.Header class="card-header is-justify-content-space-between is-align-items-center px-4 py-3">
                    <Calendar.PrevButton class="button is-small">
                        <CaretLeft class=""/>
                    </Calendar.PrevButton>
                    <Calendar.Heading class="has-text-weight-semibold is-size-5"/>
                    <Calendar.NextButton class="button is-small">
                        <CaretRight class=""/>
                    </Calendar.NextButton>
                </Calendar.Header>
                <div class="card-content pt-0 is-flex is-justify-content-center is-align-items-center">
                    {#each months as month, i (i)}
                        <Calendar.Grid class="is-fullwidth has-text-centered">
                            <Calendar.GridHead class="">
                                <Calendar.GridRow class="columns is-multiline is-gapless has-text-weight-bold mb-2">
                                    {#each weekdays as day, i (i)}
                                        <Calendar.HeadCell class="column has-text-centered is-size-7">
                                            <div>{day.slice(0, 2)}</div>
                                        </Calendar.HeadCell>
                                    {/each}
                                </Calendar.GridRow>
                            </Calendar.GridHead>
                            <Calendar.GridBody>
                                {#each month.weeks as weekDates, i (i)}
                                    <Calendar.GridRow class="columns is-multiline is-gapless mb-0" style="position:relative">
                                        {#each weekDates as date, i (i)}
                                            {#if isToday(date)}
                                                <Calendar.Cell {date} month={month.value} class="column has-text-centered has-background-primary" style="border-radius:35%;">
                                                    <div class="container is-flex is-justify-content-center is-align-items-center dot-cell">
                                                        <span class={`dot ${isSaved(date) ? 'is-visible' : 'is-invisible'} has-background-dark`}></span>
                                                    </div>
                                                    <Calendar.Day class={`is-justify-content-center is-align-items-center is-size-6 date-cell has-text-black-ter ${date.month === month.value.month ? 'has-text-weight-bold' : 'has-text-grey-light'}`}>
                                                        {date.day}
                                                    </Calendar.Day>
                                                </Calendar.Cell>
                                            {:else}
                                                <Calendar.Cell {date} month={month.value} class="column has-text-centered" style="border-radius:35%;">
                                                    <div class="container is-flex is-justify-content-center is-align-items-center dot-cell">
                                                        <span class={`dot ${isSaved(date) ? 'is-visible' : 'is-invisible'} has-background-white`}></span>
                                                    </div>
                                                    <Calendar.Day class={`is-justify-content-center is-align-items-center is-size-6 date-cell ${date.month === month.value.month ? 'has-text-weight-bold' : 'has-text-grey-light'}`}>                                               
                                                        {date.day}
                                                    </Calendar.Day>
                                                </Calendar.Cell>
                                            {/if}
                                        {/each}
                                    </Calendar.GridRow>
                                {/each}
                            </Calendar.GridBody>
                        </Calendar.Grid>
                    {/each}
                </div>
                <div class="card-footer" style="display:inline">
                    <div class="container">
                        <div class="container is-flex is-justify-content-space-between is-align-items-center py-2 px-5">
                            <h1 class="has-text-weight-semibold is-size-4 pb-1">Events</h1>
                            <button class="button is-small is-primary" onclick={openModal}>New</button>
                        </div>
                        {#if isModalOpen}
                            <div class="modal is-active">
                                <button class="modal-background" aria-label="close" onclick={closeModal}></button>
                                <div class="modal-card" style="width: 350px;">
                                    <header class="modal-card-head p-4">
                                        <p class="modal-card-title">Create New Event</p>
                                        <button class="delete" aria-label="close" onclick={closeModal}></button>
                                    </header>
                                    <section class="modal-card-body p-4">
                                        <div class="field">
                                            <!-- svelte-ignore a11y_label_has_associated_control -->
                                            <label class="label">Title</label>
                                            <div class="control">
                                                <input class="input" type="text" placeholder="Awesome Day" bind:value={placeholderEventTitle}>
                                            </div>
                                        </div>
                                        <div class="field">
                                            <!-- svelte-ignore a11y_label_has_associated_control -->
                                            <label class="label">Details ({placeholderEventDetails.length}/50)</label>
                                            <div class="control">
                                                <input class="input" type="text" maxlength="50" bind:value={placeholderEventDetails} placeholder="We are eating lots of cheese">
                                            </div>
                                        </div>
                                        <div class="field">
                                            <!-- svelte-ignore a11y_label_has_associated_control -->
                                            <label class="label">Date</label>
                                            <div class="control">
                                                <input class="input" type="date" bind:value={placeholderEventDate}>
                                            </div>
                                        </div>
                                    </section>
                                    <footer class="modal-card-foot p-4">
                                        <div class="buttons">
                                            <button class="button is-success" onclick={addSavedDate}>Save Event</button>
                                            <button class="button" onclick={closeModal}>Cancel</button>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        {/if}
                    </div>
                    <div class="saved-dates container">
                        {#each saved_dates as saved_date, i (i)}
                            <div class="date container pb-3">
                                <div class="container is-flex is-justify-content-space-between is-align-items-center px-5">
                                    <h1 class="has-text-weight-semibold is-size-5">{saved_date["title"]}</h1>
                                    <div class="is-flex is-justify-content-flex-end is-align-items-center pt-1">
                                        <h1 class="has-text-weight-semibold is-size-6 pr-2 pb-1">{saved_date["date"]}</h1>
                                        <button class="button is-small" onclick={() => deleteEvent(saved_date["id"])}><Trash>Delete</Trash></button>
                                    </div>
                                </div>
                                <div class="container px-5">{saved_date["details"]}</div>
                                
                            </div>
                        {/each}
                    </div>
                </div>
            {/snippet}
        </Calendar.Root>
    </div>
</main>
