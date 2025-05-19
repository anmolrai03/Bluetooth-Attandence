// // useBLE.js - Fixed implementation
// import { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-toastify';

// const useBLE = () => {
//   const [isScanning, setIsScanning] = useState(false);
//   const [currentDevice, setCurrentDevice] = useState(null);
//   const [devicesInRange, setDevicesInRange] = useState([]);
//   const [rssiThreshold, setRssiThreshold] = useState(-55);
//   const [bluetoothAvailable, setBluetoothAvailable] = useState(false);
//   const [advertisementHandler, setAdvertisementHandler] = useState(null);

//   // Fixed event handler reference
//   const handleAvailabilityChanged = useCallback((event) => {
//     setBluetoothAvailable(event.value);
//   }, []);

//   useEffect(() => {
//     const checkBluetooth = async () => {
//       try {
//         if (navigator.bluetooth) {
//           const available = await navigator.bluetooth.getAvailability();
//           setBluetoothAvailable(available);
//           navigator.bluetooth.addEventListener('availabilitychanged', handleAvailabilityChanged);
//         }
//       } catch (error) {
//         toast.error('Bluetooth check failed');
//       }
//     };

//     checkBluetooth();
//     return () => {
//       if (navigator.bluetooth) {
//         navigator.bluetooth.removeEventListener('availabilitychanged', handleAvailabilityChanged);
//       }
//     };
//   }, [handleAvailabilityChanged]);

//   // Fixed scanning functions
//   const startScan = useCallback(async () => {
//     if (!bluetoothAvailable) {
//       toast.error('Bluetooth unavailable');
//       return;
//     }

//     try {
//       const device = await navigator.bluetooth.requestDevice({
//         acceptAllDevices: true,
//         optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb']
//       });

//       const handleAdvertisement = (event) => {
//         setDevicesInRange(prev => [...prev, {
//           id: event.device.id,
//           rssi: event.rssi,
//           timestamp: new Date(),
//           inRange: event.rssi >= rssiThreshold
//         }]);
//       };

//       device.addEventListener('advertisementreceived', handleAdvertisement);
//       setAdvertisementHandler(() => handleAdvertisement);
//       await device.watchAdvertisements();
//       setCurrentDevice(device);
//       setIsScanning(true);
//     } catch (error) {
//       toast.error('BLE scan failed');
//     }
//   }, [bluetoothAvailable, rssiThreshold]);

//   const stopScan = useCallback(() => {
//     if (currentDevice && advertisementHandler) {
//       currentDevice.removeEventListener('advertisementreceived', advertisementHandler);
//       currentDevice.unwatchAdvertisements();
//       setCurrentDevice(null);
//       setIsScanning(false);
//       setDevicesInRange([]);
//     }
//   }, [currentDevice, advertisementHandler]);

//   return {
//     isScanning,
//     bluetoothAvailable,
//     devicesInRange,
//     rssiThreshold,
//     setRssiThreshold,
//     startScan,
//     stopScan,
//     verifyProximity: useCallback(async (expectedDeviceId) => {
//       const targetDevice = devicesInRange.find(d => d.id === expectedDeviceId);
//       return {
//         valid: targetDevice?.inRange || false,
//         rssi: targetDevice?.rssi || null
//       };
//     }, [devicesInRange])
//   };
// };

// export default useBLE;



import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const useBLE = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState(new Map());
  const [rssiThreshold] = useState(-75); // Matches backend validation range
  const bluetoothAvailable = useRef(false);
  const deviceRef = useRef(null);
  const advertisementHandler = useRef(null);

  // Stable event handlers
  const handleAvailabilityChanged = useCallback((event) => {
    bluetoothAvailable.current = event.value;
  }, []);

  // Device management
  const updateDevice = useCallback((id, rssi) => {
    setDevices(prev => new Map(prev).set(id, {
      rssi,
      timestamp: Date.now(),
      inRange: rssi >= rssiThreshold
    }));
  }, [rssiThreshold]);

  // Cleanup handler
  const cleanup = useCallback(() => {
    if (deviceRef.current) {
      deviceRef.current.removeEventListener('advertisementreceived', advertisementHandler.current);
      deviceRef.current.unwatchAdvertisements();
      deviceRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Bluetooth availability check
  useEffect(() => {
    const initBluetooth = async () => {
      try {
        if (navigator.bluetooth) {
          bluetoothAvailable.current = await navigator.bluetooth.getAvailability();
          navigator.bluetooth.addEventListener('availabilitychanged', handleAvailabilityChanged);
        }
      } catch (error) {
        console.error('Bluetooth initialization failed:', error);
      }
    };

    initBluetooth();
    return () => {
      if (navigator.bluetooth) {
        navigator.bluetooth.removeEventListener('availabilitychanged', handleAvailabilityChanged);
      }
      cleanup();
    };
  }, [handleAvailabilityChanged, cleanup]);

  // Scanning functions
  const startScan = useCallback(async () => {
    if (!bluetoothAvailable.current) {
      toast.error('Please enable Bluetooth and try again');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [] // Required for some browsers
      });

      const handler = (event) => {
        updateDevice(event.device.id, event.rssi);
      };

      device.addEventListener('advertisementreceived', handler);
      advertisementHandler.current = handler;
      await device.watchAdvertisements();
      
      deviceRef.current = device;
      setIsScanning(true);
      toast.success('BLE scanning started');

    } catch (error) {
      if (error.name !== 'NotFoundError') {
        toast.error(`BLE error: ${error.message}`);
      }
      cleanup();
    }
  }, [cleanup, updateDevice]);

  const stopScan = useCallback(() => {
    cleanup();
    toast.info('BLE scanning stopped');
  }, [cleanup]);

  // Proximity verification with freshness check (5 seconds)
  const verifyProximity = useCallback((deviceId) => {
    const device = devices.get(deviceId);
    if (!device) return { valid: false, rssi: null };

    // Consider readings older than 5s stale
    const isRecent = (Date.now() - device.timestamp) < 5000;
    return {
      valid: isRecent && device.inRange,
      rssi: isRecent ? device.rssi : null
    };
  }, [devices]);

  return {
    isScanning,
    bluetoothAvailable: bluetoothAvailable.current,
    currentRssi: devices.size > 0 ? Math.max(...Array.from(devices.values()).map(d => d.rssi)) : null,
    startScan,
    stopScan,
    verifyProximity
  };
};

export default useBLE;