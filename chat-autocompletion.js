// ==UserScript==
// @name         twitch test
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==
const wait = t => new Promise(r => setTimeout(r, t));
const q = s => document.querySelector(s);
let $ = null;
let chatInputCtrl;

function getReactInstance(element) {
    for (const key in element) {
        if (key.startsWith('__reactInternalInstance$')) {
            return element[key];
        }
    }
    return null;
}

function getReactElement(element) {
    const instance = getReactInstance(element);
    if (!instance) return null;

    return instance._currentElement;
}

function getParentNode(reactElement) {
    try {
        return reactElement._owner._currentElement._owner;
    } catch (_) {
        return null;
    }
}

function getController(container) {
    if (!container) return null;
    let controller;
    try {
        controller = getParentNode(getReactElement(container))._instance;
    } catch (_) {}
    return controller;
}

async function waitformain() {
  while(true) {
    let x;
    if (x = q('.chat-input')) {
      main();
      return;
    }
    await wait(25);
  }
}

const CHAT_INPUT = '.chat-input';
const CHAT_CONTAINER = '.chat-room__container';
const TEXTAREA = '.chat-input textarea';

function newTextArea() {
  const text = document.createElement('textarea');
  const $oldText = $(TEXTAREA);
  $oldText[0].before(text);
  $text = $(text);

  Array.from($oldText[0].attributes)
    .map(attrEl => attrEl.name)
    .forEach(attr => {
      const v = $oldText.attr(attr);
      $text.attr(attr, v);
    })

  window.$oldText = $oldText;
  $oldText.hide();

  $text.sendValue = () => {
    chatInputCtrl.props.onSendMessage($text.val());
    $text.val('');
  }

  $text.on('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $text.sendValue();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      $text.autoCompletion();
    }
  });

  $text.autoCompletion = () => {
    console.log('auto complete', $text.val());
  }
  return $text;
}


function main() {
  $ = window.$;
  chatInputCtrl = getController($(CHAT_INPUT)[0]);
  const emotes = chatInputCtrl.props.emotes;

  const $text = newTextArea();

  window.$text = $text;
  window.chatInputCtrl = chatInputCtrl;
}

waitformain();