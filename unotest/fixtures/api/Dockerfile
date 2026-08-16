# fixtures.unotest.com — образ HTTP-фикстуры dogfood-набора.
#
# Зависимостей у server.mjs нет (только node:http и node:crypto),
# поэтому здесь нет ни install, ни сборки: копируем файл и запускаем.
# Если однажды появится dependency — это повод остановиться и подумать,
# а не добавлять сюда `npm i`: фикстура обязана стартовать на голом Node.
#
# Контекст сборки — этот каталог (см. .github/workflows/deploy.yml).
FROM node:22-alpine

WORKDIR /app
COPY server.mjs package.json ./

# uid 1000 = пользователь node из базового образа; тот же uid стоит в
# securityContext деплоя (gitops/apps/fixtures/deployment.yaml).
USER 1000

# Состояние живёт в памяти, на диск сервис не пишет ничего —
# поэтому в кластере он крутится с readOnlyRootFilesystem.
ENV HOST=0.0.0.0 PORT=8787
EXPOSE 8787

CMD ["node", "server.mjs"]
