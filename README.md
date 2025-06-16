# cic-graph




## Dev
### Docker
To run the application in a Docker container, you can use the following command:

```bash 
cd dev
docker compose up
```
### Install dependencies

```bash
pnpm install
```


### Development 

Testing new schema designs or modifications in a local development environment
```bash
pnpm drizzle-kit push
```


#### Migrations
To generate a new migration, you can use the following command:

```bash
pnpm drizzle-kit generate
```

Apply Migration
```bash
pnpm drizzle-kit migrate
```
