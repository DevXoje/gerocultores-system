# 3. Contexto y organización del proyecto

> **Borrador** — sección 3 de la memoria académica DAW  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: Agenda digital para gerocultores — gerocultores-system  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Generado**: 2026-04-06 — WRITER agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Longitud**: ~520 palabras

---

## 3.1 El sector sociosanitario en España

Las residencias de mayores son uno de los pilares del sistema de cuidados de larga duración en España. Según datos del IMSERSO (2023) [CITA PENDIENTE], existen aproximadamente 5.400 centros residenciales para personas mayores en el territorio nacional, con más de 380.000 plazas en funcionamiento. Este sector atiende a personas en situación de dependencia severa o moderada que requieren cuidados continuados durante las veinticuatro horas del día, repartidos en turnos de mañana, tarde y noche.

La presión asistencial en estos centros es alta: cada gerocultor puede tener bajo su responsabilidad entre seis y quince residentes en un mismo turno, con tareas que abarcan desde la higiene personal y la administración de medicación hasta la supervisión del estado de salud y la detección de incidencias. La correcta comunicación entre turnos y el registro de cualquier evento relevante son, en este contexto, cuestiones de seguridad clínica y no meramente administrativas.

## 3.2 El rol del gerocultor: responsabilidades, turnos y registro

El gerocultor —también denominado auxiliar de gerontología o técnico en atención sociosanitaria— es el profesional de atención directa en la residencia. Su jornada se estructura en turnos rotativos (mañana, tarde y noche) y su trabajo incluye, entre otras responsabilidades: ejecutar los cuidados de higiene y movilización de los residentes asignados, administrar la medicación pautada, registrar cualquier incidencia observada durante el turno y garantizar el traspaso de información al equipo del turno siguiente.

En la gran mayoría de centros, este registro se realiza todavía con papel: hojas de turno, cuadernos de incidencias y fichas individuales en formato físico. Cuando el gerocultor necesita conocer el estado de salud de un residente —sus alergias, su medicación activa, sus últimas incidencias— debe localizar la carpeta correspondiente, hojearla y retenerla de memoria antes de prestar la atención. Este proceso, además de lento, introduce margen de error en un entorno donde los datos de salud son críticos.

## 3.3 Problema identificado: falta de digitalización y trazabilidad

La ausencia de una herramienta digital centralizada genera tres problemas concretos que este proyecto busca resolver. Primero, la pérdida de información en el traspaso de turno: cuando el gerocultor del turno de mañana termina y el de la tarde comienza, las incidencias registradas en papel pueden extraviarse, quedar ilegibles o simplemente no leerse antes de la atención. Segundo, el riesgo de error en la administración de cuidados: sin acceso inmediato a la ficha del residente, un gerocultor puede desconocer una alergia reciente o un cambio en la pauta de medicación. Tercero, la trazabilidad nula: ante cualquier reclamación o auditoría, resulta muy difícil reconstruir quién atendió a quién, cuándo y en qué condiciones.

La digitalización de este flujo no requiere complejidad tecnológica excesiva; requiere una interfaz pensada para el entorno real de uso: pantalla táctil, guantes puestos, iluminación variable, conexión a internet de calidad modesta.

## 3.4 Alcance del proyecto: MVP y lo que queda fuera

El MVP de este proyecto cubre las funcionalidades más críticas del día a día del gerocultor, correspondientes a los requisitos RF-01 a RF-07. He priorizado estas siete funcionalidades porque representan el núcleo del flujo de trabajo: iniciar sesión con credenciales seguras (RF-01), acceder solo a los datos que corresponden a su rol (RF-02), consultar su agenda diaria (RF-03), actualizar el estado de sus tareas (RF-04), consultar la ficha del residente (RF-05), registrar incidencias con un formulario rápido de cinco taps (RF-06) y consultar el historial de incidencias de cada residente (RF-07).

Quedan fuera del MVP —pero documentadas como funcionalidades Should y Could— las notificaciones in-app de alertas críticas (RF-08), la gestión de residentes por el coordinador (RF-09), la gestión de cuentas de usuario por el administrador (RF-10), el resumen y traspaso de turno estructurado (RF-11) y la vista de agenda semanal (RF-12). La decisión de excluirlas del MVP no responde a su falta de importancia, sino a la limitación de tiempo de un proyecto académico individual con fecha de entrega fija. El modo offline, las notificaciones push nativas del sistema operativo, la aplicación nativa y el portal para familiares quedan explícitamente fuera del alcance de este proyecto.

---

*Borrador generado: 2026-04-06 — WRITER agent — gerocultores-system*  
*Fuentes: PROJECT_BRIEF.md, SPEC/requirements.md, SPEC/user-stories.md, SPEC/constraints.md*  
*Engram topic key: academic/contexto*
