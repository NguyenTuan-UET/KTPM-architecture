import React, { useEffect, useState } from 'react';
import './MonitorHealth.css'; // Import CSS for styling

const MonitorHealth = () => {
  const [healthStatus, setHealthStatus] = useState({
    redis: false,
    rabbitmq: false,
    database: false,
  });

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        setHealthStatus(data.services);
      } catch (error) {
        console.error('Error fetching health status:', error);
        setHealthStatus({
          redis: false,
          rabbitmq: false,
          database: false,
        });
      }
    };

    const interval = setInterval(fetchHealthStatus, 5000);
    fetchHealthStatus();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-status-container">
      <h2 className="health-status-title">System Health Status</h2>
      <ul className="health-status-list">
        <li
          className={`health-status-item ${healthStatus.redis ? 'up' : 'down'}`}
        >
          <span className="service-name">Redis</span>
          <span className="status-icon">{healthStatus.redis ? '✔' : '✘'}</span>
        </li>
        <li
          className={`health-status-item ${healthStatus.rabbitmq ? 'up' : 'down'}`}
        >
          <span className="service-name">RabbitMQ</span>
          <span className="status-icon">{healthStatus.rabbitmq ? '✔' : '✘'}</span>
        </li>
        <li
          className={`health-status-item ${healthStatus.database ? 'up' : 'down'}`}
        >
          <span className="service-name">Database</span>
          <span className="status-icon">{healthStatus.database ? '✔' : '✘'}</span>
        </li>
      </ul>
    </div>
  );
};

export default MonitorHealth;
