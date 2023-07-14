/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const form = document.querySelector('#resetPasswordForm');

if (form) {
  window.addEventListener('load', () => {
    const params = new URL(document.location).searchParams;
    const emailInput = document.querySelector('#email');
    emailInput.value = params.get('email');

    const tokenInput = document.querySelector('#token');
    tokenInput.value = params.get('token');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const requestBody = Object.fromEntries(fd);
    axios
      .patch('/api/v1/users/resetPassword', requestBody)
      .then(function (response) {
        console.log(response);
        const { data } = response;
        const { message } = data.data;
        if (message) {
          showAlert({
            message,
            type: 'success',
          });
          setTimeout(() => {
            location.assign('/login');
          }, 1500);
        }
      })
      .catch(function (error) {
        const { data } = error.response;
        const { message } = data;
        showAlert({ message, type: 'error' });
      });
  });
}
