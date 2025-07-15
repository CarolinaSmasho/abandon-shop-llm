FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN node setup-db.js
EXPOSE 3000
CMD ["node", "server.js"]