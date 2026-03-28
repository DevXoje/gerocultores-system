# TECH GUIDE — Convenciones técnicas

> El Developer Agent debe leer este archivo antes de generar cualquier código.
> El Reviewer Agent lo usa para validar que el código generado es consistente.

## 1. Convenciones de código

TODO: después de decidir el stack, documentar aquí:
- Nomenclatura de variables, funciones, componentes
- Estructura de carpetas del proyecto
- Convenciones de imports
- Estilo de comentarios

## 2. Gestión de estado

TODO: patrón de gestión de estado elegido y razón (referencia al ADR correspondiente).

## 3. API y comunicación

TODO: patrón de comunicación cliente-servidor, manejo de errores.

## 4. Testing

TODO: framework de tests, convenciones de nomenclatura de tests, coverage mínimo.

## 5. Seguridad y datos

- No almacenar datos sensibles de residentes en localStorage o sessionStorage.
- Toda PII (datos de residentes) debe pasar por la capa de autenticación.
- TODO: política de autenticación (referencia al ADR correspondiente).

## 6. Anti-patrones prohibidos

| Anti-patrón                          | Alternativa                              |
|--------------------------------------|------------------------------------------|
| Lógica de negocio en componentes UI  | Separar en servicios o composables       |
| Hardcodear IDs o rutas               | Usar constantes o variables de entorno   |
| Fetch sin manejo de errores          | Envolver en try/catch con tipo de error  |
| Componentes de más de 200 líneas     | Dividir en componentes más pequeños      |

*Última actualización: 2026-03-28*
