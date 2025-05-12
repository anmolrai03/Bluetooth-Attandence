import Subject from '../models/subject.models.js';

import Classroom from '../models/classroom.models.js'

// GET all subjects api starts here
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({}).lean();
    
    res.json({
      success: true,
      count: subjects.length,
      data: subjects.map(subject => ({
        id: subject._id,
        code: subject.code,
        name: subject.name
      }))
    });
    
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// get all subjects api ends here

// GET all classrooms api starts here
const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({}).lean();
    
    res.json({
      success: true,
      count: classrooms.length,
      data: classrooms.map(classroom => ({
        id: classroom._id,
        name: classroom.name
      }))
    });
    
  } catch (err) {
    console.error('Error fetching classrooms:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classrooms',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
//get all classroom api ends here

export { getAllSubjects , getAllClassrooms};