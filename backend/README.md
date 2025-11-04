# SIS_ACAD — Backend

Backend del Sistema Académico SIS_ACAD.  
Incluye autenticación JWT, PostgreSQL y documentación Swagger.

## Índice

1. [Configuración del Entorno](#1-configuración-del-entorno)
2. [Base de Datos](#2-base-de-datos-docker-o-manual)
   - Docker Compose
   - Instalación Manual
3. [Instalación de Dependencias](#3-instalación-de-dependencias)
4. [Ejecución del Proyecto](#4-ejecución-del-proyecto)
5. [Datos Iniciales (Seeding)](#5-datos-iniciales-seeding)
6. [Documentación Swagger](#6-documentación-swagger)

---

## 1. Configuración del Entorno

Copia el archivo `.env.example` y renómbralo a `.env`.

```ini
# .env
APP_ENV=development
PORT=5000

# DB configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=unsa
DB_PASSWORD=unsa123
DB_NAME=sisacad_db

# Auth
JWT_SECRET=secret_jwt_key
```

---

## 2. Base de Datos (Docker o Manual)

### Opción A — Docker Compose (recomendado)

En la raíz del proyecto:

```bash
docker compose up -d
```
Esto levanta PostgreSQL y Adminer (puerto 8080) usando las credenciales del `.env`.

Para detener los contenedores:

```bash
docker compose down
```

Para detener los contenedores y **eliminar los volúmenes de datos** (pérdida de información en la base de datos):

```bash
docker compose down -v
```

### Opción B — Instalación manual de PostgreSQL

Enlaces útiles:

- PostgreSQL: https://www.postgresql.org/download/
- Adminer (opcional): https://www.adminer.org/

Crea la base de datos con los valores configurados en el archivo `.env`.

---

## 3. Instalación de Dependencias

```bash
pnpm install
# o
npm install
```

---

## 4. Ejecución del Proyecto

### Modo Desarrollo

```bash
pnpm dev
# o
npm run dev
```

El servidor estará disponible en:

```
http://localhost:5000
```
---

## 5. Datos Iniciales

Para llenar la base de datos con datos iniciales:

```bash
pnpm seed
# o
npm run seed
```

Los datos iniciales se encuentran en los [scripts de infraestructura](./backend/src/infraestructure/scripts)

---

## 6. Documentación Swagger

Documentación disponible en:

```
http://localhost:5000/api-docs
```

Permite explorar y probar todos los endpoints del sistema.
> **Nota:**  
> Después de obtener el token JWT mediante la petición a `/auth/login`, puedes copiarlo y pegarlo en el botón **Authorize** dentro de Swagger UI.  
> Esto permite mantener la sesión activa y probar todos los endpoints que requieren autenticación sin necesidad de enviar manualmente el token en cada solicitud.
