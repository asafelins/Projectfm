FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache make gcc g++ python3 \
    && npm install \
    && apk del make gcc g++ python3

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "start"]