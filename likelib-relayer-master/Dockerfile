FROM node:14

WORKDIR /app

COPY . .

RUN yarn install && yarn build

EXPOSE 3000
CMD [ "yarn", "start:service:sra_http"]