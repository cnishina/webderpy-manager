import * as fs from 'fs';
import * as log from 'loglevel';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {status} from './status';
import {constructAllProviders} from './utils';

log.setLevel('debug');

describe('using the cli', () => {
  const tmpDir = path.resolve(os.tmpdir(), 'test');

  afterEach(() => {
    try {
      rimraf.sync(tmpDir);
    } catch (err) {
    }
  });

  describe('a user runs status', () => {
    it('should log an empty string when folder does not exist', () => {
      const argv = {
        _: ['foobar'],
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructAllProviders(argv);
      const statusLog = status(options);
      expect(statusLog).toBe('');
    });

    it('should log an empty string when folder is empty', () => {
      fs.mkdirSync(tmpDir);
      const argv = {
        _: ['foobar'],
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructAllProviders(argv);
      const statusLog = status(options);
      expect(statusLog).toBe('');
    });
  });
});