FROM node:23-slim
WORKDIR /app

COPY . .
WORKDIR /app
RUN npm install && npm run build

EXPOSE 3001
CMD ["npm", "start"]
