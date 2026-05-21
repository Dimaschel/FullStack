# Лабораторная работа N6. Контейнеризация и автоматизация развертывания

## 1. Архитектура контейнеризации

Проект состоит из следующих сервисов:

- `reverse-proxy` - Nginx, единая точка входа на `http://localhost`, маршрутизирует frontend и backend.
- `frontend` - React/Vite-приложение, собирается в статические файлы и отдается через Nginx.
- `backend` - Spring Boot API приложения. В исходном задании указан FastAPI, но текущий проект реализован на Java/Spring Boot, поэтому контейнеризация выполнена для фактического backend.
- `postgres` - основная БД приложения.
- `minio` - S3-совместимое хранилище вложений расписаний.
- `minio-init` - одноразовый вспомогательный контейнер для создания bucket.

Сетевая схема:

- `app-network`: `reverse-proxy`, `frontend`, `backend`.
- `data-network`: `backend`, `postgres`, `minio`, `minio-init`.
- База данных и MinIO не публикуются наружу в основном compose-файле. Для локальной отладки порты вынесены в `docker-compose.override.yml`.

## 2. Контейнеризация компонентов

Подготовлены файлы:

- `Dockerfile` - runtime-образ backend на Java 17. JAR предварительно собирается Maven-командой и затем копируется в образ.
- `src/main/resources/static/Dockerfile` - сборка frontend через `npm ci` и отдача build через Nginx.
- `docker/nginx/default.conf` - reverse proxy, health endpoint и маршрутизация API.
- `.dockerignore` - исключение `node_modules`, `target`, build-артефактов, логов и `.env`.

Frontend в контейнере использует относительный `VITE_API_BASE_URL`, поэтому браузер обращается к API через тот же домен, а Nginx проксирует запросы в `backend`.

## 3. Оркестрация через Docker Compose

Запуск всего окружения:

```bash
cp .env.example .env
./mvnw test package
docker compose up -d --build
```

Ключевые настройки:

- `reverse-proxy` публикует порт `80`.
- `docker-compose.override.yml` публикует отладочные порты `8080`, `5441`, `9100`, `9101` для локальной разработки.
- `postgres_data` и `minio_data` сохраняют состояние БД и файлов.
- `depends_on.condition` учитывает готовность `postgres`, `minio` и `backend`.
- Healthcheck настроен для `reverse-proxy`, `frontend`, `backend`, `postgres`, `minio`.

Проверка:

```bash
docker compose ps
curl http://localhost/health
curl http://localhost/main/health-check
```

## 4. Безопасная конфигурация

Конфигурация вынесена в переменные окружения:

- параметры PostgreSQL;
- JWT secret и время жизни токенов;
- параметры S3/MinIO;
- базовый URL приложения;
- параметры внешнего weather API.

Файл `.env` исключен из репозитория. В репозитории хранится только `.env.example` с шаблонными значениями.

## 5. CI/CD

Workflow `.github/workflows/container-ci.yml` выполняет:

- backend-тесты через `./mvnw test`;
- frontend-тесты и сборку через `npm test` и `npm run build`;
- проверку `docker compose config`;
- сборку Docker-образов;
- smoke-test поднятого окружения через `/health`;
- автоматическое развертывание по SSH после успешных проверок на `main`/`master`, если заданы `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` и `DEPLOY_SSH_KEY`.

## 6. Проверка устойчивости

Типовые проверки:

- падение backend: `docker compose restart backend`, после восстановления `reverse-proxy` снова проксирует API;
- падение БД: backend не стартует до готовности `postgres`;
- отсутствие bucket в MinIO: `minio-init` создает bucket при запуске;
- ошибка миграции/DDL: контейнер backend остается unhealthy, deployment не проходит smoke-test;
- ошибка внешнего weather API: параметры timeout/retry/cache управляются через env.

Итоговая команда воспроизводимого запуска:

```bash
./mvnw test package
docker compose up -d --build
```
