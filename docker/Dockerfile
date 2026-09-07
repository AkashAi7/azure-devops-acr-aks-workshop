ARG BASE_IMAGE=mcr.microsoft.com/azurelinux/base/nodejs:20
FROM ${BASE_IMAGE}

WORKDIR /app
COPY app/package.json ./package.json
COPY app/src ./src

EXPOSE 8080

CMD ["npm", "start"]