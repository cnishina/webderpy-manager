import * as fs from 'fs';
import * as log from 'loglevel';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {clean} from './clean';
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

  describe('a user runs clean', () => {
    it('should not log or throw errors if no folder exists', () => {
      const argv = {
        _: ['foobar'],
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructAllProviders(argv);
      const statusLog = clean(options);
      expect(statusLog).toBe('');
    });

    it('should not log or throw errors if empty folder exists', () => {
      fs.mkdirSync(tmpDir);
      const argv = {
        _: ['foobar'],
        out_dir: tmpDir,
        '$0': 'bin\\webdriver-manager'
      };
      const options = constructAllProviders(argv);
      const statusLog = clean(options);
      expect(statusLog).toBe('');
    });
  });
});