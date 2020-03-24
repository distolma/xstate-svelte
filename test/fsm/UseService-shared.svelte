<script>
  import UseService from './UseService.svelte';

  export let service;

</script>

<div>
  <UseService {service}></UseService>
  <UseService {service}></UseService>
</div>
