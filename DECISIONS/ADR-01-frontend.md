# ADR 01: Framework Frontend

## Status
PROPOSED

## Context
El proyecto "gerocultores-system" desarrolla **GeroCare**, una aplicación web (PWA) orientada a tablets y móviles para el uso diario de cuidadores en residencias. El deadline para el MVP es ajustado (~6-7 semanas) al ser un proyecto académico de DAW con un solo desarrollador. Las redes en las residencias suelen ser lentas o irregulares, por lo que el soporte offline parcial o total es clave. Necesitamos un framework maduro, rápido de desarrollar y con buen ecosistema para interfaces complejas (formularios, agendas).

## Decision
Se propone utilizar **React 18 con Vite** como framework frontend, complementado con **Tailwind CSS** y componentes **shadcn/ui**. Para la gestión de estado asíncrono y soporte offline, se utilizará **TanStack Query (React Query)**. 

## Alternatives considered
* **Vue 3 + Vite**: 
  * *Pros*: Curva de aprendizaje más suave, PWA plugin excelente, Composition API intuitiva.
  * *Cons*: Ecosistema de componentes UI ligeramente menor al de React para interfaces "dashboard-like" rápidas.
* **Svelte/SvelteKit**:
  * *Pros*: Bundle muy ligero, excelente rendimiento en dispositivos de bajos recursos.
  * *Cons*: Comunidad menor, menos librerías de UI "plug-and-play", mayor riesgo si el desarrollador encuentra bloqueos.

## Rationale
Aunque Vue 3 ofrece una curva inicial más suave, React 18 se elige por dos motivos principales:
1. **Ecosistema PWA y Offline**: La combinación de React + TanStack Query ofrece la mejor experiencia de desarrollo para manejar mutaciones optimistas y caché `offlineFirst`, mitigando el problema de redes irregulares en las residencias.
2. **Velocidad de UI**: El uso de shadcn/ui con Tailwind permite construir interfaces accesibles y de aspecto profesional en días, crítico para cumplir el plazo de 6 semanas.
3. **Empleabilidad**: Es el stack más demandado en el mercado laboral actual (post-DAW).

*Tiempo estimado al MVP (Frontend base)*: ~4-6 días.

## Consequences and migration notes
* **Consecuencias**: El bundle inicial de React es ligeramente mayor que el de Svelte/Vue. Habrá que prestar atención al code-splitting (React.lazy).
* **Migración**: Si el rendimiento en tablets muy antiguas es inaceptable, se podría requerir refactorizar vistas pesadas, pero la probabilidad es baja usando Vite y buenas prácticas.

## Acceptance criteria
- [ ] El proyecto arranca con `vite` + `react-ts`.
- [ ] Tailwind CSS está configurado.
- [ ] La app se instala como PWA en dispositivo móvil/tablet.
- [ ] TanStack Query está configurado para cacheo offline.

## Implementation notes
* Inicializar con `npm create vite@latest frontend -- --template react-ts`.
* Configurar `vite-plugin-pwa` para generación del Service Worker.
* Integrar `shadcn/ui` init.

## References
* Exploración de Stack: Engram `sdd/stack-decision/explore`
