/* eslint-disable */

const hideAlert = () => {
  const alert = document.querySelector('.alert');
  if (alert) alert.remove();
};

export const showAlert = (parameters) => {
  hideAlert();
  const { message, type } = parameters;
  const alertDiv = document.createElement('div');
  alertDiv.classList.add(`alert`);
  alertDiv.classList.add(`alert--${type}`);
  alertDiv.innerHTML = message;
  document.body.appendChild(alertDiv);
  window.setTimeout(hideAlert, 5000);
};
