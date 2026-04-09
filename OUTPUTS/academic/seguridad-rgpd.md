# 10. Seguridad y cumplimiento RGPD

> **Borrador** — sección 10 de la memoria académica DAW  
> **Autor**: Jose Vilches Sánchez  
> **Proyecto**: GeroCare — Agenda digital para gerocultores  
> **Centro**: CIPFP Batoi d'Alcoi  
> **Generado**: 2026-04-06 — WRITER agent  
> **Estado**: BORRADOR — pendiente revisión y personalización por el autor  
> **Longitud**: ~580 palabras

---

## 10.1 Clasificación de los datos tratados

GeroCare gestiona tres categorías de datos con distinto nivel de sensibilidad según el Reglamento General de Protección de Datos (RGPD, Reglamento UE 2016/679).

En primer lugar, **datos de categoría especial** (art. 9 RGPD): diagnósticos médicos, alergias, medicación activa y pautas de administración, preferencias de cuidado asociadas a condiciones de salud, y la descripción e información de severidad de las incidencias registradas. En el modelo de datos del sistema, estos campos están identificados explícitamente como `<!-- RGPD: dato sensible -->` en `SPEC/entities.md`. Los campos afectados son `Residente.diagnosticos`, `Residente.alergias`, `Residente.medicacion`, `Residente.preferencias`, `Residente.fechaNacimiento`, `Residente.foto`, `Incidencia.descripcion` e `Incidencia.severidad`.

En segundo lugar, **datos de identidad del residente**: nombre, apellidos, número de habitación y fecha de nacimiento. Aunque no todos son datos de salud per se, forman parte del perfil de una persona en situación de dependencia y reciben el mismo nivel de protección en el sistema.

En tercer lugar, **datos de acceso del personal**: credenciales de usuario (email, hash de contraseña), rol asignado, timestamps de acceso y actividad. Estos datos son necesarios para el control de acceso y la auditoría de operaciones.

## 10.2 Base legal del tratamiento

El tratamiento de datos de salud en un entorno residencial tiene amparo legal expreso en el RGPD. La base principal que justifica el tratamiento de los datos de categoría especial en este sistema es el **artículo 9.2.h** del RGPD: prestación de asistencia sanitaria y social, gestión de los sistemas y servicios de atención sanitaria y social. Complementariamente, el **artículo 6.1.c** —tratamiento necesario para el cumplimiento de una obligación legal— aplica a los requisitos de registro y trazabilidad que impone la normativa de atención a personas en situación de dependencia.

Para el entorno académico del proyecto, estas bases legales se documentan como referencia técnica. En un despliegue real, el responsable del tratamiento sería el centro residencial, que debería formalizar el contrato de encargado del tratamiento con el proveedor de servicios cloud (Google/Firebase) y registrar el tratamiento en su Registro de Actividades de Tratamiento.

## 10.3 Medidas técnicas implementadas

He articulado la seguridad del sistema en tres capas complementarias, tal como se detalla en el ADR-03b (autenticación y autorización):

**Firebase Auth** actúa como capa de autenticación. Gestiona la identidad del usuario mediante tokens JWT con expiración automática. Las contraseñas no se almacenan en ningún punto del sistema; Firebase Auth solo conserva los hashes gestionados por la plataforma. El registro público está bloqueado: solo el administrador puede crear cuentas nuevas mediante el Admin SDK.

**Firestore Security Rules** actúan como segunda barrera, a nivel de base de datos. Las reglas impiden cualquier lectura o escritura en las colecciones de datos sin autenticación activa (`request.auth != null`). Además, cada colección tiene restricciones por rol: un gerocultor solo puede leer sus propias tareas y los residentes que tiene asignados; el historial de incidencias es de solo creación (`allow create`) y no permite modificaciones ni eliminaciones (`allow update, delete: if false`), garantizando la inmutabilidad del registro.

**Express middleware** completa la protección en la capa API. Cada petición al backend pasa por el middleware `verifyAuth`, que valida el ID token de Firebase con el Admin SDK (`admin.auth().verifyIdToken()`). El acceso a los endpoints de residentes y sus datos de salud se deniega con HTTP 403 si el token no tiene el custom claim de rol adecuado.

El **cifrado en tránsito** está garantizado por Firebase Hosting, que fuerza HTTPS en todas las comunicaciones. Firebase también cifra los datos en reposo en Firestore de forma automática mediante la encriptación estándar de Google Cloud. El **servidor Firestore está configurado en la región `europe-west1` (Bélgica)** para asegurar que los datos residen en territorio de la Unión Europea, condición indispensable para el cumplimiento del RGPD.

Adicionalmente, el sistema no almacena datos sensibles en `localStorage` del navegador. Los tokens de sesión son gestionados íntegramente por el SDK de Firebase Auth en memoria.

## 10.4 Medidas organizativas

El sistema aplica el principio de **acceso mínimo necesario** mediante el modelo RBAC (Control de Acceso Basado en Roles): el gerocultor solo accede a los residentes que tiene asignados a través de la entidad `ResidenteAsignacion`; el coordinador tiene acceso de lectura amplio pero no puede gestionar cuentas; el administrador gestiona usuarios pero no tiene por qué acceder a datos clínicos individuales.

Toda operación sobre datos de residentes queda registrada con usuario, timestamp y acción en la base de datos (RNF-07), proporcionando un **registro de auditoría** que no puede ser modificado por el gerocultor. Esta trazabilidad es fundamental ante cualquier reclamación o inspección.

La **política de retención de datos** está prevista en `SPEC/constraints.md`: el historial debe tener un límite temporal configurable, con posibilidad de anonimización o eliminación de datos a petición [PENDIENTE: definir el valor concreto en semanas o meses, y documentar el procedimiento de eliminación].

En el **entorno de desarrollo**, todos los datos de prueba se generan con `@faker-js/faker`. Ningún entorno del proyecto —desarrollo, staging ni producción académica— contiene PII real ni datos reales de pacientes, tal como exige el ADR-04b.

## 10.5 Limitaciones actuales y líneas de mejora

Las medidas descritas en las secciones anteriores están documentadas en los ADRs y en las especificaciones, pero algunas de ellas están **planificadas y pendientes de implementación completa** en el momento de redactar este borrador:

- La suite de tests automatizados para las Firestore Security Rules (requerida por RNF-09) está prevista pero no ejecutada todavía. Su implementación se realizará durante el sprint de configuración de seguridad.
- El procedimiento formal de ejercicio de derechos ARCO+L (acceso, rectificación, cancelación, oposición y limitación) no está implementado en el MVP. En un despliegue real, el responsable del tratamiento debería habilitar un canal para que los titulares de los datos puedan ejercer estos derechos [PENDIENTE: describir el mecanismo cuando esté disponible].
- El panel de auditoría para que el administrador pueda revisar el registro de accesos es una funcionalidad futura no incluida en el alcance del MVP.

---

*Borrador generado: 2026-04-06 — WRITER agent — GeroCare (gerocultores-system)*  
*Fuentes: SPEC/constraints.md, SPEC/entities.md, DECISIONS/ADR-03b-authentication-firebase.md, DECISIONS/ADR-04b-deployment-rgpd.md, SPEC/requirements.md (RNF-03, RNF-07, RNF-09)*  
*Engram topic key: academic/seguridad-rgpd*
