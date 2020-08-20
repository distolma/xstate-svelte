import { render, fireEvent, waitFor } from '@testing-library/svelte';
import { Machine, assign, interpret } from 'xstate';
import UseServiceShared from './UseService-shared.svelte';
import UseService from './UseService.svelte';

describe('useService function', () => {
  const counterMachine = Machine<{ count: number }>({
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

  it('service should be updated when it changes', async () => {
    const counterService1 = interpret(counterMachine, { id: 'c1' }).start();
    const counterService2 = interpret(counterMachine, { id: 'c2' }).start();

    const { getByTestId, rerender } = render(UseService, {
      service: counterService1
    });

    const incButton = getByTestId('inc');
    let countEl = getByTestId('count');

    expect(countEl.textContent).toBe('0');
    await fireEvent.click(incButton);
    expect(countEl.textContent).toBe('1');

    rerender({ props: { service: counterService2 }});

    countEl = getByTestId('count');
    await waitFor(() => expect(countEl.textContent).toBe('0'));
  });
})
