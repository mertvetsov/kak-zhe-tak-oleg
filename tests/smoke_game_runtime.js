#!/usr/bin/env node
const path = require('node:path');

const noop = () => {};
const handlers = new Map();
const element = name => ({
  name,
  textContent: '',
  disabled: false,
  dataset: {},
  classList: { add: noop, toggle: noop },
  setAttribute: noop,
  addEventListener(type, handler) { handlers.set(`${name}:${type}`, handler); },
});

const overlayTitle = element('overlay-title');
const overlayStatus = element('overlay-status');
const overlay = element('overlay');
overlay.querySelector = selector => selector === 'strong' ? overlayTitle : overlayStatus;
const start = element('start');
const pause = element('pause');
const sound = element('sound');
const gameStatus = element('game-status');
const laneButtons = Array.from({ length: 4 }, (_, lane) => {
  const button = element(`lane-${lane}`);
  button.dataset.lane = String(lane);
  return button;
});

const context = new Proxy({
  measureText: text => ({ width: String(text).length * 20 }),
}, {
  get(target, property) { return property in target ? target[property] : noop; },
  set(target, property, value) { target[property] = value; return true; },
});
const canvas = { width: 960, height: 600, getContext: () => context };

global.Image = class Image {
  constructor() { this.complete = true; this.naturalWidth = 2048; this.naturalHeight = 640; }
  set src(value) {
    this._src = value;
    if (value.includes('investor-') && value.includes('-v3.png')) this.naturalHeight = 292;
    if (value.includes('item-') && value.includes('-v3.png')) this.naturalHeight = 341;
  }
  get src() { return this._src; }
  addEventListener() {}
};

global.document = {
  documentElement: {},
  querySelector(selector) {
    return ({ '#game': canvas, '#overlay': overlay, '#start': start, '#pause': pause, '#sound': sound, '#game-status': gameStatus })[selector];
  },
  querySelectorAll: () => laneButtons,
};
global.localStorage = { getItem: () => null, setItem: noop };
global.getComputedStyle = () => ({ getPropertyValue: () => '#26301d' });
global.fetch = async () => ({ ok: true, json: async () => ({ catch: ['ok'], unicorn: ['ok'], toxic: ['ok'] }) });
global.addEventListener = noop;
global.window = global;

let nextFrame;
global.requestAnimationFrame = callback => { nextFrame = callback; return 1; };

require(path.join(__dirname, '..', 'game.js'));

(async () => {
  await new Promise(resolve => setImmediate(resolve));
  if (start.disabled) throw new Error('assets never became ready');
  handlers.get('start:click')();

  const startedAt = performance.now();
  for (let index = 1; index <= 600; index += 1) {
    const callback = nextFrame;
    if (typeof callback !== 'function') throw new Error('animation loop stopped');
    callback(startedAt + index * 40);
    if (index % 35 === 0) handlers.get(`lane-${index % 4}:pointerdown`)();
  }

  if (!gameStatus.textContent.includes('жизни')) throw new Error('game status was not rendered');
  console.log('game runtime smoke test passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
