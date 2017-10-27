FROM node:8.8.1

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app
ENV WORK_DIR=$HOME/src/mpn

RUN npm install -g yarn@1.2.1

RUN mkdir -p $WORK_DIR/node_modules && chown -R app:app $HOME

USER app
WORKDIR $WORK_DIR
