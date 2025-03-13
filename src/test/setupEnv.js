/**
 * Setup file for Jest environment
 */
const { TextEncoder, TextDecoder } = require('util');
const nodeFetch = require('node-fetch');

// Add TextEncoder and TextDecoder to global
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add fetch API to global
global.Response = nodeFetch.Response;
global.Request = nodeFetch.Request;
global.Headers = nodeFetch.Headers;
global.fetch = nodeFetch;

// Mock BroadcastChannel for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor() {
    this.name = 'mock-broadcast-channel';
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}; 