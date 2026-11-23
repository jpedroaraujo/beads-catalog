import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom não implementa a top layer/modalidade do navegador.
// Estes métodos só permitem testar o ciclo de vida e os eventos do componente.
if (
  typeof HTMLDialogElement !== 'undefined' &&
  !HTMLDialogElement.prototype.showModal
) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
}
if (
  typeof HTMLDialogElement !== 'undefined' &&
  !HTMLDialogElement.prototype.close
) {
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
}
