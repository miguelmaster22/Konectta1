FROM node:22.16.0-alpine
WORKDIR /app

COPY . .
RUN npm run install:all && npm run build

CMD ["npm", "start"]
