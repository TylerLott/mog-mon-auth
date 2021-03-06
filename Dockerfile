FROM node:16.3.0
ENV NODE_ENV=production
WORKDIR /auth-server
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production
COPY . .
CMD ["yarn", "start-production"]