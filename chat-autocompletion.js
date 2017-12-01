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
const ORIGINAL_TEXTAREA = '.chat-input textarea';
const CHAT_TEXTAREA = '#bttv-chat-input';


function newTextArea() {
  const text = document.createElement('textarea');
  const $oldText = $(ORIGINAL_TEXTAREA);
  window.$oldText = $oldText;
  $oldText[0].before(text);
  $text = $(text);

  Array.from($oldText[0].attributes)
    .map(attrEl => attrEl.name)
    .forEach(attr => {
      const v = $oldText.attr(attr);
      $text.attr(attr, v);
    })
  $text.attr('id', 'bttv-chat-input');

  $oldText.hide();
  return $text;
}

class TabCompletionModule {
  constructor() {
    $('body').off('click.tabComplete focus.tabComplete keydown.tabComplete')
      .on('click.tabComplete focus.tabComplete', CHAT_TEXT_AREA, () => this.onFocus())
      // .on('click.tabComplete focus.tabComplete', CONVERSATION_TEXT_AREA, this.onFocus)
      .on('keydown.tabComplete', CHAT_TEXT_AREA, e => this.onKeyDown(e))
      // .on('keydown.tabComplete', CONVERSATION_TEXT_AREA, e => this.onKeyDown(e, false));
  }

  sendMessage() {
    this.chatInputCtrl.props.onSendMessage(this.$text.val());
    this.$text.val('');
  }

  load() {
    this.tabTries = -1;
    this.suggestions = null;
    this.textSplit = ['', '', ''];
    this.userList = new Set();
    this.messageHistory = [];
    this.historyPos = -1;

    this.chatInputCtrl = getController($(CHAT_INPUT)[0]);
    this.$text = newTextArea();
  }

  onKeyDown(e) {
    const $text = this.$text;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      console.log('auto complete', $text.val());
    }
  }
}


function main() {
  $ = window.$;

  const module = new TabCompletionModule();
  module.load();

  window.$text = $text;
  window.chatInputCtrl = chatInputCtrl;
}

waitformain();