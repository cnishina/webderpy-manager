import {
  addHeader,
  initOptions,
  optionsProxy,
  optionsSSL,
  resolveProxy } from './http_utils';

describe('http utils', () => {
  describe('initOptions', () => {
    it('should create options', () => {
      let requestUrl = 'http://foobar.com';
      let options = initOptions(requestUrl, {});
      expect(options['url']).toBe(requestUrl);
      expect(options['timeout']).toBe(240000);
      expect(options['proxy']).toBeUndefined();
      expect(options['strictSSL']).toBeUndefined();
      expect(options['rejectUnauthorized']).toBeUndefined();
    });

    it('should create options with a proxy', () => {
      let requestUrl = 'http://foobar.com';
      let proxy = 'http://baz.com';
      let options = initOptions(requestUrl, { proxy: proxy });
      expect(options['url']).toBe(requestUrl);
      expect(options['timeout']).toBe(240000);
      expect(options['proxy']).toBe(proxy);
      expect(options['strictSSL']).toBeUndefined();
      expect(options['rejectUnauthorized']).toBeUndefined();
    });

    it('should create options with SSL', () => {
      let requestUrl = 'http://foobar.com';
      let options = initOptions(requestUrl, { ignoreSSL: true });
      expect(options['url']).toBe(requestUrl);
      expect(options['timeout']).toBe(240000);
      expect(options['proxy']).toBeUndefined();
      expect(options['strictSSL']).toBeFalsy();
      expect(options['rejectUnauthorized']).toBeFalsy();
    });

    it('should create options with SSL and proxy', () => {
      let requestUrl = 'http://foobar.com';
      let proxy = 'http://baz.com';
      let options = initOptions(requestUrl, { proxy: proxy });
      expect(options['url']).toBe(requestUrl);
      expect(options['timeout']).toBe(240000);
      expect(options['proxy']).toBe(proxy);
      expect(options['strictSSL']).toBeFalsy();
      expect(options['rejectUnauthorized']).toBeFalsy();
    });
  });

  describe('optionsSSL', () => {
    it('should set strictSSL and rejectUnauthorized', () => {
      let options: any = { url: 'http://foobar.com' };
      let ignoreSSL = true;
      options = optionsSSL(options, ignoreSSL);
      expect(options['strictSSL']).toBeFalsy();
      expect(options['rejectUnauthorized']).toBeFalsy();
    });
  
    it('should set not set strictSSL and rejectUnauthorized', () => {
      let options: any = { url: 'http://foobar.com' };
      let ignoreSSL = false;
      options = optionsSSL(options, ignoreSSL);
      expect(options['strictSSL']).toBeUndefined();
      expect(options['rejectUnauthorized']).toBeUndefined();
    });
  });

  describe('optionsProxy', () => {
    it('should set the proxy', () => {
      let requestUrl = 'http://foobar.com';
      let options: any = { url: requestUrl };
      let proxy = 'http://baz.com';
      options = optionsProxy(options, requestUrl, proxy);
      expect(options['proxy']).toBe(proxy);
    });

    it('should not set the proxy when the proxy is undefined', () => {
      let requestUrl = 'http://foobar.com';
      let options: any = { url: requestUrl };
      options = optionsProxy(options, requestUrl, undefined);
      expect(options['proxy']).toBeUndefined();
    });
  });
  
  describe('resolveProxy', () => {
    it('should return the proxy', () => {
      let requestUrl = 'http://foobar.com/foo/bar/index.html';
      let proxy = 'http://baz.com';
      let resolvedProxy = resolveProxy(requestUrl, proxy);
      expect(resolvedProxy).toBe(proxy);
    });

    it('should return the http proxy env for a http request url', () => {
      let requestUrl = 'http://foobar.com/foo/bar/index.html';
      let proxy = 'http://baz.com';
      process.env['HTTP_PROXY'] = proxy;
      expect(process.env['HTTP_PROXY']).toBe(proxy);

      let resolvedProxy = resolveProxy(requestUrl, undefined);
      expect(resolvedProxy).toBe(proxy);

      delete process.env['HTTP_PROXY'];
      expect(process.env['HTTP_PROXY']).toBeUndefined();
    });

    it('should be undefined for a https proxy env for a http request', () => {
      let requestUrl = 'http://foobar.com/foo/bar/index.html';
      let proxy = 'https://baz.com';
      process.env['HTTPS_PROXY'] = proxy;
      expect(process.env['HTTPS_PROXY']).toBe(proxy);

      let resolvedProxy = resolveProxy(requestUrl, undefined);
      expect(resolvedProxy).toBeUndefined();

      delete process.env['HTTPS_PROXY'];
      expect(process.env['HTTPS_PROXY']).toBeUndefined();
    });


    it('should return the https proxy env for a https request', () => {
      let requestUrl = 'https://foobar.com/foo/bar/index.html';
      let proxy = 'https://baz.com';
      process.env['HTTPS_PROXY'] = proxy;
      expect(process.env['HTTPS_PROXY']).toBe(proxy);

      let resolvedProxy = resolveProxy(requestUrl, undefined);
      expect(resolvedProxy).toBe(proxy);

      delete process.env['HTTPS_PROXY'];
      expect(process.env['HTTPS_PROXY']).toBeUndefined();
    });

    it('should return the http proxy env for a https request', () => {
      let requestUrl = 'https://foobar.com/foo/bar/index.html';
      let proxy = 'http://baz.com';
      process.env['HTTP_PROXY'] = proxy;
      expect(process.env['HTTP_PROXY']).toBe(proxy);

      let resolvedProxy = resolveProxy(requestUrl, undefined);
      expect(resolvedProxy).toBe(proxy);

      delete process.env['HTTP_PROXY'];
      expect(process.env['HTTP_PROXY']).toBeUndefined();
    });
  });

  describe('addHeader', () => {
    let options: any;
    beforeEach(() => {
      options = {
        url: 'http://foo.bar'
      };
    })
    it('should create a new header if no header exists', () => {
      let modifiedOptions = addHeader(options, 'foo', 'bar');
      expect(modifiedOptions.headers).toBeTruthy();
      expect(Object.keys(modifiedOptions.headers).length).toBe(1);
      expect(modifiedOptions.headers['foo']).toBe('bar');
    });

    it('should add a header to an existing header without destroying the value', () => {
      let modifiedOptions = addHeader(options, 'foo1', 'bar1');
      modifiedOptions = addHeader(options, 'foo2', 'bar2');
      expect(modifiedOptions.headers).toBeTruthy();
      expect(Object.keys(modifiedOptions.headers).length).toBe(2);
      expect(modifiedOptions.headers['foo1']).toBe('bar1');
      expect(modifiedOptions.headers['foo2']).toBe('bar2');
    });

    it('should replace the header if selecting the same header name', () => {
      let modifiedOptions = addHeader(options, 'foo', 'bar');
      expect(modifiedOptions.headers).toBeTruthy();
      expect(Object.keys(modifiedOptions.headers).length).toBe(1);
      expect(modifiedOptions.headers['foo']).toBe('bar');

      modifiedOptions = addHeader(options, 'foo', 'baz');
      expect(Object.keys(modifiedOptions.headers).length).toBe(1);
      expect(modifiedOptions.headers['foo']).toBe('baz');
    });
  });
});