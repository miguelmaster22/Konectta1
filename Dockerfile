# --- Etapa 1: construir el frontend ---
    FROM node:23-slim AS builder
    WORKDIR /app
    
    # Copiar e instalar frontend
    COPY . .
    WORKDIR /app
    RUN npm install && npm run build
    
    # Exponer puerto y lanzar servidor
    EXPOSE 3001
    CMD ["npm", "start"]
    