import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl('http://localhost:9062/timer-hub') // Replace with your SignalR hub URL
  .configureLogging(LogLevel.Information)
  .build();

export default connection;
