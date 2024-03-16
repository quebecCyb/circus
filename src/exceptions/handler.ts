// Импортируем необходимые модули из NestJS
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { IRequest } from 'src/interfaces/IRequest';

// Создаем кастомный фильтр для обработки исключений
@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  // Метод для обработки исключений
  catch(exception: HttpException, host: ArgumentsHost) {
    // Получаем объект ответа из контекста
    const request: IRequest = host.switchToHttp().getRequest<IRequest>();
    const response = host.switchToHttp().getResponse<Response>();
    
    // Получаем статус код ошибки
    const status = exception.getStatus();

    // Опционально можно получить другую информацию об ошибке
    const message = exception.message || 'Internal Server Error';

    // Отправляем ответ с HTML-шаблоном
    response.status(status).send({});
  }
}
