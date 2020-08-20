import { render, waitFor } from '@testing-library/svelte';
import { createMachine, assign, interpret } from '@xstate/fsm';
import UseServiceShared from './UseService-shared.svelte';

describe('useService function', () => {
  const counterMachine = createMachine<{ count: number }>({
    id: 'counter',
    initial: 'active',
    context: { count: 0 },
    states: {
      active: {
        on: {
          INC: { actions: assign({ count: ctx => ctx.count + 1 }) },
          SOMETHING: { actions: 'doSomething' }
        }
      }
    }
  });

  it('should share a single service instance', async () => {
    const counterService = interpret(counterMachine).start();

    const { getAllByTestId } = render(UseServiceShared, { service: counterService })
    const countEls = getAllByTestId('count');

    expect(countEls.length).toBe(2);

    countEls.forEach(countEl => expect(countEl.textContent).toBe('0'));

    counterService.send('INC');

    await waitFor(() => {
      countEls.forEach(countEl => expect(countEl.textContent).toBe('1'));
    });
  })
})
