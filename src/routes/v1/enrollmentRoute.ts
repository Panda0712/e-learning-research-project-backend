import express from 'express';
import { enrollmentController } from '../../controllers/enrollmentController.js';

const Router = express.Router();

Router.route('/')
  .get(enrollmentController.getMyCourses)
  .post(enrollmentController.create);     

export default Router;