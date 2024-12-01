const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/bin/main.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'build-dev/src/bin/main.js',
  external: [
    'class-transformer/storage',
    '@nestjs/microservices',
    '@nestjs/websockets',
    'ioredis',
    'nats',
    'mqtt',
    'kafkajs',
    'amqplib',
    '@nestjs/platform-socket.io'
  ],
  sourcemap: true,
  minify: true,
}); 