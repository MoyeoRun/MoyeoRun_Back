FROM node:16-alpine

WORKDIR /app
COPY . .

RUN npm i

RUN chmod +x ./entrypoint.dev.sh

EXPOSE 4000
CMD ["npm", "run", "start:dev"]