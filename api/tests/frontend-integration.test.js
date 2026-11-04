const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const behaviors = require('../services/zmk/data/zmk-behaviors.json');

function keyBy(arr, key) {
  return (arr || []).reduce((acc, item) => {
    if (item && item[key]) acc[item[key]] = item;
    return acc;
  }, {});
}

function getBehaviourParams(parsedParams, behaviour) {
  if (!behaviour) return [];
  const firstParsedParam = (parsedParams && parsedParams[0]) || {};
  const commands = keyBy(behaviour.commands || [], 'code');
  const firstParam = behaviour.params && behaviour.params[0];
  const additional = firstParam === 'command' && commands[firstParsedParam.value]
    ? (commands[firstParsedParam.value].additionalParams || [])
    : [];
  return [].concat(behaviour.params || [], additional);
}

test('Frontend ValuePicker and Param Resolution Tests', async (t) => {
  const behaviorMap = keyBy(behaviors, 'code');

  await t.test('&bt BT_DISC resolves profile index parameter correctly', () => {
    const btBehavior = behaviorMap['&bt'];
    const params = getBehaviourParams([{ value: 'BT_DISC' }], btBehavior);
    assert.equal(params.length, 2);
    assert.equal(params[0], 'command');
    assert.deepEqual(params[1].enum, [0, 1, 2, 3, 4]);
  });

  await t.test('&rgb_ug RGB_COLOR_HSB resolves hue, sat, and bri parameters', () => {
    const rgbBehavior = behaviorMap['&rgb_ug'];
    const params = getBehaviourParams([{ value: 'RGB_COLOR_HSB' }], rgbBehavior);
    assert.equal(params.length, 4);
    assert.equal(params[0], 'command');
    assert.equal(params[1].name, 'hue');
    assert.equal(params[2].name, 'sat');
    assert.equal(params[3].name, 'bri');
  });

  await t.test('&sys_reset and &soft_off have zero parameters', () => {
    const sysReset = behaviorMap['&sys_reset'];
    const softOff = behaviorMap['&soft_off'];
    assert.deepEqual(getBehaviourParams([], sysReset), []);
    assert.deepEqual(getBehaviourParams([], softOff), []);
  });

  await t.test('&kt requires a keycode parameter', () => {
    const kt = behaviorMap['&kt'];
    assert.deepEqual(getBehaviourParams([], kt), ['code']);
  });

  await t.test('unknown or undefined behavior safely returns empty array', () => {
    assert.deepEqual(getBehaviourParams([], undefined), []);
    assert.deepEqual(getBehaviourParams([], null), []);
  });
});
