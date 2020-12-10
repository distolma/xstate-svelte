
# xstate-svelte

[![npm version](https://badge.fury.io/js/xstate-svelte.svg)](https://www.npmjs.com/package/xstate-svelte)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fdistolma%2Fxstate-svelte%2Fbadge%3Fref%3Dmaster&style=flat)](https://actions-badge.atrox.dev/distolma/xstate-svelte/goto?ref=master)


<img src="https://i.imgur.com/FshbFOv.png" alt="XState" width="150" align="right" />

[XState] is a library for creating, interpreting, and executing finite state machines and statecharts, as well as managing invocations of those machines as actors. This package created to make interactions with [XState] in [Svelte] application in an easier way.

[svelte]: https://github.com/sveltejs/svelte
[xstate]: https://github.com/davidkpiano/xstate

## Install

```sh
npm i -S xstate-svelte
```
or
```sh
yarn add xstate-svelte
```

## How to use

```html
<script>
  import { Machine } from "xstate";
  import { useMachine } from "xstate-svelte";

  const toggleMachine = Machine({
    id: "toggle",
    initial: "inactive",
    states: {
      inactive: {
        on: { TOGGLE: "active" }
      },
      active: {
        on: { TOGGLE: "inactive" }
      }
    }
  });

  const { state, send } = useMachine(toggleMachine);
</script>

<main>
  <button on:click={() => send('TOGGLE')}>
    {$state.value === 'inactive'
        ? 'Click to activate'
        : 'Active! Click to deactivate'}
  </button>
</main>
```

## API

### `useMachine(machine, options?)`

A function that interprets the given `machine` and starts a service that runs for the lifetime of the component.

**Arguments**

- `machine` - An [XState machine](https://xstate.js.org/docs/guides/machines.html).
- `options` (optional) - [Interpreter options](https://xstate.js.org/docs/guides/interpretation.html#options) OR one of the following Machine Config options: `guards`, `actions`, `activities`, `services`, `delays`, `immediate`, `context`, or `state`.

**Returns** `{ state, send, service }`:

- `state` - Represents the current state of the machine as an XState `State` object.
- `send` - A function that sends events to the running service.
- `service` - The created service.

### `useService(service)`

A function that subscribes to state changes from an existing service.

**Arguments**

- `service` - An [XState service](https://xstate.js.org/docs/guides/communication.html).

**Returns** `{ state, send, service }`:

- `state` - Represents the current state of the service as an XState `State` object.
- `send` - A function that sends events to the running service.
- `service` - The existing service.

### `useMachine(machine, options?)` with `@xstate/fsm`

A function that interprets the given finite state `machine` from [`@xstate/fsm`](https://xstate.js.org/docs/packages/xstate-fsm/) and starts a service that runs for the lifetime of the component.

This special `useMachine` hook is imported from `xstate-svelte/fsm`

**Arguments**

- `machine` - An [XState finite state machine (FSM)](https://xstate.js.org/docs/packages/xstate-fsm/).
- `options` - An optional `options` object.

**Returns**  `{ state, send, service }`:

- `state` - Represents the current state of the machine as an `@xstate/fsm` `StateMachine.State` object.
- `send` - A function that sends events to the running service.
- `service` - The created `@xstate/fsm` service.

**Example**

```html
<script>
  import { createMachine, assign } from "@xstate/fsm";
  import { useMachine } from "xstate-svelte/dist/fsm";

  const onFetch = () => new Promise(res => res("some data"));

  const fetchMachine = createMachine({
    id: "fetch",
    initial: "idle",
    context: {
      data: undefined
    },
    states: {
      idle: {
        on: { FETCH: "loading" }
      },
      loading: {
        entry: ["load"],
        on: {
          RESOLVE: {
            target: "success",
            actions: assign({
              data: (context, event) => event.data
            })
          }
        }
      },
      success: {}
    }
  });

  const { state, send } = useMachine(fetchMachine, {
    actions: {
      load: () => {
        onFetch().then(res => {
          send({ type: "RESOLVE", data: res });
        });
      }
    }
  });
</script>

<main>
  { #if $state.matches('idle') }
    <button on:click={() => send('FETCH')}>Fetch</button>
  { :else if $state.matches('loading') }
    <div>Loading...</div>
  { :else if $state.matches('success') }
    <div>
      Success! Data: {$state.context.data}
    </div>
  { /if }
</main>
```

## Configuring Machines

Existing machines can be configured by passing the machine options as the 2nd argument of `useMachine(machine, options)`.
Example: the `'fetchData'` service and `'notifySuccess'` action are both configurable:

```html
<script>
  import { createEventDispatcher } from "svelte";
  import { Machine, assign } from "xstate";
  import { useMachine } from "xstate-svelte";

  const dispatch = createEventDispatcher();

  const onFetch = () => new Promise(res => res("some data"));

  const fetchMachine = Machine({
    id: "fetch",
    initial: "idle",
    context: {
      data: undefined,
      error: undefined
    },
    states: {
      idle: {
        on: { FETCH: "loading" }
      },
      loading: {
        invoke: {
          src: "fetchData",
          onDone: {
            target: "success",
            actions: assign({
              data: (_, event) => event.data
            })
          },
          onError: {
            target: "failure",
            actions: assign({
              error: (_, event) => event.data
            })
          }
        }
      },
      success: {
        entry: "notifySuccess",
        type: "final"
      },
      failure: {
        on: {
          RETRY: "loading"
        }
      }
    }
  });

  const { state, send } = useMachine(fetchMachine, {
    actions: {
      notifySuccess: ctx => dispatch("resolve", ctx.data)
    },
    services: {
      fetchData: (_, e) => fetch(`some/api/${e.query}`).then(res => res.json())
    }
  });
</script>

<main>
  { #if $state.matches('idle') }
    <button on:click={() => send('FETCH', { query: 'something' })}>Fetch</button>
  { :else if $state.matches('loading') }
    <div>Loading...</div>
  { :else if $state.matches('success') }
    <div>
      Success! Data: {$state.context.data}
    </div>
  { :else if $state.matches('failure') }
    <p>{$state.context.error.message}</p>
    <button onClick={() => send('RETRY')}>Retry</button>
  { /if }
</main>
```

## Persisted and Rehydrated State

You can persist and rehydrate state with `useMachine(...)` via `options.state`:

```html
<script>
  import { useMachine } from "xstate-svelte";

  // Get the persisted state config object from somewhere, e.g. localStorage
  const persistedState = JSON.parse(localStorage.getItem('some-persisted-state-key'));

  const { state, send } = useMachine(someMachine, {
    state: persistedState // provide persisted state config object here
  });

  // state will initially be that persisted state, not the machine's initialState
</script>
```

## Acknowledgments

This module inspired by [`@xstate/react`](https://github.com/davidkpiano/xstate/tree/master/packages/xstate-react)
