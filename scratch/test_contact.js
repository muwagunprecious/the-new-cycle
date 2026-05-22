import { getContactMessages } from './backend-actions/actions/contact.js';

(async () => {
  const res = await getContactMessages();
  console.log('Result:', res);
})();
