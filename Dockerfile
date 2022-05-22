FROM node:14-alpine

ARG NODE_ENV="production"
ARG UID=1000
ARG GID=1000

ARG APP_NAME=""
ARG DEST_DIR="/home/node"

ARG GITLAB_USER=""
ARG GITLAB_PASS=""

ENV NODE_ENV=${NODE_ENV}
ENV HOST=0.0.0.0
ENV PORT=3000

# Установка AdonisJS глобально и общих компонентов
RUN apk add --no-cache curl gettext git \
    && npm i -g pm2 @adonisjs/cli

USER ${UID}
WORKDIR ${DEST_DIR}

# Установка зависимостей текущего проекта
COPY --chown=${UID}:${GID} package*.json ./
RUN if [ -n "${GITLAB_USER}" ] ; \
        then (printf "machine gitlab.com\n\tlogin ${GITLAB_USER}\n\tpassword ${GITLAB_PASS}\n\n" | tee ${HOME}/.netrc) ; \
    fi \
    && npm ci \
    && if [ -f "${HOME}/.netrc" ] ; then rm -v ${HOME}/.netrc ; fi

# Копирование файлов проекта в контейнер
COPY --chown=${UID}:${GID} . .
RUN if [ ! -f ".env" ] ; \
        then export $(adonis key:generate --echo) ; \
        (envsubst '${APP_NAME},${APP_KEY}' < .env.example > .env) ; \
    fi

CMD pm2-docker start server.js
EXPOSE 3000/tcp

# HEALTHCHECK --interval=20s --timeout=20s --retries=2 \
#     CMD curl -m 10 http://localhost:${PORT}/health || (kill -s 15 -1 && (sleep 10 && kill -s 9 -1))
