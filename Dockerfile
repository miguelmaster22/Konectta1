FROM node:23-slim
WORKDIR /app

COPY . .
WORKDIR /app
RUN npm run install:all && npm run build

CMD ["npm", "start"]
