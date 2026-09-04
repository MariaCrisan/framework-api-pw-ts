import { randomEmail, randomUsername } from '../utils/random-data';

export const validUserTemplate = () => ({
  username: randomUsername(),
  email: randomEmail()
});
