# Todo App (Ionic + Angular + Cordova)

App de lista de tareas construida con Ionic y Angular. Guarda todo en el
almacenamiento local del navegador/dispositivo y permite organizar las tareas
por categorías. Incluye integración con Firebase Remote Config para activar o
desactivar funcionalidades sin tener que subir una nueva versión.

## Qué hace

- Agregar tareas.
- Marcar tareas como hechas.
- Borrar tareas.
- Crear, editar y borrar categorías.
- Asignar una categoría a cada tarea y filtrar por categoría.
- Feature flag `categoriesEnabled` desde Firebase Remote Config que esconde
  todo lo relacionado con categorías (botón, selectores y ruta) cuando está
  apagado.

## Requisitos

- Node 20 (se probó con 20.20.0).
- npm 10.
- Para Android: JDK 17, Android Studio con SDK 34 y Gradle.
- Para iOS: Mac con Xcode 15+, CocoaPods y una cuenta de Apple Developer para
  firmar la app.
- Cordova CLI (se instala con `npm i -g cordova`).

## Cómo correrlo en el navegador

```
npm install
npm start
```

Eso levanta el dev server de Angular en http://localhost:4200. Para probar con
el chrome de Ionic (recarga en vivo, viewport de móvil):

```
npx ionic serve
```

## Build web de producción

```
npm run build
```

La salida queda en `www/`, que es la carpeta que Cordova usa para empaquetar.

## Android

Primera vez:

```
npx ionic cordova platform add android
```

Para correr en un emulador o dispositivo conectado:

```
npx ionic cordova run android
```

Para generar el APK:

```
npx ionic cordova build android --release --prod
```

El APK sin firmar queda en `platforms/android/app/build/outputs/apk/release/`.
Después hay que firmarlo con `jarsigner` y alinearlo con `zipalign`. Si ya
tienes un `keystore`, usas algo así:

```
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore mi-keystore.jks app-release-unsigned.apk mi-alias
zipalign -v 4 app-release-unsigned.apk todo-app.apk
```

## iOS

Primera vez (solo Mac):

```
npx ionic cordova platform add ios
cd platforms/ios && pod install && cd ../..
```

Para abrir el proyecto en Xcode:

```
open platforms/ios/MyApp.xcworkspace
```

Desde Xcode se selecciona el team de firma, se elige un dispositivo y se le da
a Run. Para generar el IPA, Product > Archive y después Distribute App.

Si prefieres línea de comandos:

```
npx ionic cordova build ios --release --prod
```

## Configuración de Firebase

El archivo `src/environments/environment.ts` trae los campos de Firebase con
valores `REPLACE_...`. Hay que reemplazarlos con los valores del proyecto de
Firebase (Project settings > General > Your apps > SDK setup).

Después, en la consola de Firebase, en Remote Config, se crea un parámetro
llamado `categoriesEnabled` de tipo booleano. Si está en `true`, la pantalla
de categorías y el selector en la pantalla principal se muestran. Si está en
`false`, todo eso desaparece al siguiente arranque de la app (el Remote Config
se pide al iniciar).

Mientras los valores de Firebase sigan con `REPLACE_`, la app funciona igual
pero usando el valor del flag que está hardcodeado en `environment.ts`
(`categoriesEnabled: true`). Así no es obligatorio tener Firebase configurado
para probar.

## Estructura

```
src/app/
  models/           interfaces de Task y Category
  services/         TaskService, CategoryService, RemoteConfigService, StorageService
  guards/           guard para bloquear la ruta de categorías si el flag está off
  home/             pantalla principal con la lista y el filtro
  categories/       CRUD de categorías
```

## Notas

- El almacenamiento es `localStorage`. Para producción conviene moverlo a
  `@ionic/storage` o SQLite, pero para la prueba alcanza.
- La pantalla principal usa `ChangeDetectionStrategy.OnPush` y `trackBy` para
  evitar renders innecesarios cuando la lista crece.
- Hay un botón "Cargar 1000 de prueba" cuando la lista está vacía, para probar
  el rendimiento con muchas tareas.
