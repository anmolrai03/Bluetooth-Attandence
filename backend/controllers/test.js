import Subject from '../models/Subject.js';

export const seedSubjects = async (req, res) => {
  try {
    const subjects = [
      { code: 'CS101', name: 'Computer Science Basics' },
      { code: 'MATH201', name: 'Advanced Mathematics' },
      { code: 'PHY301', name: 'Physics Fundamentals' },
      { code: 'CHEM101', name: 'Intro to Chemistry' },
      { code: 'BIO105', name: 'Biology Essentials' },
    ];

    const inserted = await Subject.insertMany(subjects);
    res.status(201).json({ message: 'Dummy subjects added', data: inserted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed subjects', error: error.message });
  }
};
