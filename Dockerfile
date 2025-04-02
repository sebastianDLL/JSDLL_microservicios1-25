FROM debian:latest

RUN apt-get update &&\
    apt-get install -y toilet &&\
    apt-get clean -y

ENV MSG="Hello World!"

CMD /usr/bin/toilet $MSG