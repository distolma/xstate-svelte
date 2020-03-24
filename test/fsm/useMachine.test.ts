import { render, fireEvent } from '@testing-library/svelte';
import { createMachine, assign } from '@xstate/fsm';
import UseMachine from './UseMachine.svelte';
import { useMachine } from '../../src/fsm';

describe('useMachine function with FSM', () => {
  const fetchMachine = createMachine<any, any>({
    id: 'fetch',
    initial: 'idle',
    context: {
      data: undefined,
    },
    states: {
      idle: {
        on: { FETCH: 'loading' }
      },
      loading: {
        entry: ['load'],
        on: {
          RESOLVE: {
            target: 'success',
            actions: assign({
              data: (_, e) => e.data
            })
          }
        }
      },
      success: {}
    }
  });

  it('should work with a component', async () => {
    const { getByText, getByTestId, findByText } = render(UseMachine, { fetchMachine });
    const button = getByText('Fetch');
    fireEvent.click(button);
    await findByText('Loading...');
    await findByText(/Success/);
    const dataEl = getByTestId('data');
    expect(dataEl.textContent).toBe('some data');
  })

  it('should use default options if not provided', () => {
    const { service } = useMachine(fetchMachine)
    expect((service as any)._machine._options).toEqual((fetchMachine as any)._options)
  })
})
