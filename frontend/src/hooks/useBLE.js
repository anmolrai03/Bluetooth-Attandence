// useBLE.js - Fixed implementation
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const useBLE = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [devicesInRange, setDevicesInRange] = useState([]);
  const [rssiThreshold, setRssiThreshold] = useState(-55);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(false);
  const [advertisementHandler, setAdvertisementHandler] = useState(null);

  // Fixed event handler reference
  const handleAvailabilityChanged = useCallback((event) => {
    setBluetoothAvailable(event.value);
  }, []);

  useEffect(() => {
    const checkBluetooth = async () => {
      try {
        if (navigator.bluetooth) {
          const available = await navigator.bluetooth.getAvailability();
          setBluetoothAvailable(available);
          navigator.bluetooth.addEventListener('availabilitychanged', handleAvailabilityChanged);
        }
      } catch (error) {
        toast.error('Bluetooth check failed');
      }
    };

    checkBluetooth();
    return () => {
      if (navigator.bluetooth) {
        navigator.bluetooth.removeEventListener('availabilitychanged', handleAvailabilityChanged);
      }
    };
  }, [handleAvailabilityChanged]);

  // Fixed scanning functions
  const startScan = useCallback(async () => {
    if (!bluetoothAvailable) {
      toast.error('Bluetooth unavailable');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb']
      });

      const handleAdvertisement = (event) => {
        setDevicesInRange(prev => [...prev, {
          id: event.device.id,
          rssi: event.rssi,
          timestamp: new Date(),
          inRange: event.rssi >= rssiThreshold
        }]);
      };

      device.addEventListener('advertisementreceived', handleAdvertisement);
      setAdvertisementHandler(() => handleAdvertisement);
      await device.watchAdvertisements();
      setCurrentDevice(device);
      setIsScanning(true);
    } catch (error) {
      toast.error('BLE scan failed');
    }
  }, [bluetoothAvailable, rssiThreshold]);

  const stopScan = useCallback(() => {
    if (currentDevice && advertisementHandler) {
      currentDevice.removeEventListener('advertisementreceived', advertisementHandler);
      currentDevice.unwatchAdvertisements();
      setCurrentDevice(null);
      setIsScanning(false);
      setDevicesInRange([]);
    }
  }, [currentDevice, advertisementHandler]);

  return {
    isScanning,
    bluetoothAvailable,
    devicesInRange,
    rssiThreshold,
    setRssiThreshold,
    startScan,
    stopScan,
    verifyProximity: useCallback(async (expectedDeviceId) => {
      const targetDevice = devicesInRange.find(d => d.id === expectedDeviceId);
      return {
        valid: targetDevice?.inRange || false,
        rssi: targetDevice?.rssi || null
      };
    }, [devicesInRange])
  };
};

export default useBLE;