import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {checkConnectivity} from '../../spec/support/helpers/test_utils';

import {IEDriver, semanticVersionParser, versionParser} from './iedriver';
import {convertXmlToVersionList} from './utils/cloud_storage_xml';
import {getVersion} from './utils/version_list';

describe('iedriver', () => {
  describe('class IE Driver', () => {
    const tmpDir = path.resolve(os.tmpdir(), 'test');
    const origTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

    beforeEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
      try {
        fs.mkdirSync(tmpDir);
      } catch (err) {
      }
    });

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = origTimeout;
      try {
        rimraf.sync(tmpDir);
      } catch (err) {
      }
    });

    it('should download the file', async (done) => {
      if (!await checkConnectivity('update binary for windows test')) {
        done();
      }
      const ieDriver =
          new IEDriver({outDir: tmpDir, osType: 'Windows_NT', osArch: 'x64'});
      await ieDriver.updateBinary();

      const configFile = path.resolve(tmpDir, 'iedriver.config.json');
      const xmlFile = path.resolve(tmpDir, 'iedriver.xml');
      expect(fs.statSync(configFile).size).toBeTruthy();
      expect(fs.statSync(xmlFile).size).toBeTruthy();

      const versionList = convertXmlToVersionList(
          xmlFile, 'IEDriverServer_', versionParser, semanticVersionParser);
      const versionObj = getVersion(versionList, '');
      const executableFile =
          path.resolve(tmpDir, 'IEDriverServer_' + versionObj.version + '.exe');
      expect(fs.statSync(executableFile).size).toBeTruthy();
      done();
    });
  });
});