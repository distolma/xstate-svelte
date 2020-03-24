<script>
  import { useMachine } from '../src';

  const onFetch = () => new Promise(res => setTimeout(() => res('some data'), 50));

  export let persistedState;
  export let fetchMachine;

  const { send, state } = useMachine(fetchMachine, {
    services: {
      fetchData: onFetch
    },
    state: persistedState
  });

</script>

<div>
  { #if $state.matches('idle') }
    <button on:click={() => send('FETCH')}>Fetch</button>
  { :else if $state.matches('loading') }
    <div>Loading...</div>
  { :else if $state.matches('success') }
    <div>
      Success! Data:
      <div data-testid="data">{$state.context.data}</div>
    </div>
  { /if }
</div>
