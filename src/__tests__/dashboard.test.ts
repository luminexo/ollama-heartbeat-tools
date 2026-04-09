import { startDashboard } from '../dashboard';
import http from 'http';

describe('Dashboard', () => {
  let server: http.Server | undefined;

  afterEach((done) => {
    if (server) {
      server.close(() => {
        server = undefined;
        done();
      });
    } else {
      done();
    }
  });

  test('should start server on specified port', (done) => {
    // Mock console.log to prevent output during test
    const originalLog = console.log;
    console.log = jest.fn();
    
    try {
      startDashboard({ port: 3456 });
      
      // Wait a moment for server to start
      setTimeout(() => {
        http.get('http://localhost:3456/health', (res) => {
          expect(res.statusCode).toBe(200);
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            const body = JSON.parse(data);
            expect(body.status).toBe('healthy');
            expect(body.version).toBe('0.1.0');
            expect(body.uptime).toBeGreaterThan(0);
            expect(body.timestamp).toBeDefined();
            console.log = originalLog;
            done();
          });
        });
      }, 100);
    } catch (err) {
      console.log = originalLog;
      done(err);
    }
  }, 10000);

  test('/status endpoint returns project status', (done) => {
    const originalLog = console.log;
    console.log = jest.fn();
    
    try {
      startDashboard({ port: 3457 });
      
      setTimeout(() => {
        http.get('http://localhost:3457/status', (res) => {
          expect(res.statusCode).toBe(200);
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            const body = JSON.parse(data);
            expect(body.name).toBeDefined();
            expect(body.version).toBeDefined();
            expect(body.timestamp).toBeDefined();
            console.log = originalLog;
            done();
          });
        });
      }, 100);
    } catch (err) {
      console.log = originalLog;
      done(err);
    }
  }, 10000);

  test('root endpoint returns dashboard info', (done) => {
    const originalLog = console.log;
    console.log = jest.fn();
    
    try {
      startDashboard({ port: 3458 });
      
      setTimeout(() => {
        http.get('http://localhost:3458/', (res) => {
          expect(res.statusCode).toBe(200);
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            const body = JSON.parse(data);
            expect(body.message).toBe('Heartbeat Dashboard');
            expect(body.endpoints).toContain('/health');
            expect(body.endpoints).toContain('/status');
            console.log = originalLog;
            done();
          });
        });
      }, 100);
    } catch (err) {
      console.log = originalLog;
      done(err);
    }
  }, 10000);
});
