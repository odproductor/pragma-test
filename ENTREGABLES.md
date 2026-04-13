# Entregables

## Respuestas a las preguntas

### ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

El primero fue decidir qué tan lejos llevar el modelo de datos. Al principio
pensé en una relación muchos-a-muchos entre tareas y categorías, pero termina
siendo sobre-ingeniería para una prueba: la consigna pide una categoría por
tarea y eso se resuelve con un `categoryId` nullable en la tarea. Menos código,
menos estado, menos formas de romperlo.

El segundo fue el manejo del estado cuando borras una categoría. Si una tarea
quedaba con un `categoryId` apuntando a algo que ya no existe, el filtro y los
labels se rompían de forma silenciosa. Lo resolví con un método
`clearCategoryRef` en el `TaskService` que se llama antes de borrar la
categoría y deja las tareas huérfanas con `categoryId = null`.

El tercero fue Remote Config. La SDK de Firebase Web funciona bien en el
navegador, pero en Cordova hay que tener cuidado con el momento del arranque:
si el fetch tarda, no quieres bloquear la UI. La solución fue usar
`APP_INITIALIZER` con un `try/catch` que permite arrancar con los defaults
locales si Firebase falla o si todavía no está configurado.

El cuarto fue el filtrado reactivo. Tenía la tentación de hacer el filtro con
una variable simple y reasignar el observable al cambiar, pero eso lleva a
estados raros cuando hay múltiples fuentes. Lo pasé a un `BehaviorSubject` y un
`combineLatest` con las tareas y las categorías, así el template solo consume
un `view$` y se redibuja solo cuando cambia algo de verdad.

### ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

- `ChangeDetectionStrategy.OnPush` en las pantallas. Angular corre change
  detection menos veces porque solo reacciona cuando cambian las referencias
  de entrada o cuando se dispara un evento, y las listas usan observables con
  `async` pipe, que juegan bien con OnPush.
- `trackBy` en los `*ngFor`. Sin esto, cambiar una tarea de una lista de mil
  hace que Angular destruya y reconstruya los mil DOM nodes. Con `trackBy`
  solo se actualiza el item que cambió.
- Lazy loading de rutas. La pantalla de categorías se carga solo cuando el
  usuario entra, y además tiene un `canMatch` guard que evita que ese bundle
  se cargue si el feature flag está apagado.
- Observables inmutables. En lugar de mutar arrays con `push`/`splice`,
  siempre devuelvo arrays nuevos. Eso permite que OnPush sepa cuándo hay que
  renderizar y evita bugs sutiles de estado compartido.
- Persistencia asíncrona en la medida de lo razonable. El acceso a
  `localStorage` es síncrono pero rápido para estos volúmenes. Si fuera un
  caso real con miles de items por usuario, lo movería a SQLite o IndexedDB
  para no bloquear el main thread.
- Remote Config con `minimumFetchIntervalMillis` explícito para no pegarle a
  Firebase en cada arranque.

### ¿Cómo aseguraste la calidad y mantenibilidad del código?

Separando responsabilidades. Cada servicio tiene un solo propósito: el
`StorageService` solo lee y escribe en localStorage, el `TaskService` solo
conoce tareas, el `CategoryService` solo conoce categorías y el
`RemoteConfigService` solo lee flags. Las páginas no tocan `localStorage`
directamente nunca; eso permite cambiar el backend de persistencia sin tocar
la UI.

Usando tipos estrictos. Los modelos `Task` y `Category` están en interfaces y
se usan en todos los servicios y templates. Si algún día se agrega un campo,
TypeScript obliga a actualizar todos los lugares afectados.

Manteniendo los componentes delgados. Las páginas casi no tienen lógica:
reciben observables, llaman métodos de servicios y renderizan. Eso hace que
sean fáciles de leer y de testear.

Evitando comentarios de ruido. Los nombres de las funciones y variables
describen qué hacen. Un comentario como "esto agrega una tarea" arriba de
`addTask` no aporta. Si llega a haber un comentario es porque hay algo no
obvio que hay que explicar.

## Archivos APK e IPA

Los archivos se generan siguiendo las instrucciones del README. No los incluyo
firmados en el repo porque requieren credenciales personales (keystore de
Android y certificado de Apple). Los pasos exactos están en el README bajo las
secciones de Android e iOS.

## Capturas / video

Dejar aquí los enlaces o archivos con la demo de:

- Alta, completar y borrar de tareas.
- CRUD de categorías.
- Asignación de categoría a una tarea y filtrado por categoría.
- Cambio del flag `categoriesEnabled` en Firebase Remote Config y cómo
  desaparece la funcionalidad al reabrir la app.
