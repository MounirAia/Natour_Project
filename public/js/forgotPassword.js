/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const form = document.querySelector('#forgotPasswordForm');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const requestBody = Object.fromEntries(fd);
    axios
      .post('/api/v1/users/forgotPassword', requestBody)
      .then(function (response) {
        const { data } = response;
        const { message, status } = data.data;
        if (message) {
          showAlert({
            message:
              'An email has been sent to the given email to reset your password!',
            type: 'success',
          });
        }
      })
      .catch(function (error) {
        const { data } = error.response;
        const { message } = data;
        showAlert({ message, type: 'error' });
      });
  });
}
