/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const logoutBtn = document.querySelector('#logout');

if (logoutBtn) {
  const logout = async () => {
    try {
      await axios.get('/api/v1/users/logout');
      showAlert({ message: 'Successfully logged out!', type: 'success' });
      setTimeout(() => {
        location.assign('/');
      }, 500);
    } catch (error) {
      const { data } = error.response;
      const { message } = data;
      showAlert({ message, type: 'error' });
    }
  };
  logoutBtn.addEventListener('click', logout);
}
