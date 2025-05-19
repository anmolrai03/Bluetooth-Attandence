import apiClient from './apiClient';

export const AttendanceService = {
  verify: async (qrData, rssi) => {
    try {
      const response = await apiClient.post('/attendance/verify', {
        qrCode: JSON.stringify(qrData),
        rssi
      });
      return response.data;
    } catch (error) {
      // Return unified error format
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        data: error.data,
        status: error.response?.status
      };
    }
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
    // console.log("api", res.data);
    // console.log(res.data.data);
    return res.data || [];
  }
};
