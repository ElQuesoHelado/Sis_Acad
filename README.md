# SIS_ACAD

## TODO

- Agregar campos específicos a secretary, admin
- Controllers
- Agregar paths
- De yapa algo de interactuar con BD????
- Actualizar funciones relacionadas a requerimientos(servicios)

Steps to run this project:

1. Run `npm i` command
2. Run `npm start` command

## API Testing

### Auth

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "jparedesma@unsa.edu.pe",
  "password": "jose.paredes.20024030"
}'
```

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "jparedesma@unsa.edu.pe",
  "password": "123"
}'
```

## Modelo dominio extendido

![mde](mde.png)
