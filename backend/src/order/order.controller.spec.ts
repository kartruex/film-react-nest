import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: { createOrder: jest.Mock };

  beforeEach(async () => {
    service = { createOrder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: service }],
    }).compile();

    controller = module.get(OrderController);
  });

  describe('create', () => {
    const dto: CreateOrderDto = {
      email: 'user@example.com',
      phone: '+79990001122',
      tickets: [
        {
          film: 'film-id',
          session: 'session-id',
          daytime: '2026-01-01T10:00:00.000Z',
          row: 1,
          seat: 1,
          price: 500,
        },
      ],
    };

    it('передаёт dto в service.createOrder и возвращает его результат', async () => {
      const response: OrderResponseDto = {
        total: 1,
        items: [{ ...dto.tickets[0], id: 'ticket-id' }],
      };
      service.createOrder.mockResolvedValue(response);

      const result = await controller.create(dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(result).toBe(response);
    });

    it('пробрасывает ошибку сервиса (например BadRequestException) наверх', async () => {
      const error = new Error('места уже заняты');
      service.createOrder.mockRejectedValue(error);

      await expect(controller.create(dto)).rejects.toThrow(error);
    });
  });
});
