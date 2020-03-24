<script>
  import { useService } from '../src';

  export let service;

  const { send, state } = useService(service);
</script>

<div>
  <div data-testid="count">{$state.context.count}</div>
  <button data-testid="inc" on:click={() => send('INC')}>Increase</button>
</div>
