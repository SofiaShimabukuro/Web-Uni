-- Proceso 02 · Productividad y desempeño del estudiante
-- Ver docs/procesos/02-productividad-desempeno.md para el diagrama y las
-- reglas de negocio detrás de este esquema.
-- Depende de las tablas de db/01_gestion_cursos_contenidos.sql
-- (usuario, materia, recurso, entrega).

CREATE TYPE tipo_bloque_estudio AS ENUM ('estudio', 'repaso', 'entrega', 'examen');
CREATE TYPE estado_bloque_estudio AS ENUM ('planificado', 'cumplido', 'salteado');
CREATE TYPE frecuencia_habito AS ENUM ('diaria', 'semanal', 'dias_especificos');
CREATE TYPE calificacion_repaso AS ENUM ('otra_vez', 'dificil', 'bien', 'facil');
CREATE TYPE tipo_recordatorio AS ENUM ('entrega_proxima', 'examen_proximo', 'habito', 'repaso_espaciado');
CREATE TYPE canal_recordatorio AS ENUM ('push', 'email');
CREATE TYPE estado_recordatorio AS ENUM ('pendiente', 'enviado', 'leido');

CREATE TABLE bloque_estudio (
    id           SERIAL PRIMARY KEY,
    alumno_id    INTEGER NOT NULL REFERENCES usuario(id),
    materia_id   INTEGER REFERENCES materia(id),
    tipo         tipo_bloque_estudio NOT NULL,
    fecha        DATE NOT NULL,
    hora_inicio  TIME NOT NULL,
    hora_fin     TIME NOT NULL,
    estado       estado_bloque_estudio NOT NULL DEFAULT 'planificado',
    CHECK (hora_fin > hora_inicio)
);

CREATE TABLE habito (
    id          SERIAL PRIMARY KEY,
    alumno_id   INTEGER NOT NULL REFERENCES usuario(id),
    nombre      TEXT NOT NULL,
    frecuencia  frecuencia_habito NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE registro_habito (
    id         SERIAL PRIMARY KEY,
    habito_id  INTEGER NOT NULL REFERENCES habito(id) ON DELETE CASCADE,
    fecha      DATE NOT NULL,
    cumplido   BOOLEAN NOT NULL,
    UNIQUE (habito_id, fecha)
);

CREATE TABLE item_repaso (
    id                    SERIAL PRIMARY KEY,
    alumno_id             INTEGER NOT NULL REFERENCES usuario(id),
    materia_id            INTEGER REFERENCES materia(id),
    recurso_id            INTEGER REFERENCES recurso(id),
    pregunta              TEXT NOT NULL,
    respuesta             TEXT NOT NULL,
    facilidad             NUMERIC(4,2) NOT NULL DEFAULT 2.5,
    intervalo_dias        INTEGER NOT NULL DEFAULT 0,
    repeticiones          INTEGER NOT NULL DEFAULT 0,
    proxima_fecha_repaso  DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE sesion_repaso (
    id             SERIAL PRIMARY KEY,
    item_repaso_id INTEGER NOT NULL REFERENCES item_repaso(id) ON DELETE CASCADE,
    fecha          DATE NOT NULL DEFAULT CURRENT_DATE,
    calificacion   calificacion_repaso NOT NULL
);

CREATE TABLE autoevaluacion (
    id              SERIAL PRIMARY KEY,
    alumno_id       INTEGER NOT NULL REFERENCES usuario(id),
    materia_id      INTEGER NOT NULL REFERENCES materia(id),
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    puntaje         NUMERIC(5,2),
    total_preguntas INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pregunta_autoevaluacion (
    id                  SERIAL PRIMARY KEY,
    autoevaluacion_id   INTEGER NOT NULL REFERENCES autoevaluacion(id) ON DELETE CASCADE,
    enunciado           TEXT NOT NULL,
    respuesta_correcta  TEXT NOT NULL,
    respuesta_alumno    TEXT,
    es_correcta         BOOLEAN
);

CREATE TABLE recordatorio (
    id                SERIAL PRIMARY KEY,
    alumno_id         INTEGER NOT NULL REFERENCES usuario(id),
    tipo              tipo_recordatorio NOT NULL,
    entrega_id        INTEGER REFERENCES entrega(id),
    habito_id         INTEGER REFERENCES habito(id),
    item_repaso_id    INTEGER REFERENCES item_repaso(id),
    fecha_hora_envio  TIMESTAMP NOT NULL,
    canal             canal_recordatorio NOT NULL DEFAULT 'push',
    estado            estado_recordatorio NOT NULL DEFAULT 'pendiente'
);

CREATE INDEX idx_bloque_estudio_alumno ON bloque_estudio(alumno_id, fecha);
CREATE INDEX idx_habito_alumno ON habito(alumno_id);
CREATE INDEX idx_registro_habito_habito ON registro_habito(habito_id);
CREATE INDEX idx_item_repaso_alumno_fecha ON item_repaso(alumno_id, proxima_fecha_repaso);
CREATE INDEX idx_sesion_repaso_item ON sesion_repaso(item_repaso_id);
CREATE INDEX idx_autoevaluacion_alumno_materia ON autoevaluacion(alumno_id, materia_id);
CREATE INDEX idx_recordatorio_alumno_estado ON recordatorio(alumno_id, estado);
