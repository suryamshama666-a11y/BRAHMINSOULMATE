{
  "apps": [
    {
      "name": "brahmin-soulmate-backend",
      "script": "dist/server.js",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production"
      },
      "env_production": {
        "NODE_ENV": "production"
      },
      "max_memory_restart": "500M",
      "restart_delay": 4000,
      "error_log": "/var/log/pm2/brahmin-soulmate-backend-error.log",
      "out_log": "/var/log/pm2/brahmin-soulmate-backend-out.log",
      "log_log": "/var/log/pm2/brahmin-soulmate-backend-combined.log",
      "time": true,
      "watch": false,
      "max_restarts": 10,
      "min_uptime": "10s",
      "autorestart": true,
      "shutdown_with_message": true,
      "kill_timeout": 5000,
      "listen_timeout": 3000,
      "wait_ready": true,
      "ready_timeout": 10000
    }
  ]
}