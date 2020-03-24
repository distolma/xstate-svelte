import { render, fireEvent } from '@testing-library/svelte';
import { Machine, assign, doneInvoke, Interpreter } from 'xstate';
import UseMachine from './UseMachine.svelte';
import { useMachine } from '../src';

describe('useMachine function', () => {
  const fetchMachine = Machine<any>({
    id: 'fetch',
    initial: 'idle',
    context:  {
      data: undefined
    },
    states: {
      idle: {
        on: { FETCH: 'loading' }
      },
      loading: {
        invoke: {
          src: 'fetchData',
          onDone: {
            target: 'success',
            actions: assign({
              data: (_, e) => e.data
            }),
            cond: (_, e): any => e.data.length
          }
        }
      },
      success: {
        type: 'final'
      }
    }
  });
  const persistedFetchState = fetchMachine.transition(
    'loading',
    doneInvoke('fetchData', 'persisted data')
  );

  it('should work with a component', async () => {
    const { getByText, getByTestId, findByText } = render(UseMachine, { persistedState: null, fetchMachine });
    const button = getByText('Fetch');
    fireEvent.click(button);
    await findByText('Loading...');
    await findByText(/Success/);
    const dataEl = getByTestId('data');
    expect(dataEl.textContent).toBe('some data');
  })

  it('should work with a component with rehydrated state', async () => {
    const { getByTestId, findByText } = render(UseMachine, {
      persistedState: persistedFetchState,
      fetchMachine,
    });
    await findByText(/Success/);
    const dataEl = getByTestId('data');
    expect(dataEl.textContent).toBe('persisted data');
  });

  it('should work with a component with rehydrated state config', async () => {
    const persistedFetchStateConfig = JSON.parse(
      JSON.stringify(persistedFetchState)
    );
    const { getByTestId, findByText } = render(UseMachine, {
      persistedState: persistedFetchStateConfig,
      fetchMachine,
    });
    await findByText(/Success/);
    const dataEl = getByTestId('data');
    expect(dataEl.textContent).toBe('persisted data');
  });

  it('should provide the service', () => {
    const { service } = useMachine(fetchMachine)
    expect(service).toBeInstanceOf(Interpreter)
  })

  it('should provide options for the service', () => {
    const { service } = useMachine(fetchMachine, {
      execute: false
    })
    expect(service.options.execute).toBe(false)
  })

  it('should merge machine context with options.context', (done) => {
    const testMachine = Machine<{ foo: string; test: boolean }>({
      context: {
        foo: 'bar',
        test: false
      },
      initial: 'idle',
      states: {
        idle: {}
      }
    });

    const { state } = useMachine(testMachine, { context: { test: true } });

    state.subscribe(data => {
      expect(data.context).toEqual({
        foo: 'bar',
        test: true
      });
      done()
    })
  })
})
