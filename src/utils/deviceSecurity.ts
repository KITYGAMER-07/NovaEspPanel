// Helper utilities for device fingerprinting, session lock, and browser security

export const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem('nova_device_signature');
  if (!deviceId) {
    deviceId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    localStorage.setItem('nova_device_signature', deviceId);
  }
  return deviceId;
};

export const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  let browser = 'Browser';
  let os = 'Device';

  if (ua.includes('Win')) os = 'Windows PC';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Device';
  else if (ua.includes('Linux')) os = 'Linux PC';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  return `${browser} on ${os}`;
};
