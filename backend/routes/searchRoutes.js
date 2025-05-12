import express from 'express';

import { getAllClassrooms, getAllSubjects } from "../controllers/searchController.js";


const router = express.Router();

router.get(
  '/get-classrooms' , 
  getAllClassrooms
);

router.get(
  "/get-subjects" ,
  getAllSubjects
);

export default router;