import type { UserConfig } from '@commitlint/types';
const configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 150], // longitud maxima
    'type-enum': [
      2,
      'always',
      [
        'feat', //      🚀 Nueva funcionalidad.
        'fix', //       🐞 Corrección de errores.
        'perf', //      ⚡ Mejoras de rendimiento(performance).
        'refactor', //  ♻️ Cambios en el código que no afectan el comportamiento.
        'test', //      🧪 cambios en pruebas unitarias o de integración.
        'build', //     🏗️ Cambios en el sistema de construcción (webpack, tsc).
        'ci', //        🔧 Configuración de CI/CD.
        'docs', //      📚 Cambios en la documentación.
        'revert', //    ⏪ reversion de commit.
        'style', //     💄 Cambios en el formato del código o aplicacion de linter
        'chore', //     📦 Mantenimiento (dependencias, configuración, scripts)
      ],
    ],
  },
};

module.exports = configuration;

// estructura de un mensaje de commit validado por commitlint
// type(modulo): mensaje descriptivo del commit ,jira/DT-1015

// ejemplos

// feat: se agrego el modulo de agendas con su crud ,jira/DT-1017
// fix(notificaciones): se corrigio el error de notificaciones de abrir el documento pdf ,jira/DT-1016
