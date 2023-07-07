/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const userGeneralInfoForm = document.querySelector('form.form-user-data');
const userPasswordForm = document.querySelector('form.form-user-settings');

if (userGeneralInfoForm) {
  userGeneralInfoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const { email, name } = event.target;
    axios
      .patch('/api/v1/users/updateMe', {
        email: email.value,
        name: name.value,
      })
      .then(function (response) {
        const { data } = response;
        const { message } = data.data;
        showAlert({ message, type: 'success' });
        setTimeout(() => {
          location.reload();
        }, 1500);
      })
      .catch(function (error) {
        const { data } = error.response;
        const { message } = data;
        showAlert({ message, type: 'error' });
      });
  });

  userPasswordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const oldPassword = event.target['password-current'].value;
    const newPassword = event.target['password'].value;
    const passwordConfirm = event.target['password-confirm'].value;
    axios
      .patch('/api/v1/users/updatePassword', {
        oldPassword,
        newPassword,
        passwordConfirm,
      })
      .then(function (response) {
        const { data } = response;
        const { message } = data.data;
        showAlert({ message, type: 'success' });
        setTimeout(() => {
          location.assign('/login');
        }, 1500);
      })
      .catch(function (error) {
        const { data } = error.response;
        const { message } = data;
        showAlert({ message, type: 'error' });
      });
  });
}
