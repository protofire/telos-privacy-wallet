# Telos Privacy Wallet - Monorepo

Este proyecto ha sido convertido en un monorepo usando Yarn Workspaces.

## Estructura del Proyecto

```
telos-privacy-wallet/
├── apps/
│   └── zktelos-wallet/          # Aplicación principal de zkTelos Wallet
│       ├── src/
│       ├── public/
│       ├── electron/
│       └── package.json
├── packages/
│   └── zkbob-client-js/         # Librería zkBob (versión local)
│       ├── src/
│       ├── lib/                 # Código compilado
│       └── package.json
├── package.json                  # Workspace raíz
└── yarn.lock
```

## Comandos Disponibles

Desde la **raíz del proyecto**:

### Desarrollo
```bash
# Iniciar la app en modo desarrollo
yarn start

# Iniciar un workspace específico
yarn workspace zktelos-wallet start
yarn workspace zkbob-client-js build
```

### Build
```bash
# Build de la aplicación
yarn build

# Build de Electron (diferentes plataformas)
yarn electron:build:mac
yarn electron:build:win
yarn electron:build:linux
```

### Tests
```bash
# Ejecutar tests
yarn test
```

## Trabajar con zkbob-client-js

La librería `zkbob-client-js` está vinculada localmente desde `packages/zkbob-client-js`.

### Hacer cambios en zkbob-client-js

1. Navega al directorio:
   ```bash
   cd packages/zkbob-client-js
   ```

2. Haz tus cambios en el código fuente (`src/`)

3. Compila la librería:
   ```bash
   yarn build
   ```
   
   **Nota**: Actualmente hay errores de TypeScript 5.x en el build. El código precompilado en `lib/` funciona correctamente.

4. Los cambios estarán disponibles inmediatamente en `zktelos-wallet` gracias a los workspaces

### Agregar dependencias

Para agregar dependencias a la app:
```bash
yarn workspace zktelos-wallet add nombre-paquete
```

Para agregar dependencias a zkbob-client-js:
```bash
yarn workspace zkbob-client-js add nombre-paquete
```

## Crear Nuevas Librerías

Para crear una nueva librería en `packages/`:

1. Crea el directorio:
   ```bash
   mkdir packages/mi-libreria
   cd packages/mi-libreria
   ```

2. Inicializa el package:
   ```bash
   yarn init
   ```

3. Úsala en la app agregándola en `apps/zktelos-wallet/package.json`:
   ```json
   {
     "dependencies": {
       "mi-libreria": "*"
     }
   }
   ```

4. Ejecuta `yarn install` desde la raíz

## Notas Importantes

- **Siempre ejecuta `yarn install` desde la raíz** del proyecto
- Las dependencias se instalan de forma hoisted (en la raíz) cuando es posible
- Los workspaces permiten compartir dependencias entre packages
- `zkbob-client-js` se vincula simbólicamente, no se descarga de npm

## Troubleshooting

### Problemas con dependencias
```bash
# Limpiar y reinstalar todo
rm -rf node_modules yarn.lock
rm -rf apps/*/node_modules packages/*/node_modules
yarn install
```

### Ver información de workspaces
```bash
yarn workspaces info
```
