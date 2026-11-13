# Entregable S05 — Configuración, Verificación y Migración Ejecutada

| Campo | Valor |
|---|---|
| Proyecto | Constructora Cimientos (app React Native + API `server/`) |
| Equipo | _completar_ |
| Versión del software | 1.0.0 |
| Fecha | _completar_ |

---

## 6.1 Inventario de configuración

| Variable | ¿Secreto? | Desarrollo | Servidor | Nube | Si falta… |
|---|:---:|---|---|---|---|
| `DATABASE_URL` | Sí | `.env` local | `/opt/constructora/.env` (permisos 600) | Panel del proveedor (Neon / Render) | La API no arranca: mensaje claro y código de salida 1 |
| `POSTGRES_PASSWORD` | Sí | `.env` local | `/opt/constructora/.env` (600) | No aplica (la gestiona el proveedor) | `docker compose` se detiene con "Define POSTGRES_PASSWORD" |
| `POSTGRES_USER` | No | `.env` local | `.env` (600) | No aplica | `docker compose` se detiene con mensaje |
| `POSTGRES_DB` | No | `.env` local | `.env` (600) | No aplica | `docker compose` se detiene con mensaje |
| `DB_SSL` | No | `false` | `false` | `true` | Asume `false`; la nube rechaza la conexión |
| `PORT` | No | `8000` | `8000` | Lo asigna el proveedor | Asume `8000`; si no es válido, no arranca |
| `APP_VERSION` | No | `dev` | `1.0.0` | `1.0.0` | Asume `dev`; la prueba de humo lo marca como fallo |
| `NUBE_URL` | Sí | No aplica | Solo en la terminal durante la migración | No aplica | `scripts/migrar.sh` se detiene |

## 6.2 Servicios

| Servicio | Imagen / versión | Depende de | Política de reinicio | Healthcheck | Rotación de logs |
|---|---|---|---|---|---|
| `db` | `postgres:17-alpine` | — | `unless-stopped` | `pg_isready` cada 5 s | 3 × 10 MB |
| `api` | `constructora-api:1.0.0` | `db` (`service_healthy`) | `unless-stopped` | `/api/health` cada 10 s | 3 × 10 MB |

Definidos en `deploy/compose.prod.yaml`.

## 6.3 Endpoint de salud

| Campo | Valor |
|---|---|
| Ruta | `GET /api/health` |
| Dependencias que verifica | Solo PostgreSQL (`SELECT 1`). Es la única dependencia crítica |
| Respuesta si está sano | `200` `{"status":"ok","db":"ok","version":"1.0.0"}` |
| Respuesta si falla una dependencia | `503` `{"status":"degradado","db":"no disponible"}` (sin cadenas de conexión ni detalles internos) |

## 6.4 Pruebas

### Prueba de humo (`scripts/smoke-test.sh [URL]`)

| # | Verificación | Resultado esperado |
|---|---|---|
| 1 | `GET /api/health` | 200 |
| 2 | Content-Type de `/api/health` (propia) | `application/json` |
| 3 | `/api/version` distinta de `dev` (propia) | Versión real desplegada |
| 4 | `GET /api/materiales` | Arreglo JSON con datos |
| 5 | `POST /api/materiales` válido | 201 |
| 6 | Mismo `POST` repetido / `POST` inválido | 409 / 422 |
| 7 | `DELETE` del material de prueba | 200 (no deja basura) |

Salida contra el servidor y contra la nube:

```
<!-- PENDIENTE: pega aquí la salida real de ejecutar el script en tu servidor y en la nube -->
```

### Casos funcionales

| ID | Caso | Pasos | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| F-01 | Crear material válido | `POST /api/materiales` con todos los campos | 201 y aparece en el listado | |
| F-02 | Id duplicado | Repetir el mismo `POST` | 409 "ya existe un material con ese id" | |
| F-03 | Datos inválidos | `POST` sin `nombre` o con categoría inexistente | 422, no se inserta | |
| F-04 | Persistencia tras reinicio | `docker compose restart api` y listar | Los materiales siguen | |
| F-05 | Datos iniciales | Listar obras y materiales tras la primera migración | 5 obras y 12 materiales | |
| F-06 | Base caída | `docker compose stop db` y consultar `/api/health` | 503; `api` queda `unhealthy` y no se reinicia sola | |
| F-07 | Configuración faltante | Iniciar la API sin `DATABASE_URL` | Mensaje claro y código de salida 1 | |

## 6.5 Lista de verificación posterior al despliegue

- [ ] Todos los servicios `healthy` (`docker compose ps`)
- [ ] `bash scripts/smoke-test.sh <URL pública>` en verde
- [ ] `/api/version` coincide con la versión desplegada
- [ ] Sin errores nuevos en `docker compose logs --since 10m`
- [ ] HTTPS válido en el proxy inverso (certificado vigente, redirección desde HTTP)
- [ ] Casos funcionales F-01 a F-07 ejecutados
- [ ] Resultado registrado (fecha, versión, quién, resultado)

---

## 2.8 Evidencia de migración ejecutada

> ⚠️ **Esta sección debes completarla tú.** Requiere ejecutar la migración con tus propias bases
> (Docker en tu equipo y tu cuenta de Neon/Supabase). No inventes datos: sin las huellas de origen
> y destino, la rúbrica limita CE-3 a 20/45.

| Campo | Valor |
|---|---|
| Origen (tipo y versión) | PostgreSQL 17 (`postgres:17-alpine`, contenedor `db`) |
| Destino (proveedor, versión, región) | _completar_ |
| Diferencias resueltas (dueño, versión, SSL…) | _completar_ (esperado: `--no-owner --no-acl`, `sslmode=require`, `DB_SSL=true`) |

Registro de la ventana:

| Paso | Hora inicio | Hora fin | Resultado |
|---|---|---|---|
| Congelar | | | |
| Volcado | | | |
| Restauración | | | |
| Validación | | | |
| Corte | | | |
| Verificación | | | |

Huellas:

```
<!-- pega huella-origen.txt y huella-destino.txt -->
```

Prueba de humo después del corte:

```
<!-- pega aquí -->
```

¿Fue necesario el rollback? ¿Por qué?
