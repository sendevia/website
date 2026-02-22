FROM node:lts-alpine

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 4173

CMD ["npm", "run", "docs:preview"]
