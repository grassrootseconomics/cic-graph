# cic-graph

![GitHub release (latest by date)](https://img.shields.io/github/v/tag/grassrootseconomics/cic-graph)

> CIC Graph

Central CIC Stack Postgres store specifically for indexing:

- Transactional data from the chain
- Custodial user data (PII, custodial client data)
- Voucher data (backers, certifications, e.t.c.)
- Marketplace data (proposed)

Relationships, check constraints and referential integrity are built in at the Postgres level. However, CIC Graph is meant to be complemented by secondary backend services to provide CRUD and any other important functionality around it.

**Prerequisites**

- Docker and Docker Compose (latest)
- [tern](https://github.com/jackc/tern)

### Adding a new table

1. Bring up the containers in `dev` with `docker-compose up -d`.
2. In the `migrations` folder, run `tern new $MIGRATION_NAME` and write the migration file.
3. Git commit.

## License

[AGPL-3.0](LICENSE).
