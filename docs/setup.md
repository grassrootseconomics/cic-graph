## Setup

1. Change any Docker settings e.g. ports then run `docker-compose up -d` in the `dev` folder
2. Update `tern.conf` with the correct host/port then run `tern migrate` in the `migrations` folder. Alternatively you can use any migration tool that supports plain SQL.
3. Visit the Hasura Console UI > Settings > Metadata Actions > Import Metadata > Choose latest file in the `hasura` folder