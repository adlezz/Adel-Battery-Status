import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning } from 'lucide-react';

interface BatteryState {
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
}

function App() {
  const [battery, setBattery] = useState<BatteryState | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getBatteryStatus = async () => {
      try {
        // @ts-ignore - Navigator.getBattery() is not in TypeScript types
        const batteryManager = await navigator.getBattery();
        
        const updateBatteryStatus = () => {
          setBattery({
            charging: batteryManager.charging,
            level: batteryManager.level * 100,
            chargingTime: batteryManager.chargingTime,
            dischargingTime: batteryManager.dischargingTime
          });
        };

        // Initial status
        updateBatteryStatus();

        // Add event listeners
        batteryManager.addEventListener('chargingchange', updateBatteryStatus);
        batteryManager.addEventListener('levelchange', updateBatteryStatus);
        batteryManager.addEventListener('chargingtimechange', updateBatteryStatus);
        batteryManager.addEventListener('dischargingtimechange', updateBatteryStatus);

        return () => {
          batteryManager.removeEventListener('chargingchange', updateBatteryStatus);
          batteryManager.removeEventListener('levelchange', updateBatteryStatus);
          batteryManager.removeEventListener('chargingtimechange', updateBatteryStatus);
          batteryManager.removeEventListener('dischargingtimechange', updateBatteryStatus);
        };
      } catch (err) {
        setError('Battery status not available on this device or browser');
      }
    };

    getBatteryStatus();
  }, []);

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-red-500';
    if (level <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <BatteryWarning className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center">
          <div className="relative inline-block">
            {battery?.charging ? (
              <BatteryCharging className={`w-24 h-24 ${getBatteryColor(battery.level)}`} />
            ) : (
              <Battery className={`w-24 h-24 ${battery ? getBatteryColor(battery.level) : 'text-gray-400'}`} />
            )}
          </div>
          
          {battery ? (
            <div className="mt-6 space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">
                {Math.round(battery.level)}%
              </h2>
              <p className="text-gray-600">
                Status: {battery.charging ? 'Charging' : 'Not Charging'}
              </p>
              {battery.charging && battery.chargingTime !== Infinity && (
                <p className="text-sm text-gray-500">
                  Approximately {Math.round(battery.chargingTime / 60)} minutes until full
                </p>
              )}
              {!battery.charging && battery.dischargingTime !== Infinity && (
                <p className="text-sm text-gray-500">
                  Approximately {Math.round(battery.dischargingTime / 60)} minutes remaining
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-gray-600">Loading battery status...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;