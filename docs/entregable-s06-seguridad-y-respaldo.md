# Entregable S06 — Seguridad, Usuarios y Plan de Respaldo Final

> **Estado:** el diseño, los scripts y la configuración están hechos y versionados en el repositorio.
> Las celdas marcadas **PENDIENTE** son evidencia que solo existe al ejecutarlo en TU servidor:
> corre `sudo bash scripts/evidencia.sh` y pega la salida. No inventes resultados.

| Campo | Valor |
|---|---|
| Proyecto | Constructora Cimientos (app React Native + API `server/`) |
| Equipo | _completar_ |
| Versión del software | 1.0.0 |
| Fecha | _completar_ |

---

## 7.1 Usuarios del sistema operativo

Se crean con `scripts/endurecer-servidor.sh` (sustituye `ana`/`luis` por las personas reales del equipo).

| Cuenta | Tipo | Persona o servicio | Grupos | Inicia sesión | `sudo` permitido |
|---|---|---|---|---|---|
| ana | Persona | Administradora | sudo, despliegue | Llave SSH | Todo, con contraseña |
| luis | Persona | Operador | despliegue | Llave SSH | Solo `/usr/local/bin/reiniciar-constructora` |
| respaldo | Servicio | cron (respaldo cifrado) | — | No (`nologin`) | Nada |
| root | Sistema | — | — | No (`PermitRootLogin no`) | — |

Archivos y carpetas sensibles:

| Ruta | Dueño:grupo | Permisos | Por qué |
|---|---|:---:|---|
| `/opt/constructora` | root:despliegue | 2770 | Solo el equipo de despliegue entra; lo nuevo hereda el grupo (setgid) |
| `/opt/constructora/.env` | root:despliegue | 640 | Secretos de la app: lo leen administradores, nadie más |
| `/etc/restic/password` | respaldo:respaldo | 600 | Contraseña de cifrado de los respaldos |
| `/var/lib/respaldo/.pgpass` | respaldo:respaldo | 600 | Clave del rol de solo lectura para `pg_dump` |
| `/var/respaldos` | respaldo:respaldo | 700 | Repositorio restic local |
| `/opt/respaldo/respaldar.sh` | root:root | 755 | El script no lo puede alterar quien lo ejecuta |

Riesgo del grupo `docker`: pertenecer a `docker` equivale a ser `root` (se puede montar `/` en un
contenedor). Por eso los operadores **no** están en `docker`: reinician la API con un único
comando permitido por `sudo`.

## 7.2 Acceso remoto y firewall

Archivo generado por `scripts/endurecer-servidor.sh`:

```
# /etc/ssh/sshd_config.d/10-endurecer.conf
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowGroups sudo despliegue
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
```

Salida de `sudo ufw status verbose` en el servidor:

```
PENDIENTE: pega aquí la salida real
```

| Puerto | Abierto | Justificación |
|---|:---:|---|
| 22 | Sí (`ufw limit`) | Administración, solo con llave, con límite de intentos |
| 80 | Sí | Redirección a HTTPS (proxy inverso) |
| 443 | Sí | HTTPS hacia la API |
| 8000 | No (solo 127.0.0.1) | La API solo la alcanza el proxy inverso del mismo servidor |
| 5432 | No (solo 127.0.0.1) | La base solo la alcanza el respaldo local; nunca Internet |

Docker salta las reglas de UFW para los puertos publicados en `0.0.0.0`; por eso en
`deploy/compose.prod.yaml` todos los puertos se publican con `127.0.0.1:`.

Evidencia de que la base de datos no está expuesta (`docker compose ps`, `ss -tlnp` y una conexión
desde otro equipo, que debe fallar):

```
PENDIENTE: pega aquí (la sección "docker compose ps" y "Puertos escuchando" de scripts/evidencia.sh,
más:  psql "host=<servidor> port=5432 user=constructora_app dbname=constructora"  -> debe agotar el tiempo o ser rechazada)
```

## 7.3 Roles de la base de datos

| Rol | Privilegios | No puede | Lo usa | Dónde vive su contraseña |
|---|---|---|---|---|
| `constructora_owner` | Dueño del esquema y de las tablas | Ser superusuario, crear roles ni bases | Servicio `migrar` (migraciones) | Gestor de contraseñas + `.env` del servidor (`OWNER_PASSWORD`, `MIGRATION_DATABASE_URL`) |
| `constructora_app` | SELECT, INSERT, UPDATE, DELETE sobre las tablas de datos | DDL (`DROP`, `ALTER`, `CREATE`), `TRUNCATE`, leer `schema_migrations`, crear roles | La API | `.env` del servidor (`APP_PASSWORD`, `DATABASE_URL`) |
| `constructora_respaldo` | Solo lectura de todo (`pg_read_all_data`) | Escribir, borrar, alterar | `pg_dump` del respaldo | `~respaldo/.pgpass` (600) + gestor de contraseñas |
| `postgres` (admin) | Superusuario | — (solo se usa para administrar) | Personas administradoras, nunca la app | Gestor de contraseñas + `.env` (`POSTGRES_PASSWORD`) |

Script de roles en el repositorio: [`server/sql/01-roles.sql`](../server/sql/01-roles.sql) (roles,
sin contraseñas: salen del entorno) y [`server/sql/02-permisos.sql`](../server/sql/02-permisos.sql)
(permisos y `ALTER DEFAULT PRIVILEGES`). Se aplican solos en el primer arranque
(`server/sql/initdb/01-roles.sh`) y a mano con `bash scripts/aplicar-roles.sh`.

¿Cómo se aplican las migraciones con el rol dueño en tu despliegue? Con un servicio aparte,
`migrar` (`deploy/compose.prod.yaml`), que corre `node src/migrate.js` con `MIGRATION_DATABASE_URL`
(rol dueño), termina y solo entonces arranca `api` (`service_completed_successfully`). El
contenedor de la API **nunca recibe** la contraseña del dueño. Gracias a `ALTER DEFAULT PRIVILEGES
FOR ROLE constructora_owner`, cada tabla nueva que cree una migración ya llega con los permisos de
la app.

¿Por qué `trust` en `pg_hba.conf`? La imagen oficial de PostgreSQL permite conexiones sin
contraseña por el socket local y por `127.0.0.1` **dentro del contenedor**: solo las usa quien ya
puede ejecutar `docker exec`, o sea, un administrador. Las pruebas de privilegios se conectan por
TCP con `-h db` precisamente para que se pida la contraseña.

## 7.4 Pruebas de privilegios

Generada por `bash scripts/pruebas-privilegios.sh` (cada operación corre en `BEGIN … ROLLBACK`).
Pega aquí su salida real; estas son las filas que debe producir:

| Rol | Operación | Esperado | Obtenido |
|---|---|:---:|---|
| `constructora_app` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` en `materiales` | ✅ | PENDIENTE |
| `constructora_app` | `DROP TABLE materiales` | ❌ | PENDIENTE (esperado: `must be owner of table materiales`) |
| `constructora_app` | `TRUNCATE materiales` | ❌ | PENDIENTE (`permission denied`) |
| `constructora_app` | `ALTER TABLE materiales ADD COLUMN x int` | ❌ | PENDIENTE (`must be owner of table`) |
| `constructora_app` | `CREATE TABLE prueba (x int)` | ❌ | PENDIENTE (`permission denied for schema public`) |
| `constructora_app` | `SELECT * FROM schema_migrations` | ❌ | PENDIENTE (`permission denied`) |
| `constructora_app` | `CREATE ROLE intruso` | ❌ | PENDIENTE (`permission denied to create role`) |
| `constructora_app` | Conexión con clave incorrecta | ❌ | PENDIENTE (`password authentication failed`) |
| `constructora_respaldo` | `SELECT` en `materiales` | ✅ | PENDIENTE |
| `constructora_respaldo` | `INSERT` / `DELETE` en `materiales` | ❌ | PENDIENTE (`permission denied`) |
| `constructora_owner` | `CREATE TABLE` (migraciones) | ✅ | PENDIENTE |
| `constructora_owner` | `CREATE ROLE` / `CREATE DATABASE` | ❌ | PENDIENTE (`permission denied`) |

Respuesta a la pregunta guía "¿qué puede hacer tu app si alguien encuentra una inyección SQL?":
leer y modificar filas de `materiales`/`obras`, pero **no** borrar tablas, vaciarlas, alterar el
esquema, crear roles ni tocar el control de migraciones.

## 7.5 Inventario de secretos

| Secreto | Da acceso a | Dónde vive (cada ambiente) | Permisos | Quién lo lee | Cómo se rota |
|---|---|---|---|---|---|
| Contraseña de restic | Todos los respaldos (local y externo) | `/etc/restic/password` + gestor de contraseñas del equipo | 600 | `respaldo`, administradores | `restic key add` / `restic key remove` (el repositorio sigue legible) |
| `APP_PASSWORD` / `DATABASE_URL` | Lectura/escritura de datos | Dev: `.env` local · Servidor: `/opt/constructora/.env` · Nube: panel del proveedor | 640 `root:despliegue` | Administradores y el contenedor `api` | `bash scripts/rotar-clave.sh app` |
| `OWNER_PASSWORD` / `MIGRATION_DATABASE_URL` | Cambiar el esquema | Igual que arriba; solo lo recibe el servicio `migrar` | 640 | Administradores y `migrar` | `bash scripts/rotar-clave.sh owner` |
| `RESPALDO_PASSWORD` | Leer todos los datos | `.env` + `/var/lib/respaldo/.pgpass` | 640 / 600 | `respaldo`, administradores | `bash scripts/rotar-clave.sh respaldo` y volver a ejecutar `configurar-respaldo.sh` |
| `POSTGRES_PASSWORD` (admin) | Todo en la base | `.env` + gestor de contraseñas | 640 | Administradores | `bash scripts/rotar-clave.sh admin` |
| Llaves SSH privadas | El servidor | Equipo de cada persona (nunca en el servidor ni el repo) | 600, con frase de paso | Su dueño | Quitar la llave de `authorized_keys` y generar otra |
| `NUBE_URL` | Base gestionada | Solo en la terminal durante la migración (`read -s`) | — | Quien migra | Restablecer la clave en el panel del proveedor |
| Credenciales del repositorio externo | Agregar respaldos fuera del sitio | `REPO_EXTERNO` en `/etc/constructora/respaldo.conf` | 644 sin clave si se usa SFTP con llave; si lleva clave, 600 | `respaldo` | Cambiar la clave en el servidor externo y actualizar la línea |

Si se va una persona del equipo: borrar su cuenta y su llave (`userdel -r`), rotar `APP`, `OWNER`,
`RESPALDO` y `POSTGRES_PASSWORD` si tuvo acceso a `.env`, y revisar quién conoce la contraseña de
restic (`restic key list`, agregar una nueva y quitar la suya).

Revisión del historial del repositorio (comando usado y resultado):

```
$ bash scripts/revisar-secretos.sh
PENDIENTE: ejecútalo dentro de tu clon (necesita el historial de git) y pega el resultado.
Si encuentras un secreto: 1) rótalo, 2) limpia el historial si el repo es público, 3) documéntalo aquí.
```

---

## 3. Plan de respaldo final (reemplaza la versión de la semana 2)

| Campo | Valor |
|---|---|
| Qué se respalda | Base PostgreSQL `constructora` completa (`obras`, `materiales`, `obra_materiales`, `schema_migrations`) |
| RPO / RTO acordados | _Confirma con los valores de la semana 2._ Propuesta: **RPO 24 h** (respaldo diario) / **RTO 4 h** |
| Herramienta | `pg_dump` (formato custom) + `restic` |
| Usuario del sistema y rol de base que lo ejecutan | Usuario `respaldo` (sin sesión) · rol `constructora_respaldo` (solo lectura) |
| Cifrado y dónde vive la contraseña | restic cifra (AES-256) los dos repositorios · contraseña en `/etc/restic/password` (600) **y** en el gestor de contraseñas del equipo. Sin ella no hay restauración |
| Horario (línea de cron) | `15 2 * * * respaldo /opt/respaldo/respaldar.sh >> /var/log/respaldo/respaldo.log 2>&1` |
| Retención | 7 diarios, 4 semanales, 12 mensuales (local; el externo, por su administrador) |
| Verificación automática | `pg_restore --list` del volcado y `restic check` en cada ejecución |
| Responsable | _completar (nombre del equipo)_ |

### 3.1 Regla 3-2-1

| Copia | Medio | Ubicación | ¿Inmutable? |
|---|---|---|:---:|
| Producción | Volumen de PostgreSQL | Servidor | — |
| Repositorio local | Disco del servidor | `/var/respaldos/restic` (cifrado) | No |
| Repositorio externo | Servidor REST de restic (`deploy/externo.compose.yaml`) o SFTP | Otro equipo/VM, otra ubicación | Sí (`--append-only`: se puede agregar, no borrar) |

3 copias (producción + 2 respaldos), 2 medios/equipos distintos, 1 fuera del sitio.

### 3.2 Script y programación

- Script: [`scripts/respaldar.sh`](../scripts/respaldar.sh) (se instala en `/opt/respaldo/`).
- Instalación y cron: `sudo REPO_EXTERNO=<repositorio> bash scripts/configurar-respaldo.sh`.
- Copia externa: [`deploy/externo.compose.yaml`](../deploy/externo.compose.yaml).

Log de una ejecución automática:

```
PENDIENTE: pega aquí las últimas líneas de /var/log/respaldo/respaldo.log
(esperado: "<fecha> inicio" … "<fecha> fin OK")
```

### 3.3 Procedimiento de restauración de desastre (para quien NO configuró el respaldo)

Escenario: se perdió el servidor y la base; solo sobrevive el repositorio externo.

1. Servidor nuevo con Docker y `restic`; clonar el repositorio en `/opt/constructora`.
2. Tomar del gestor de contraseñas: el `.env` (claves vigentes) y la contraseña de restic;
   guardar esta última en `/etc/restic/password` (`chmod 600`).
3. Ejecutar: `sudo REPO_EXTERNO=<repositorio externo> bash scripts/restaurar.sh huella-antes.txt`.
   El script levanta solo la base, aplica los roles (el volcado no los trae), restaura la última
   copia, vuelve a aplicar permisos, compara huellas, levanta la API y corre la prueba de humo.
   Al final imprime el **tiempo total**.
4. Verificar `HUELLAS IDÉNTICAS` y la prueba de humo en verde; dejar el cron con
   `configurar-respaldo.sh`.

Resultado del ensayo:

| Campo | Valor |
|---|---|
| Quién la ejecutó (≠ quien configuró el respaldo) | PENDIENTE |
| Tiempo medido (inicio del desastre → prueba de humo en verde) | PENDIENTE |
| ¿Cumple el RTO? | PENDIENTE |
| Huellas (`huella-antes.txt` vs `huella-despues.txt`) | PENDIENTE |
| Qué paso fue ambiguo y cómo se corrigió | PENDIENTE |

Preguntas guía respondidas:
- **¿Dónde está la contraseña de restic si el servidor desaparece?** En el gestor de contraseñas del equipo; el servidor solo guarda una copia en `/etc/restic/password`.
- **¿Qué datos se pierden con el último respaldo de hace 24 h?** Todo lo escrito después del último respaldo (RPO = 24 h).
- **¿Qué no viaja en el volcado?** Los roles (por eso `01-roles.sql` va antes) y los permisos a nivel de base de datos como `CONNECT` (por eso `02-permisos.sql` va después).
