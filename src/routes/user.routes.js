import {UserController} from '../controllers/user.controller.js'
import { authenticate, authorize } from './middleware/authMiddleware.js'

export async function userRoutes(fastify) {

    // public routes
    fastify.post('/users', UserController.createUser);
    fastify.post('/users/login', UserController.loginUser);
    fastify.post('/users/google', UserController.googleLogin);
    fastify.post('/users/refresh', UserController.refreshToken);

    fastify.register(async function (fastify) {
        
        fastify.addHook('preHandler', authenticate);

        // protected routes
        fastify.get('/users',
            {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'avancai_lider',
                    'departamento_lider',
                    'christian_group_lider',
                    'facilitador',
                    'secretaria_cura',
                    'tesouraria'
                ])
            }, UserController.getAllUsers);
        fastify.get('/users/:id', UserController.getUserById);
        fastify.patch('/users/:id', UserController.updateUser);
        fastify.post('/users/:id/password', UserController.updatePassword);
        fastify.delete('/users/:id', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                ])
            }, UserController.deleteUser);
        fastify.post('/users/logout', UserController.logoutUser);
        fastify.post('/users/facilitator', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'christian_group_lider',
                    'facilitador',
                ])
            }, UserController.createFacilitatorUser);
        fastify.patch('/users/facilitator/:id', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                    'christian_group_lider',
                    'facilitador',
                ])
            }, UserController.updateFacilitatorUser);
        fastify.patch('/users/:id/roles', {
                preHandler: authorize([
                    'super_admin',
                    'pastor_local',
                ])
            }, UserController.updateUserRoles);
    })
}