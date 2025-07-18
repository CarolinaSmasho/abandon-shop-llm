FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install 
RUN node setup-db.js
EXPOSE 3000
CMD ["sh", "-c", "node server.js"]