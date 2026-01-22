import express from 'express';
import { courseFaqController } from '../../controllers/courseFaqController.js';

const Router = express.Router();
Router.route("/")
  .get(courseFaqController.getByCourseId)   
  .post(courseFaqController.create); 


export default Router;