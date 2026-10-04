import { ConsoleLogger, Injectable } from '@nestjs/common';

// Стандартный логгер Nest с цветным выводом — используется в dev-режиме без изменений.
@Injectable()
export class DevLogger extends ConsoleLogger {}
