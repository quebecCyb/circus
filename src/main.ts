import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as exphbs from 'express-handlebars';
import { join } from 'path';
import { CustomExceptionFilter } from './exceptions/handler';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true
  });

  const helpers = {
    hlp: (echo) => `Echo: ${echo}.`,
    json: (text) => JSON.stringify(text),
    upper: (text) => `${text}`.toUpperCase(),
    lower: (text) => `${text}`.toLowerCase(),
    // link: link_,
    logo: (text) => `${text}`.toLowerCase().replace(/ /g, '-'),
    // lang_insert: (url, lang) => getLangUrl(url, lang),
    eq: (s1, s2) => s1 === s2
  };

  const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'views', 'layouts'),
    partialsDir  : [
      join(__dirname, '..', 'views', 'incs'),
    ],
    helpers,
  });

  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.engine('handlebars', hbs.engine);
  app.setViewEngine('handlebars');

  // Регистрируем кастомный фильтр
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(process.env.PORT, process.env.IP);
}
bootstrap();
