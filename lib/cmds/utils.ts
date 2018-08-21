import * as yargs from 'yargs';
import { Options } from './options';
import { ChromeDriver } from '../provider/chromedriver';
import { GeckoDriver } from '../provider/geckodriver';
import { IEDriver } from '../provider/iedriver';
import { SeleniumServer } from '../provider/selenium_server';

/**
 * A provider name that webdriver-manager can download.
 */
export enum Provider {
  ChromeDriver,
  GeckoDriver,
  IEDriver,
  Selenium,
}

/**
 * A helper method to initialize the options object. This is a simplified
 * way of creating an option. If a full set of options need be generated,
 * refer to the Options interface.
 * @param providers A list of enums that represent the providers to construct.
 * @param runAsDetach To detach and return to the parent process.
 * @param runAsNode To run the selenium server with role = node.
 * @returns An options object.
 */
export function initOptions(
    providers: Provider[],
    runAsDetach?: boolean,
    runAsNode?: boolean): Options {
  let options: Options = {
    providers: [],
    server: {}
  };
  for (let provider of providers) {
    if (provider === Provider.ChromeDriver) {
      options.providers.push({binary: new ChromeDriver()});
    } else if (provider === Provider.GeckoDriver) {
      options.providers.push({binary: new GeckoDriver()});
    } else if (provider === Provider.IEDriver) {
      options.providers.push({binary: new IEDriver()});
    } else if (provider === Provider.Selenium) {
      options.server.binary = new SeleniumServer();
      options.server.runAsDetach = runAsDetach;
      options.server.runAsNode = runAsNode;
    }
  }
  return options;
}

/**
 * Create the options with all providers.
 * @param argv
 */
export function constructAllProviders(argv: yargs.Arguments): Options {
  let providerConfig = {
    ignoreSSL: argv.ignore_ssl,
    outDir: argv.out_dir,
    proxy: argv.proxy
  };

  let versionsChrome, versionsGecko, versionsIe, versionsStandalone = undefined;
  if (argv.versions) {
    versionsChrome = argv.versions.chrome;
    versionsGecko = argv.versions.gecko;
    versionsIe = argv.versions.ie;
    versionsStandalone = argv.versions.standalone;
  }

  return {
    providers: [{
      name: 'chromedriver',
      binary: new ChromeDriver(providerConfig),
      version: versionsChrome
    }, {
      name: 'geckodriver',
      binary: new GeckoDriver(providerConfig),
      version: versionsGecko
    }, {
      name: 'iedriver',
      binary: new IEDriver(providerConfig),
      version: versionsIe
    }],
    server: {
      name: 'selenium',
      binary: new SeleniumServer(providerConfig),
      version: versionsStandalone,
      runAsNode: argv.standalone_node,
      runAsDetach: argv.detach
    },
    ignoreSSL: argv.ignore_ssl,
    outDir: argv.out_dir,
    proxy: argv.proxy,
  };
}

/**
 * Create the options with providers depending on argv's.
 * @param argv
 */
export function constructProviders(argv: yargs.Arguments): Options {
  let options: Options = {
    providers: [],
    server: {},
    ignoreSSL: argv.ignore_ssl,
    outDir: argv.out_dir,
    proxy: argv.proxy,
  };

  let providerConfig = {
    outDir: options.outDir,
    proxy: options.proxy,
    ignoreSSL: options.ignoreSSL
  };

  let versionsChrome, versionsGecko, versionsIe, versionsStandalone = undefined;
  if (argv.versions) {
    versionsChrome = argv.versions.chrome;
    versionsGecko = argv.versions.gecko;
    versionsIe = argv.versions.ie;
    versionsStandalone = argv.versions.standalone;
  }

  if (argv.chrome) {
    options.providers.push({
      name: 'chromedriver',
      binary: new ChromeDriver(providerConfig),
      version: versionsChrome
    });
  }
  if (argv.gecko) {
    options.providers.push({
      name: 'geckodriver',
      binary: new GeckoDriver(providerConfig),
      version: versionsGecko
    });
  }
  if (argv.ie) {
    options.providers.push({
      name: 'iedriver',
      binary: new IEDriver(providerConfig),
      version: versionsIe
    });
  }
  if (argv.standalone) {
    options.server.name = 'selenium';
    options.server.binary = new SeleniumServer(providerConfig);
    options.server.version = versionsStandalone;
    options.server.runAsNode = argv.standalone_node;
    options.server.chrome_logs = argv.chrome_logs;
    options.server.edge = argv.edge;
    options.server.runAsDetach = argv.detach;
  }
  return options;
}