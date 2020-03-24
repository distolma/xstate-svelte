<script>
  import { useMachine } from '../../src/fsm';

  const onFetch = () => new Promise(res => setTimeout(() => res('some data'), 50));

  export let fetchMachine;

  const { send, state } = useMachine(fetchMachine, {
    actions: {
      load: () => {
        onFetch().then(res => {
          send({ type: 'RESOLVE', data: res });
        });
      }
    }
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
