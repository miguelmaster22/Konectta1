# --- Etapa 1: construir el frontend ---
    FROM node:23-slim AS builder
    WORKDIR /app
    
    # Copiar e instalar frontend
    COPY client ./client
    WORKDIR /app/client
    RUN npm install && npm run build
    
    # --- Etapa 2: configurar el backend y servir el frontend ---
    FROM node:23-slim
    WORKDIR /app
    
    # Copiar backend
    COPY server ./server
    WORKDIR /app/server
    RUN npm install
    
    # Copiar build del frontend
    COPY --from=builder /app/client/docs ./public
    
    # Exponer puerto y lanzar servidor
    EXPOSE 3000
    CMD ["node", "index.js"]
    