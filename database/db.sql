// CREAR BASE DE DATOS //
SELECT 'CREATE DATABASE jubstor' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jubstor')\gexec


// CREAR TABLAS EN 'jubstor' //
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios(
    idusuario SERIAL,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    vista VARCHAR(30) NOT NULL DEFAULT 'listado',
    authtoken VARCHAR(255),
    PRIMARY KEY (idusuario)
);

CREATE TABLE tareas(
    idtarea SERIAL,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    idusuario INT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Por hacer',
    ordencol INT NOT NULL,
    PRIMARY KEY (idtarea),
    CONSTRAINT fk_usuarios FOREIGN KEY(idusuario) REFERENCES usuarios(idusuario) ON DELETE CASCADE
);