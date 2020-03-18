import { readable, Readable } from 'svelte/store'
import {
  StateMachine,
  EventObject,
  Typestate,
  interpret,
  createMachine
} from '@xstate/fsm';

type XStateSvelteResponse<
  TContext extends object,
  TEvent extends EventObject,
  TState extends Typestate<TContext> = any
> = {
  state: Readable<StateMachine.State<TContext, TEvent, TState>>;
  send: StateMachine.Service<TContext, TEvent>['send'];
  service: StateMachine.Service<TContext, TEvent>;
}

const getServiceValue = <
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = any
>(
  service: StateMachine.Service<TContext, TEvent, TState>
): StateMachine.State<TContext, TEvent, TState> => {
  let currentValue: StateMachine.State<TContext, TEvent, TState>;
  service
    .subscribe(state => {
      currentValue = state;
    })
    .unsubscribe();
  return currentValue!;
};

export function useMachine<
  TContext extends object,
  TEvent extends EventObject,
  TState extends Typestate<TContext> = any
>(
  stateMachine: StateMachine.Machine<TContext, TEvent, TState>,
  options?: {
    actions?: StateMachine.ActionMap<TContext, TEvent>;
  }
): XStateSvelteResponse<TContext, TEvent, TState> {
  const service = interpret(
    createMachine(
      stateMachine.config,
      options ? options : (stateMachine as any)._options
    )
  ).start();

  const state = readable(getServiceValue(service), setState => {
    service.subscribe(setState);

    return (): void => {
      service.stop()
    }
  })

  return { state, send: service.send, service }
}

export function useService<
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = any
>(
  service: StateMachine.Service<TContext, TEvent, TState>
): XStateSvelteResponse<TContext, TEvent, TState> {
  const state = readable(getServiceValue(service), setState => {
    const { unsubscribe } = service.subscribe(currentState => {
      if (currentState.changed !== false) {
        setState(currentState)
      }
    })

    return (): void => unsubscribe()
  })

  return { state, send: service.send, service }
}
