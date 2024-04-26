# Orders MS

## Dev

1. Clone the repository
2. Crear un archivo `.env` basado en el archivo `.env.template`
3. Create a file `.env` based on `env.template`
4. Run the command `npm run start:dev` to run the project

## PROD

Run the following command

```
docker build -f dockerfile.prod -t order-ms .
```

## If you want the latest version of the service

```
docker pull fernandoflores07081/orders-ms-prod
```
