module.exports = {
  apps: [
    {
      name: 'go-cycle',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster', // Enable cluster mode
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
