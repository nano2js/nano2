import Context from '../Context';
import { createService } from '../ServiceFactory';

const action = 'test-action';
const params = { a: 1, b: 2 };
const emptyParams = {};
const emptyMeta = {};
const service = createService({ name: 'test' });

describe('Context', () => {

  it('should throw if action is not provided', () => {
    expect(() => new Context(service, null)).toThrow(TypeError);
  });

  it('should have all interface methods and properties', () => {
    const context = new Context(service, action);
    expect(context.service).toBeDefined();
    expect(context.action).toBeDefined();
    expect(context.instanceId).toBeDefined();
    expect(context.fromInstanceId).toBeDefined();
    expect(context.timestamp).toBeDefined();
    expect(context.requestId).toBeDefined();
    expect(context.correlationId).toBeDefined();
    expect(context.from).toBeDefined();
    expect(context.params).toBeDefined();
    expect(context.meta).toBeDefined();
    expect(context.call).toBeDefined();
    expect(context.toJSON).toBeDefined();
  });

  it('should create with defaults', () => {
    const context = new Context(service, action);
    expect(context.action).toBe(action);
    expect(context.params).toEqual({});
    expect(context.meta).toEqual({});
    expect(context.timestamp).toBeGreaterThan(0);
    expect(typeof context.requestId).toBe('string');
    expect(context.correlationId).toBeNull();
    expect(context.from).toBe(service.name);
  });

  it('should create with given action', () => {
    const context = new Context(service, action);
    expect(context.action).toBe(action);
  });

  it('should create with given params', () => {
    const context = new Context(service, action, params);
    expect(context.params).toBe(params);
  });

  it('should create with given meta', () => {
    const context = new Context(service, action, params, emptyMeta);
    expect(context.meta).toBe(emptyMeta);
  });

  it('should use correlationId if passed in meta', () => {
    const context = new Context(service, action, params, {
      correlationId: '12345',
    });
    expect(context.correlationId).toBe('12345');
  });

  it('should use from if passed in meta', () => {
    const context = new Context(service, action, params, {
      from: 'some.service',
    });
    expect(context.from).toBe('some.service');
  });

  describe('call', () => {
    it('should call service run', async () => {
      expect.assertions(1);
      const context = new Context(service, action, params, {
        from: 'some.service',
      });
      service.call = jest.fn();
      await context.call('test.action');
      expect(service.call).toHaveBeenCalledTimes(1);
    });

    it('should pass meta data to child calls', async () => {
      expect.assertions(1);
      const context = new Context(service, action, params, {
        from: 'some.service',
      });
      service.call = jest.fn();
      await context.call('test.action');
      expect((<any>service.call).mock.calls[0][2]).toEqual({
        correlationId: context.requestId,
        from: service.name,
        fromInstanceId: service.id,
        level: 2,
      });
    });
  });

  describe('toJSON', () => {
    it('should pass meta data to child calls', async () => {
      expect.assertions(1);
      const meta = {
        from: 'some.service',
        fromInstanceId: 'test1234',
      };
      const context = new Context(service, action, params, meta);
      expect(context.toJSON()).toEqual({
        action,
        params,
        meta,
        instanceId: service.id,
        fromInstanceId: 'test1234',
        service: service.name,
        timestamp: context.timestamp,
        requestId: context.requestId,
        correlationId: null,
        from: 'some.service',
        level: 1,
      });
    });
  });
});
