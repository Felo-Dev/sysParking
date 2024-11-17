# Proyecto Sistema de Parqueo

Este proyecto es un sistema de parqueo desarrollado en PHP utilizando el framework Laravel. Implementa el patrón MVC y sigue los principios SOLID. La aplicación permite gestionar el registro de usuarios, vehículos y tarifas, así como la creación y eliminación de registros relacionados.

## Tecnologías utilizadas

* **PHP**: Lenguaje de programación utilizado para el desarrollo del backend
* **Laravel**: Framework PHP para el desarrollo de aplicaciones web
* **MySQL**: Sistema de gestión de bases de datos utilizado para almacenar la información
* **Composer**: Herramienta para la gestión de dependencias en PHP
* **Electrom**: Paquete utilizado para facilitar ciertas funcionalidades en el proyecto

## Estructura del proyecto

* **app/Models**: Carpeta que contiene los modelos de datos utilizados en la aplicación
* **app/Http/Controllers**: Carpeta que contiene los controladores de la aplicación
* **database/migrations**: Carpeta que contiene las migraciones de base de datos
* **routes/api.php**: Archivo que define las rutas de la API

## Funcionalidades

* **Registro de usuarios**: La aplicación permite registrar nuevos usuarios
* **Registro de vehículos**: La aplicación permite registrar nuevos vehículos
* **Registro de tarifas**: La aplicación permite registrar nuevas tarifas
* **Creación y eliminación de registros**: La aplicación permite crear y eliminar registros relacionados con usuarios, vehículos y tarifas

## Rutas

* `/user`: Ruta que devuelve la lista de usuarios
* `/user/{id}`: Ruta que devuelve la información de un usuario específico
* `/vehiculo`: Ruta que devuelve la lista de vehículos
* `/vehiculo/{id}`: Ruta que devuelve la información de un vehículo específico
* `/tarifas`: Ruta que devuelve la lista de tarifas
* `/tarifas/{id}`: Ruta que devuelve la información de una tarifa específica
