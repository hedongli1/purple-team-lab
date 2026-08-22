FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
COPY data ./data
ENV NODE_ENV=production PORT=3100
EXPOSE 3100
CMD ["node", "src/index.js"]