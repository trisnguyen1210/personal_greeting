# pre-build stage-------------------------------
FROM node:18-alpine3.14 as pre-build

# ARG APP_PROXY=protocol://proxy_host:port
ARG APP_PROXY=http://proxy.fpt.vn:80
# ENV http_proxy http://proxy.fpt.vn:80
# ENV https_proxy http://proxy.fpt.vn:80
ENV http_proxy ${APP_PROXY}
ENV https_proxy ${APP_PROXY}

WORKDIR /app
RUN npm i -g pnpm
COPY ./package.json .
COPY ./pnpm-lock.yaml .

# compile stage---------------------------------
FROM pre-build as compile

RUN pnpm i
COPY ./tsconfig.json .
COPY ./src .
# COPY . .
RUN pnpm build

# bootstrap stage-------------------------------
FROM pre-build as bootstrap

RUN mkdir /app/temp
RUN apk add curl fprobe ffmpeg
COPY --from=compile /app/dist ./dist
COPY --from=compile /app/node_modules ./node_modules
RUN pnpm i --production
COPY ./.env .

EXPOSE 4444

CMD ["pnpm", "start"]
