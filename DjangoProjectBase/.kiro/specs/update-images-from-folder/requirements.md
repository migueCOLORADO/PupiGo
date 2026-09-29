# Requirements Document

## Introduction

Este documento define los requisitos para un nuevo comando de administracion de Django
llamado `update_images_from_folder`. El objetivo es asignar a cada pelicula registrada
en la base de datos la imagen correspondiente que ya fue generada por la API y entregada
en la carpeta `media/movie/images/`, actualizando el campo `image` del modelo `Movie`.

Las imagenes siguen el patron de nombre `m_<TITULO>.png`, donde `<TITULO>` corresponde al
titulo de la pelicula en la base de datos. Algunas imagenes presentan nombres con acentos
corruptos por codificacion (por ejemplo `m_Faust et M?phistoph?l?s.png`) y unas pocas
aparecen truncadas o sin extension, por lo que el emparejamiento no puede depender
unicamente de una coincidencia exacta de texto.

## Requirements

### Requirement 1: Recorrer las peliculas y asignar su imagen

**User Story:** Como administrador del sitio, quiero un comando que recorra las peliculas
de la base de datos y les asigne la imagen correspondiente de la carpeta entregada, para
que el catalogo muestre cada pelicula con su poster generado por la API.

#### Acceptance Criteria

1. WHEN se ejecuta `python manage.py update_images_from_folder` THEN el comando SHALL recorrer todas las peliculas existentes en la base de datos.
2. WHEN el comando procesa una pelicula THEN el comando SHALL buscar en `media/movie/images/` un archivo cuyo nombre corresponda al patron `m_<titulo>.png`.
3. WHEN encuentra el archivo correspondiente THEN el comando SHALL asignar al campo `image` del modelo `Movie` la ruta relativa `movie/images/<archivo>` y guardar el registro.
4. WHEN el campo `image` se actualiza y se guarda THEN el cambio SHALL persistir en la base de datos.

### Requirement 2: Emparejamiento tolerante a diferencias de nombre

**User Story:** Como administrador, quiero que el comando empareje correctamente aun cuando
el nombre del archivo tenga acentos corruptos o pequenas diferencias, para que el maximo
numero posible de peliculas queden con imagen sin intervencion manual.

#### Acceptance Criteria

1. WHEN el nombre del archivo coincide exactamente con `m_<titulo>.png` THEN el comando SHALL usar esa coincidencia.
2. IF no existe coincidencia exacta THEN el comando SHALL intentar una coincidencia normalizada que ignore diferencias de mayusculas/minusculas y de acentos o caracteres corruptos.
3. WHEN existen archivos con nombres truncados o sin extension (por ejemplo `m_Fairyland`) THEN el comando SHALL intentar emparejarlos con la pelicula cuyo titulo empiece por ese fragmento.
4. IF una pelicula no tiene ningun archivo correspondiente THEN el comando SHALL dejar esa pelicula sin cambios y reportarla como no encontrada, sin detener el proceso.

### Requirement 3: Mensajes de progreso y confirmacion de exito

**User Story:** Como usuario que ejecuta el comando, quiero ver mensajes claros durante y al
final de la ejecucion, para saber con certeza que el proceso funciono correctamente.

#### Acceptance Criteria

1. WHEN inicia la ejecucion THEN el comando SHALL mostrar cuantas peliculas hay en la base de datos y cuantas imagenes hay en la carpeta.
2. WHEN se asigna la imagen de una pelicula THEN el comando SHALL mostrar un mensaje de exito por cada pelicula actualizada (por ejemplo `Updated image: <titulo>`).
3. WHEN una pelicula no encuentra imagen THEN el comando SHALL mostrar una advertencia identificando la pelicula.
4. WHEN finaliza la ejecucion THEN el comando SHALL mostrar un mensaje resumen con el total de peliculas actualizadas (por ejemplo `Finished: N movies updated with images from folder.`).

### Requirement 4: Robustez de ejecucion

**User Story:** Como usuario en Windows, quiero que el comando no se caiga por problemas de
codificacion o por la ausencia de la carpeta, para poder ejecutarlo sin errores inesperados.

#### Acceptance Criteria

1. IF la carpeta `media/movie/images/` no existe THEN el comando SHALL mostrar un mensaje de error claro y terminar sin lanzar una excepcion no controlada.
2. WHEN se imprimen titulos con caracteres especiales en la consola de Windows THEN el comando SHALL evitar que un error de codificacion (cp1252) detenga el proceso.
3. WHEN ocurre un error al procesar una pelicula individual THEN el comando SHALL registrar el error para esa pelicula y continuar con las demas.
