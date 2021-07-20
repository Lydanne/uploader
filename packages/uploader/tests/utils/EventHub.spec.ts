import {EventHub} from "../../src/utils/EventHub";

describe('EventHub.ts', () => {
  it('emit event', () => {
    type Events = 'test'
    const onFn = jest.fn()
    const eventHub = new EventHub<Events>()
    eventHub.on('test', onFn)
    expect(eventHub.events().has('test')).toBeTruthy()

    eventHub.emit('test', 1)
    expect(onFn).toBeCalled()
    expect(onFn).toBeCalledWith(1)

    eventHub.off('test', onFn)
    expect(eventHub.events().get('test').size).toBe(0)
    
    eventHub.remove('test')
    expect(eventHub.events().has('test')).toBeFalsy()
  });

  it('emit async event', async () => {
    type Events = 'test'
    const onFn = jest.fn()
    const eventHub = new EventHub<Events>()
    eventHub.on('test', onFn)
    expect(eventHub.events().has('test')).toBeTruthy()

    eventHub.asyncEmit('test', 1)
    expect(onFn).toBeCalledTimes(0)
    await Promise.resolve()
    expect(onFn).toBeCalledTimes(1)
    expect(onFn).toBeCalledWith(1)
  });
});