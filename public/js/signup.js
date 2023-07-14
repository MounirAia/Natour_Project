/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const form = document.querySelector('#signupForm');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(event.target);
    const requestBody = Object.fromEntries(fd);
    axios
      .post('/api/v1/users/signup', requestBody)
      .then(function (response) {
        const { data } = response;
        const { token } = data;
        if (token) {
          showAlert({ message: 'Successfully signed in!', type: 'success' });
          setTimeout(() => {
            location.assign('/me');
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
