import express from 'express';
import { assessmentController } from '../../controllers/assessmentController.js';

const Router = express.Router();

Router.route('/')
  .post(assessmentController.create);

Router.route('/lecturer-list')
  .get(assessmentController.getLecturerList);

Router.route('/feedback')
  .put(assessmentController.giveFeedback);

Router.route('/:id/submissions')
  .get(assessmentController.getSubmissionList);

Router.route('/:id')
  .get(assessmentController.getOne)
  .put(assessmentController.update)
  .delete(assessmentController.remove);

export default Router;