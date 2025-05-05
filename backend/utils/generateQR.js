import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (err) {
    console.error('QR generation failed:', err);
    throw err;
  }
};