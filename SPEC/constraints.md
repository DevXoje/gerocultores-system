# Constraints — Restricciones del proyecto

> Las restricciones son no negociables. El Architect y el Developer deben consultarlas
> antes de cualquier decisión técnica.
>
> Fuente: normas académicas del CIPFP Batoi (DAW, 2025-2026) + propuesta de proyecto.
> Última actualización: 2026-03-28 — procesado por Collector/Structurer (IA).

---

## 1. Restricciones académicas (DAW — Proyecto Final)

### 1.1 Criterios de calificación

| Criterio | Peso |
|----------|------|
| Aspectos formales (presentación, estructura documental, organización y redacción) | 20% |
| Contenidos (dificultad, grado de resolución, originalidad, actualidad, alternativas y resultados) | 50% |
| Exposición y defensa oral (calidad de la exposición y respuestas al tribunal) | 30% |

> La nota es numérica, hasta 10 puntos, sin decimales.

### 1.2 Formato de la memoria

- **Formato de entrega**: PDF.
- **Márgenes**: no superiores a 2,5 cm en ningún lado.
- **Tipografía**: fuente formal, tamaño 10–12 pt.
- **Interlineado**: sencillo.
- **Cabecera**: título del proyecto.
- **Pie de página**: nombre del alumno + número de página.
- **Imágenes**: nítidas, comentadas, numeradas con pie de imagen.
- **Terminología**: los conceptos importantes deben destacarse y explicarse la primera vez que aparecen.
- **Redacción**: no copiar literalmente; resumir y redactar desde el punto de vista del alumno.
- **Propaganda**: no hacer publicidad de productos o tecnologías.
- **Código fuente**: entregado vía repositorio (GitHub / GitLab, con historial de commits trazable).

### 1.3 Fechas de entrega y hitos

| Hito | Fecha |
|------|-------|
| Primera entrega parcial recomendada | Antes del 30 de abril de 2026 |
| Entrega final | Primera semana de junio de 2026 (fecha exacta por confirmar) |
| Exposición oral (máx. 20 minutos) | A lo largo de junio de 2026 |

### 1.4 Condiciones de presentación

- El proyecto **no puede presentarse** hasta que todos los módulos del ciclo estén aprobados y la FCT haya finalizado.
- El tribunal está formado por: jefe de departamento, tutor de grupo y tutor individual.

### 1.5 Derechos de autor

- El autor tiene plena disposición y derecho exclusivo de explotación del proyecto presentado, sin más limitaciones que las del Real Decreto Legislativo 1/1996 (Ley de Propiedad Intelectual).

### 1.6 Normas de estilo académico

- No copiar literalmente ninguna fuente. Citar correctamente en bibliografía.
- Las imágenes deben ser propias o con licencia compatible; incluir pie de imagen con fuente.
- Los conceptos técnicos deben explicarse la primera vez que se introducen.

---

## 2. Restricciones técnicas

### 2.1 Stack tecnológico (fijado por la propuesta)

- **Lenguaje**: JavaScript / TypeScript (frontend y backend).
- **Entorno de desarrollo**: Node.js + npm + IDE (VS Code recomendado).
- **Servidor de pruebas**: Docker local.
- **Dispositivo de pruebas de usabilidad**: tablet o móvil físico.
- **Repositorio**: GitHub o GitLab con historial de commits (requerido por G08).

> Las decisiones de framework concreto (React, Vue, Express, Fastify, etc.) se documentarán en ADR-01 a ADR-04.

### 2.2 Compatibilidad y plataformas

- La aplicación debe funcionar correctamente en **tablet y móvil** (primera plataforma).
- Diseño **mobile-first / tablet-first** obligatorio.
- Debe ser funcional en los navegadores modernos más comunes (Chrome, Firefox, Safari iOS).
- Debe operar en **redes lentas** (residencias sin fibra óptica); se evitarán bundles pesados y payloads grandes.

### 2.3 Despliegue

- El entorno de desarrollo usa Docker local.
- No existe restricción explícita de hosting de producción (pendiente ADR de despliegue).
- Presupuesto: mínimo (proyecto académico individual). Se priorizarán opciones gratuitas o de coste mínimo (Firebase Spark, Supabase free tier, Railway, Render, etc.).

---

## 3. Restricciones de privacidad y normativa (RGPD)

- Los datos de los residentes (nombre, fecha de nacimiento, diagnósticos, medicación, incidencias de salud) son **datos de categoría especial** según el art. 9 del RGPD.
- El sistema debe aplicar:
  - Control de acceso estricto: solo personal autorizado accede a los datos de cada residente.
  - Cifrado en tránsito (HTTPS obligatorio en producción).
  - No almacenar datos sensibles en `localStorage` sin cifrado.
  - Política de retención de datos (historial con límite temporal configurable).
  - Posibilidad de anonimización o eliminación de datos a petición.
- Para el entorno académico de desarrollo: usar datos ficticios en todas las pruebas y demos. Nunca datos reales de pacientes.

---

## 4. Restricciones de accesibilidad y usabilidad

- **Tablet-first**: la interfaz se diseña primero para tablet (768–1024 px), luego para móvil (< 768 px).
- Botones e interacciones deben ser aptos para uso con dedos (touch targets mínimos de 44×44 px, recomendación WCAG 2.1).
- Fuentes legibles sin necesidad de zoom (mínimo 16 px en elementos de lectura).
- Contraste mínimo WCAG AA (4.5:1 para texto normal).
- La navegación principal debe ser accesible con un máximo de 2–3 taps desde cualquier pantalla.

---

## 5. Restricciones de calidad del código

- Todo `feat` commit debe referenciar la US correspondiente (G08): `feat(US-XX): descripción`.
- No hay código implementado sin user story en SPEC/ (G01).
- Toda decisión técnica relevante tiene un ADR en DECISIONS/ (G02).
- Toda funcionalidad debe tener plan de tests antes del APPROVED (G03).
- No hay secretos ni credenciales hardcodeadas en el código (G05).

*Última actualización: 2026-03-28 — Fase 2 bootstrap: Collector/Structurer*
