import express from 'express';
import { transactionController } from '../../controllers/transactionController.js';

const Router = express.Router();

Router.route('/')
  .get(transactionController.getHistory)
  .post(transactionController.create)   ;   


export default Router;