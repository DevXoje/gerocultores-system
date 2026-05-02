# Diagnóstico: Deploy de Firebase Functions no funciona

**Fecha**: 2026-05-02  
**Estado**: Deploy completa sin errores, pero la función no responde correctamente

---

## Síntoma

`firebase deploy --only functions` termina con "Deploy complete" pero la función en Cloud Functions no sirve correctamente.

---

## Causa Raíz: `"main"` apunta al entry point incorrecto

### El problema

`code/api/package.json`:
```json
"main": "dist/server.js"
```

### Por qué esto está mal

Firebase Functions lee el campo `"main"` del `package.json` para saber **qué archivo cargar como entry point de la función**.

- `dist/server.js` → llama a `app.listen()` (un servidor HTTP local), **no exporta ninguna función**
- `dist/index.js` → exporta `api` via `onRequest(app)`, que es lo que Firebase necesita

Cuando Firebase carga `dist/server.js`, arranca un servidor HTTP en local y **no encuentra ningún export de Cloud Function**. El deploy "completa" porque el archivo existe y compila sin errores, pero la función registrada en Cloud Functions no es válida.

### Evidencia

`dist/server.js` (compilado):
```js
// ❌ Llama a app.listen() — esto es un servidor HTTP local, no una Cloud Function
app_1.default.listen(PORT, HOST, () => {
  console.log(`[server] API running on http://${HOST}:${PORT}`)
})
// No hay ningún `exports.api = ...`
```

`dist/index.js` (compilado):
```js
// ✅ Exporta la Cloud Function correctamente
exports.api = (0, https_1.onRequest)(app_1.default)
```

---

## Fix requerido

Cambiar en `code/api/package.json`:

```json
// ❌ Antes
"main": "dist/server.js"

// ✅ Después
"main": "dist/index.js"
```

---

## Verificación post-fix

1. `npm run build` desde `code/api/`
2. `firebase deploy --only functions --project gero-care` desde `code/`
3. Verificar en Firebase Console → Functions que `api` aparece listada con región `europe-west1`
4. Hacer un request a `/health` o `/api/protected` vía la URL pública de la function

---

## Decisiones de configuración en `setGlobalOptions`

### `invoker` — defensa en profundidad (descartado por ahora)

`invoker` permite restringir quién puede invocar la Cloud Function a nivel de IAM de GCP:

```ts
// Opción A: solo llamadas autenticadas con IAM (bloquea todo acceso público)
setGlobalOptions({ ..., invoker: "private" })

// Opción B: solo un service account específico
setGlobalOptions({ ..., invoker: "SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" })
```

**Por qué no se aplica ahora:**

El rewrite de Firebase Hosting necesita poder llamar a la función sin autenticación IAM adicional. Si se activa `invoker: "private"`, el propio Hosting no podría invocar la función — o requeriría configuración IAM no trivial en el lado de GCP.

**Vector de ataque real cubierto por otras vías:**
- `verifyAuth` middleware valida el Firebase token en todas las rutas protegidas
- `/health` es la única ruta pública, intencionalmente
- Rate limiting (futuro: `express-rate-limit`) como capa adicional

**Cuándo reconsiderar `invoker`:**
- Si en el futuro se abandona Firebase Hosting y se usa un cliente que pueda enviar tokens IAM (ej. otro servicio GCP)
- Si se detecta abuso directo de la URL pública de la Cloud Function (bypassing Hosting)

---

## Notas adicionales

- `server.ts` es el entry point para **desarrollo local** (`tsx watch src/server.ts`). Usa `dotenv` y `app.listen`. Correcto así.
- `index.ts` es el entry point para **Cloud Functions** (`onRequest(app)`). NO usa dotenv. Correcto así.
- El `firebase.json` configura correctamente `"source": "api"` — el problema está únicamente en `package.json`.
- El campo `"main"` en `package.json` es lo que Node/Firebase usa para resolver qué exportar cuando se hace `require('.')` sobre el directorio.
