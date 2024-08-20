import React, { useEffect, useState } from 'react';
import connection from '../services/signalRService'; // Adjust the path as needed

const parseTimeSpanToMilliseconds = (timeSpan) => {
    const [hours, minutes, seconds] = timeSpan.split(':').map(Number);
    return ((hours * 60 * 60) + (minutes * 60) + seconds) * 1000;
  };

const TimerComponent = ({ rideId, estimatedWaitTime, estimatedTravelTime,onRideStatusChange }) => {
    const [timeRemaining, setTimeRemaining] = useState(parseTimeSpanToMilliseconds(estimatedWaitTime));
    const [travelTimeRemaining, setTravelTimeRemaining] = useState(parseTimeSpanToMilliseconds(estimatedTravelTime));
    
  
  useEffect(() => {
    const setupConnection = async () => {
        try {
          if (connection.state === 'Connecting' || connection.state === 'Connected') {
            console.log('Connection is already established.');
            return;
          }
          
          await connection.start();
          console.log('SignalR Connected.');
          
          connection.on('MethodNameOnClient', (receivedRideId, receivedTimeRemaining,receivedTravelTimeRemaining) => {
            console.log('Message from server:', receivedRideId, receivedTimeRemaining,receivedTravelTimeRemaining);
            const timeInMilliseconds = parseTimeSpanToMilliseconds(receivedTimeRemaining);
            const timeInMillisecondsTravel = parseTimeSpanToMilliseconds(receivedTravelTimeRemaining);
            setTimeRemaining(timeInMilliseconds);
            setTravelTimeRemaining(timeInMillisecondsTravel);
          });
          
          await connection.invoke('MethodOnServer', rideId, estimatedWaitTime,estimatedTravelTime);
        } catch (err) {
          console.error('SignalR Connection Error:', err);
        }
      };
  
      const cleanupConnection = async () => {
        if (connection.state === 'Connected') {
          await connection.stop();
          console.log('SignalR Disconnected.');
        }
      };
  
      // Prvo očisti postojeću konekciju ako postoji, a zatim uspostavi novu
      cleanupConnection().then(() => setupConnection());
  
      // Očisti konekciju kada se komponenta unmount-uje
      return () => {
        connection.stop();
        console.log('Connection stopped on component unmount.');
      };
    }, [rideId, estimatedWaitTime, estimatedTravelTime]);

    useEffect(() => {
        if (timeRemaining === null || travelTimeRemaining === null) return;
    
        const intervalId = setInterval(() => {
          setTimeRemaining(prevTime => {
            const newTime = prevTime - 1000; // Smanji za 1 sekundu
            return newTime > 0 ? newTime : 0;
          });
          if(timeRemaining === 0){
            setTravelTimeRemaining(prevTime => {
                const newTime = prevTime - 1000; // Smanji za 1 sekundu
                return newTime > 0 ? newTime : 0;
              });
              if(travelTimeRemaining === 0){
                onRideStatusChange(3);
              }
          }         
        }, 1000);
    
        return () => clearInterval(intervalId);
      }, [timeRemaining,travelTimeRemaining,onRideStatusChange]);
      
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div>
      <h3>Time remaining until driver arrives: {formatTime(timeRemaining)}</h3>
      <h3>Time remaining for the ride: {formatTime(travelTimeRemaining)} </h3>
    </div>
  );
};

export default TimerComponent;
