FROM node:14-alpine AS builder
WORKDIR /app
COPY . .

#RUN apk update && \
#    apk upgrade && \
#    apk add --no-cache --virtual build-dependencies bash git openssh python make g++ && \
#    yarn --no-cache || \
#    apk del build-dependencies && \
#    yarn cache clean

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g

ENV GENERATE_SOURCEMAP=false
ENV GITLAB_TOKEN="-RT_ZkTikTHxKgUVmEzc"
RUN echo $GITLAB_TOKEN

RUN npm config set -- '//gitlab.com/api/v4/projects/31463066/packages/npm/:_authToken' $GITLAB_TOKEN
RUN npm config set @likelib:registry https://gitlab.com/api/v4/projects/31463066/packages/npm/

RUN yarn install && yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/build .

RUN rm /etc/nginx/conf.d/*.conf

COPY ./default.conf /etc/nginx/conf.d
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
