FROM hasura/graphql-engine:v2.20.0.cli-migrations-v3 as base

RUN curl -L https://github.com/jackc/tern/releases/download/v2.0.1/tern_2.0.1_linux_amd64.tar.gz > tern.tar.gz && \
    tar xzvf tern.tar.gz && \
    chmod +x tern && \
    mv tern /bin

WORKDIR /service

COPY migrations migrations/
COPY metadata metadata/
COPY LICENSE .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]

CMD $HGE_BINARY serve