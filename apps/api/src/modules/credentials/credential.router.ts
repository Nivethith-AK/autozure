import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { createCredential, getCredentials, updateCredential, deleteCredential } from './credential.controller';

export const credentialRouter = Router();
credentialRouter.use(authenticate);

credentialRouter.post('/', createCredential);
credentialRouter.get('/', getCredentials);
credentialRouter.patch('/:id', updateCredential);
credentialRouter.delete('/:id', deleteCredential);
