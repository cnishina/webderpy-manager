import * as fs from 'fs';
import * as log from 'loglevel';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {SeleniumServer} from '../provider/selenium_server';
import {clean} from './clean';
import {start} from './start';
import {status} from './status';
import {update} from './update';
import {constructAllProviders, constructProviders,} from './utils';

log.setLevel('debug');

describe('using the cli', () => {
  const tmpDir = path.resolve(os.tmpdir(), 'test');
  const origTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    try {
      fs.mkdirSync(tmpDir);
    } catch (err) {
    }
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = origTimeout;
    try {
      rimraf.sync(tmpDir);
    } catch (err) {
    }
  });

  describe('a user runs update', () => {
    it('should download the files', async () => {
      const argv = {
        _: ['foobar'],
        chrome: true,
        standalone: true,
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructProviders(argv);
      await update(options);
      const existFiles = fs.readdirSync(tmpDir);
      expect(existFiles.length).toBe(7);
    });
  });

  describe('a user runs status', () => {
    it('should get the list of versions', () => {
      const argv = {
        _: ['foobar'],
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructAllProviders(argv);
      const statusLog = status(options);
      log.debug(statusLog);
      const lines = statusLog.split('\n');
      expect(lines.length).toBe(2);
    });
  });

  describe('a user runs start', () => {
    it('should start the selenium server standalone in role=node', async () => {
      const argv = {
        _: ['foobar'],
        chrome: true,
        standalone: true,
        standalone_node: true,
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructProviders(argv);
      // Do not await this promise to start the server since the promise is
      // never resolved by waiting, it is either killed by pid or get request.
      const startProcess = start(options);

      // Arbitrarily wait for the server to start.
      await new Promise((resolve, _) => {
        setTimeout(resolve, 3000);
      });
      const seleniumServer = (options.server.binary as SeleniumServer);
      expect(seleniumServer.seleniumProcess).toBeTruthy();
      expect(seleniumServer.seleniumProcess.pid).toBeTruthy();

      // Stop the server using the get request.
      expect(seleniumServer.runAsNode).toBeTruthy();
      await seleniumServer.stopServer();

      // Check to see that the exit code is 0.
      expect(await startProcess).toBe(0);
    });

    it('should start the selenium server standalone', async () => {
      const argv = {
        _: ['foobar'],
        chrome: true,
        standalone: true,
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructProviders(argv);
      // Do not await this promise to start the server since the promise is
      // never resolved by waiting, it is either killed by pid or get request.
      const startProcess = start(options);

      // Arbitrarily wait for the server to start.
      await new Promise((resolve, _) => {
        setTimeout(resolve, 3000);
      });
      const seleniumServer = (options.server.binary as SeleniumServer);
      expect(seleniumServer.seleniumProcess).toBeTruthy();
      expect(seleniumServer.seleniumProcess.pid).toBeTruthy();

      // Stop the server using the get request.
      expect(seleniumServer.runAsNode).toBeFalsy();
      await seleniumServer.stopServer();

      // Check to see that the exit code is greater than 1.
      // Observed to be 1 and sometimes 143.
      expect(await startProcess).toBeGreaterThanOrEqual(1);
    });
  });

  describe('a user runs clean', () => {
    it('should remove the files', () => {
      const argv = {
        _: ['foobar'],
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructAllProviders(argv);
      const cleanLogs = clean(options);
      log.debug(cleanLogs);
      const lines = cleanLogs.split('\n');
      expect(lines.length).toBe(7);
      const existFiles = fs.readdirSync(tmpDir);
      expect(existFiles.length).toBe(0);
    });
  });
});
