/*eslint-disable */

export const hiddenAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

// type is 'success' or 'error'
export const showAlert = (type, message) => {
  hiddenAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hiddenAlert, 5000);
};
