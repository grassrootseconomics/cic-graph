## Setup

- Inside the `dev` folder, run `docker-compose up -d`
- Inside the migrations folder, run `tern migrate` (https://github.com/jackc/tern/releases/tag/v2.0.1).
- Visit `http://localhost:8080` > `Data` > `Connect DB` > Display name: cic_graph > Connect Via Environment Variable -> PG_DATABASE_URL
- Go to `Settings` > `Metadata Actions` > `Import metada` and choose the latest file in the `hasura folder`

