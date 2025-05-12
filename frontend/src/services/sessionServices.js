import axios from 'axios';

export const startSession = async (classroomId, subjectId) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/session/start`,
    { classroom: classroomId, subject: subjectId }
  );
  return response.data;
};

export const terminateSession = async (sessionId) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/session/terminate/${sessionId}`
  );
  return response.data;
};
