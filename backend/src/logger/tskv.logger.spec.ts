import { TskvLogger } from './tskv.logger';

function parseTskv(line: string): Record<string, string> {
  const trimmed = line.replace(/\n$/, '');
  const result: Record<string, string> = {};
  for (const pair of trimmed.split('\t')) {
    const [key, ...rest] = pair.split('=');
    result[key] = rest.join('=');
  }
  return result;
}

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('пишет в stdout строку формата key=value через табуляцию, оканчивающуюся \\n', () => {
      logger.log('hello world');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      const line = stdoutSpy.mock.calls[0][0] as string;

      expect(line.endsWith('\n')).toBe(true);
      expect(line).toMatch(/^[^\t\n]+=[^\t]*(\t[^\t\n]+=[^\t]*)*\n$/);

      const fields = parseTskv(line);
      expect(fields.level).toBe('log');
      expect(fields.message).toBe('hello world');
      expect(fields.tskv_format).toBeDefined();
      expect(fields.timestamp).toBeDefined();
    });

    it('добавляет поле params, если переданы дополнительные аргументы', () => {
      logger.log('order created', { orderId: 42 });

      const fields = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(fields.params).toBe(JSON.stringify([{ orderId: 42 }]));
    });

    it('не добавляет поле params, если дополнительных аргументов нет', () => {
      logger.log('simple message');

      const fields = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(fields.params).toBeUndefined();
    });
  });

  describe('error', () => {
    it('пишет в stderr с уровнем error', () => {
      logger.error('boom');

      expect(stderrSpy).toHaveBeenCalledTimes(1);
      const fields = parseTskv(stderrSpy.mock.calls[0][0] as string);
      expect(fields.level).toBe('error');
      expect(fields.message).toBe('boom');
    });
  });

  describe('экранирование значений', () => {
    it('экранирует табуляцию и перенос строки внутри сообщения', () => {
      logger.log('line1\nline2\twith tab');

      const line = stdoutSpy.mock.calls[0][0] as string;
      // экранированные \t и \n не должны разрывать формат — ровно 4 поля (без params)
      expect(line.split('\t')).toHaveLength(4);

      const fields = parseTskv(line);
      expect(fields.message).toBe('line1\\nline2\\twith tab');
    });

    it('экранирует обратный слэш', () => {
      logger.log('path\\to\\file');

      const fields = parseTskv(stdoutSpy.mock.calls[0][0] as string);
      expect(fields.message).toBe('path\\\\to\\\\file');
    });
  });
});
