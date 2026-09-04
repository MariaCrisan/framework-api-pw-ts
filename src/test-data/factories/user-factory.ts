import { randomEmail, randomUsername } from '../../utils/random-data';
export const createUserData = () => ({ username: randomUsername(), email: randomEmail() });
