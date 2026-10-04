import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('пишет в console.log валидный JSON с уровнем log и сообщением', () => {
      logger.log('hello world');

      expect(logSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed).toMatchObject({ level: 'log', message: 'hello world' });
    });

    it('сохраняет дополнительные параметры в поле optionalParams', () => {
      logger.log('order created', { orderId: 42 }, 'OrderService');

      const parsed = JSON.parse(logSpy.mock.calls[0][0]);
      expect(parsed.optionalParams).toEqual([{ orderId: 42 }, 'OrderService']);
    });
  });

  describe('error', () => {
    it('пишет в console.error валидный JSON с уровнем error', () => {
      logger.error('boom', 'stacktrace');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed).toMatchObject({ level: 'error', message: 'boom' });
    });
  });

  describe('warn', () => {
    it('пишет в console.warn валидный JSON с уровнем warn', () => {
      logger.warn('careful');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(warnSpy.mock.calls[0][0]);
      expect(parsed).toMatchObject({ level: 'warn', message: 'careful' });
    });
  });

  describe('formatMessage', () => {
    it('включает ISO-таймстамп в результат', () => {
      const result = logger.formatMessage('log', 'msg', []);
      const parsed = JSON.parse(result);

      expect(() => new Date(parsed.timestamp).toISOString()).not.toThrow();
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });
  });
});
