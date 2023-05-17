FROM node:18-bullseye

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

RUN git config --global --add safe.directory /code
