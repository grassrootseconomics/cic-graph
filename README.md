# cic-graph

![GitHub release (latest by date)](https://img.shields.io/github/v/tag/grassrootseconomics/cic-graph)

> CIC Graph

Central CIC Stack Postgres store specifically for indexing:

- Transactional data from the chain
- Custodial user data (PII, custodial client data)
- Voucher data (backers, certifications, e.t.c.)
- VPAs (Virtual Payment Addresses)
- Marketplace data (proposed)

Relationships, check constraints and referential integrity are built in at the Postgres level. However, CIC Graph is meant to be complemented by secondary backend services to provide CRUD and any other important functionality around it.

Primarily **Hasura** is supported as a GraphQL proxy backend infront of it. Aditionally, other 3rd party proxies such as **Supabase** and **PostgREST** are expected to work on top of the Postgres schema defined in `migrations`.

## Hasura Development

**Prerequisites**

- Docker and Docker Compose (latest)
- [tern](https://github.com/jackc/tern)
- [hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/)

Hasura expects a metadata definition consistent with the underlying Postgres schema.

For ease of testing and development, a Docker image which bakes in the migrations and metadata files is provided (`Dockerfile`). The `dev` folder also contains a docker-compose.yaml file to quickly get started.

Below is an exmaple of how to add a table and sync the git repo with the changes.

### Adding a new table

1. Bring up the containers in `dev` with `docker-compose up -d`.
2. Start the Hasura Console with `hasura console --admin-secret "admin" --endpoint http://localhost:8080`.
3. In the `migrations` folder, run `tern new $MIGRATION_NAME` and write the migration file.
4. Run the migration inside Hasura in the Data manager tab, checking "Track This", "Cascade metadata" and "This is a migration"
5. Run `hasura metadata export --admin-secret "admin" --endpoint http://localhost:8080` to sync the metadata.
7. Git commit.


## License

[AGPL-3.0](LICENSE).
