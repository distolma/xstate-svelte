import { readable, Readable } from 'svelte/store'
import {
  EventObject,
  Typestate,
  StateMachine,
  InterpreterOptions,
  MachineOptions,
  StateConfig,
  State,
  interpret,
  Interpreter,
} from 'xstate'

interface UseMachineOptions<TContext, TEvent extends EventObject> {
/**
 * If provided, will be merged with machine's `context`.
 */
context?: Partial<TContext>;
/**
 * The state to rehydrate the machine to. The machine will
 * start at this state instead of its `initialState`.
 */
state?: StateConfig<TContext, TEvent>;
}

type XStateSvelteOptions<
  TContext,
  TEvent extends EventObject
> = Partial<InterpreterOptions> &
  Partial<UseMachineOptions<TContext, TEvent>> &
  Partial<MachineOptions<TContext, TEvent>>

type XStateSvelteResponse<
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = any
> = {
  state: Readable<State<TContext, TEvent, any, TTypestate>>;
  send: Interpreter<TContext, any, TEvent, TTypestate>['send'];
  service: Interpreter<TContext, any, TEvent, TTypestate>;
}

export function useMachine<
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = any
>(
  machine: StateMachine<TContext, any, TEvent, TTypestate>,
  options: XStateSvelteOptions<TContext, TEvent> = {}
): XStateSvelteResponse<TContext, TEvent, TTypestate> {
  const {
    context,
    guards,
    actions,
    activities,
    services,
    delays,
    state: rehydratedState,
    ...interpreterOptions
  } = options

  const machineConfig = {
    context,
    guards,
    actions,
    activities,
    services,
    delays
  }

  const createdMachine = machine.withConfig(machineConfig, {
    ...machine.context,
    ...context
  } as TContext)

  const service = interpret(createdMachine, interpreterOptions).start(
    rehydratedState ? State.create(rehydratedState as any) : undefined
  )

  const state = readable(service.state, setState => {
    service.onTransition(currentState => {
      if (currentState.changed) {
        setState(currentState)
      }
    })

    return (): void => {
      service.stop()
    }
  })

  return { state, send: service.send, service }
}

export function useService<
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = any
>(
  service: Interpreter<TContext, any, TEvent, TTypestate>
): XStateSvelteResponse<TContext, TEvent, TTypestate> {
  const state = readable(service.state, setState => {
    const { unsubscribe } = service.subscribe(currentState => {
      if (currentState.changed !== false) {
        setState(currentState)
      }
    })

    return (): void => unsubscribe()
  })

  return { state, send: service.send, service }
}
