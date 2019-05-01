FROM node:10 AS client-builder

ARG GIT_HASH
ENV NODE_ENV production
ENV NODE_PORT 3000

WORKDIR /opt/app

ADD deployment/dashboard / ./
RUN npm install --quiet

RUN (cd client/; npm install --quiet;)
RUN (cd client/; npm run build;)
RUN rm -f client/.npmrc

USER node

EXPOSE 3000
CMD [ "npm", "start" ]
