import express from 'express';
import { transactionStudentController } from '../../controllers/transactionStudentController.js';

const Router = express.Router();

Router.route('/course-sales')
  .get(transactionStudentController.getCourseSales);

export default Router;