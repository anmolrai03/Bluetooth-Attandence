import apiClient from './apiClient';

export const AttendanceService = {
  verify: async (qrData, rssi) => {
    const res = await apiClient.post('/attendance/verify', {
      qrCode: JSON.stringify(qrData),
      rssi
    });
    return res.data;
  },

  getRecords: async ({ subjectId, classroomId, date }) => {
    const res = await apiClient.post('/attendance/records', {
      subjectId,
      classroomId,
      ...(date && { date })
    });
    return res.data.data || []; // return array directly
  },

  updateStatus: async (attendanceId, status) => {
    const res = await apiClient.patch(`/attendance/update/${attendanceId}`, { status });
    return res.data;
  },

  getStudentSummary: async () => {
    const res = await apiClient.get('/attendance/get-attendance');
    return res.data.data || [];
  }
};
