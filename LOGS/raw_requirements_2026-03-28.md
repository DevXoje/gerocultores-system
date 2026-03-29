# LOGS — Raw Requirements Log

**Fecha**: 2026-03-28  
**Fuente**: Documentos proporcionados por el alumno/usuario en sesión de Fase 2 (bootstrap).  
**Collector**: IA (Claude Sonnet) — Agente Collector/Structurer  
**Proyecto**: gerocultores-system  
**Propósito**: Preservar los documentos originales de entrada para trazabilidad y referencia futura.

> Este fichero es de solo lectura. No modificar el contenido de los documentos originales.
> Los documentos están en valenciano y castellano, tal como fueron proporcionados.

---

## DOCUMENTO 1: NORMES I RECOMANACIONS (Reglamentación académica DAW)

*Idioma original: valenciano*

```
NORMES I RECOMANACIONS
Avaluació. Criteris de qualificació.
La qualificació del mòdul de Projecte serà numèrica, fins un 10 i sense decimals.
Els criteris de qualificació, com a percentatge de la nota final, seran els següents:
a) Aspectes formals (presentació, estructura documental, organització i redacció, entre altres): 20%
b) Continguts (dificultat, grau de resolució de la proposta, originalitat, actualitat, alternatives presentades i resultats obtinguts, entre altres): 50%
c) Exposició i defensa (qualitat de l'exposició oral i de les respostes a les preguntes plantejades pels membres del tribunal): 30%
Drets d'autor: Els autors i les autores dels projectes tenen plena disposició i dret exclusiu a l'explotació del projecte presentat, sense més limitacions que les contingudes en el Reial decret legislatiu 1/1996.
Consells i altres normes:
- Format: PDF, marges no superiors a 2.5cm, lletra formal 10-12pt, interlineat senzill, capçalera amb títol, peu amb nom alumne i número pàgina.
- Incloure exemples reals, imatges nítides comentades i numerades amb peu d'imatge.
- Destacar conceptes importants i terminologia (explicar primera vegada que apareguen).
- No copiar literalment. Resumir. Adaptar redacció des del punt de vista de l'alumne.
- No fer propaganda dels productes/tecnologies.
- El codi font s'entrega via repositori (GitHub, GitLab, etc).
Dates d'entrega:
- Primera entrega parcial recomanada: abans del 30 d'abril.
- Entrega final: primera setmana de juny (es concretarà).
- Exposició oral: al llarg del juny. Durada màxima 20 minuts.
- Tribunal: cap de departament, tutor de grup, tutor individual.
- Nota: el projecte no es pot presentar fins que tots els mòduls estiguen aprovats i la FCT finalitzada.
```

---

## DOCUMENTO 2: ESTRUCTURA ORIENTATIVA DE LA MEMÒRIA

*Idioma original: valenciano*

```
Portada: Títol, autor, cicle formatiu, curs/data, nom centre, logotip.
Primera pàgina: info portada + nom tutor individual.
Agraïments (opcional).
Índex: apartats, subapartats, pàgines.
1. Introducció: motius, descripció i objectius, aplicacions pràctiques, presentació dels apartats.
2-10. Contingut tècnic:
  - Fonaments teòrics i pràctics.
  - Presentació empresa/organització (si aplicació real).
  - Estudi sistema informàtic (si aplicació real).
  - Fases d'implementació tècnica amb problemes i solucions.
  - Estudi del cost econòmic i organitzatiu.
  - Comparació amb la situació actual i alternatives.
11. Conclusions: resultats obtinguts, punts pendents, temps dedicat, dificultat, valoració personal, connexions FCT, consells.
12. Necessitats i suggeriments de formació.
13. Bibliografia: autor, títol, editorial, any, comentari breu de cada referència.
14. Recursos utilitzats: hardware, software, observacions d'instal·lació/configuració.
15. Annexos en el mateix document (si fa falta): scripts, codi font, glossari, documents relacionats, normativa.
16. Annexos separats (si fa falta): llista de carpetes, subcarpetes i fitxers inclosos.
Altres índex (opcional): d'imatges, de paraules.
Contraportada: resum del contingut.
```

---

## DOCUMENTO 3: LA PROPOSTA PRESENTADA (Propuesta de proyecto)

*Idioma original: castellano*

```
Títol: Desarrollo de una agenda digital para gerocultores
Autor: Jose Vilches Sánchez, DNI: 48757846-P
Centre: CIPFP Batoi d'Alcoi
Cicle: CFS Desarrollo de Aplicaciones Web (DAW)
Data: 27 de Febrero de 2026

Objectius generals:
Crear una aplicación web accesible (optimizada para tablet/móvil) que permita a gerocultores
planificar y ejecutar la agenda diaria, registrar incidencias y mantener un historial por
residente, con notificaciones para alertas críticas.

Problema que resol:
Los gerocultores suelen gestionar tareas y el seguimiento de residentes con papel, hojas sueltas
o sistemas no unificados, lo que provoca olvidos, pérdida de trazabilidad e información dispersa
entre turnos. Una aplicación simple y accesible mejora la coordinación diaria, reduce errores y
facilita la comunicación con familiares y supervisión.

Recursos:
- Entorno dev: Node.js, npm, IDE.
- Servidor de prueba: Docker local.
- Dispositivo: tablet o móvil para pruebas de usabilidad.
- Stack: JavaScript/TypeScript (frontend y backend).

Plan de treball:
- Semanas 1–2: Diseño UX / arquitectura, modelos de datos y API.
- Semanas 3–4: Frontend: agenda, ficha residente, lista de incidencias.
- Semanas 5–6: Backend: API, persistencia, notificaciones, pruebas.
- Semana 7: Integración frontend-backend, pruebas E2E y ajustes de usabilidad.
- Semana 8: Documentación, entrega y presentación.
```

---

## Notas del Collector (IA)

**Procesado**: 2026-03-28  
**Artefactos generados en esta sesión**:
- `SPEC/constraints.md` — restricciones académicas, técnicas y de privacidad.
- `SPEC/requirements.md` — RF-01 a RF-12 + RNF-01 a RNF-08.
- `SPEC/user-stories.md` — US-01 a US-12.
- `SPEC/entities.md` — 7 entidades del dominio: Usuario, Residente, Tarea, Incidencia, Turno, Notificacion, ResidenteAsignacion.
- `SPEC/flows.md` — FL-01 a FL-06 (6 flujos principales).
- `OUTPUTS/academic/README.md` — checklist completo de la memoria académica.

**Requisitos inferidos del dominio** (no mencionados explícitamente en la propuesta):
- RF-02: Control de roles (gerocultor / coordinador / administrador).
- RF-09: Gestión de residentes (alta/baja por coordinador).
- RF-10: Gestión de usuarios/cuentas (alta/baja por administrador).
- RF-11: Resumen de fin de turno / traspaso.
- RF-12: Vista de agenda semanal.
- RNF-05: Accesibilidad WCAG 2.1 AA.
- RNF-06: Escalabilidad para 20 usuarios concurrentes.
- RNF-07: Auditoría/trazabilidad de cambios en datos de residentes.

**Campos RGPD sensibles identificados** (Residente): `fechaNacimiento`, `foto`, `diagnosticos`, `alergias`, `medicacion`, `preferencias`. En Incidencia: `descripcion`, `severidad`.

*Fin del log — 2026-03-28*
