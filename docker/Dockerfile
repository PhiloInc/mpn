FROM node:10.13.0

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app
ENV WORK_DIR=$HOME/src/mpn

RUN mkdir -p $WORK_DIR/node_modules && chown -R app:app $HOME

USER app
WORKDIR $WORK_DIR
