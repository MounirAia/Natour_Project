/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const form = document.querySelector('.login-form .form');

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const { email, password } = event.target;

    axios
      .post('/api/v1/users/login', {
        email: email.value,
        password: password.value,
      })
      .then(function (response) {
        const { data } = response;
        const { token } = data;
        if (token) {
          showAlert({ message: 'Successfully logged in!', type: 'success' });
          setTimeout(() => {
            location.assign('/');
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
