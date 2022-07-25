FROM node:18-alpine as build

RUN wget https://gobinaries.com/tj/node-prune && \
    chmod +x node-prune && \
    mv -v node-prune /usr/local/bin && \
    node-prune
    
WORKDIR /tmp/build

COPY package*.json /tmp/build/
RUN npm ci

COPY . /tmp/build/
RUN npm run build

RUN node-prune /tmp/build/node_modules

FROM node:18-alpine

EXPOSE 5000
CMD ["node", "dist/app.js"]

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /tmp/build/node_modules ./node_modules
COPY --from=build /tmp/build/dist ./dist