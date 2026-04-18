# ── 1. Multi-stage: Java 21 (Temurin) + Node 24 ───────────────────────────────
# firebase-tools >= 15 requiere Java 21+.
# Usamos eclipse-temurin:21-jre como base e instalamos Node encima,
# evitando repos externos de terceros durante el build.
FROM eclipse-temurin:21-jre-noble

# Usuario no-root para el contenedor
ENV FIREBASE_USER=firebase
ENV FIREBASE_EMULATORS_PATH=/home/firebase/.cache/firebase/emulators

# ── 2. Instalación de Node 24 + curl + usuario no-root ────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
    && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash firebase

# ── 3. Firebase CLI ────────────────────────────────────────────────────────────
# firebase-tools@15 requiere Java 21+ (verificado en runtime)
RUN npm install -g firebase-tools@15.13.0

# ── 4. Pre-descarga de emuladores (como root, en caché compartida) ─────────────
RUN mkdir -p /home/firebase/.cache/firebase/emulators \
    && firebase setup:emulators:firestore \
    && firebase setup:emulators:ui \
    && chown -R firebase:firebase /home/firebase/.cache

# ── 5. Directorio de trabajo y permisos ───────────────────────────────────────
# chmod 777 en /emulator_data para que el bind-mount del host (creado como root)
# sea escribible por el usuario no-root 'firebase' en runtime.
RUN mkdir -p /emulator_data && chmod 777 /emulator_data

USER firebase
WORKDIR /firebase

COPY --chown=firebase:firebase firebase.json firestore.rules .firebaserc ./
COPY --chown=firebase:firebase emulator/entrypoint.sh ./entrypoint.sh

# ── 6. Ports y Healthcheck ─────────────────────────────────────────────────────
EXPOSE 9099 8080 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -sf http://localhost:4000 || exit 1

# ── 7. Ejecución ───────────────────────────────────────────────────────────────
# Usamos un entrypoint propio que captura SIGTERM y hace el export explícito
# antes de matar el proceso. El --export-on-exit nativo no es fiable con Docker
# porque el timeout por defecto (10s) no siempre es suficiente.
ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]