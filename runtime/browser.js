(() => {
  'use strict';

  function disclosure(button, content, { expanded = false, onChange } = {}) {
    if (content.id) button.setAttribute('aria-controls', content.id);
    function setExpanded(open) {
      content.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      onChange?.(open);
    }
    const toggle = () => setExpanded(content.hidden);
    button.addEventListener('click', toggle);
    setExpanded(expanded);
    return { setExpanded, destroy: () => button.removeEventListener('click', toggle) };
  }

  function tabs(list, { onSelect, activation = 'automatic' } = {}) {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => list.ownerDocument.getElementById(tab.getAttribute('aria-controls')));
    if (!tabs.length || new Set(panels).size !== tabs.length ||
        tabs.some((tab, index) => !tab.id || !panels[index])) {
      throw new TypeError('Each tab needs an ID and a distinct panel referenced by aria-controls.');
    }
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    function select(index) {
      if (!tabs[index]) throw new RangeError('Tab index is out of range.');
      tabs.forEach((tab, position) => {
        const active = position === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[position].hidden = !active;
      });
      onSelect?.(index);
    }
    tabs.forEach((tab, index) => {
      panels[index].setAttribute('aria-labelledby', tab.id);
      tab.addEventListener('click', () => select(index), options);
      tab.addEventListener('keydown', (event) => {
        const vertical = list.getAttribute('aria-orientation') === 'vertical';
        const rtl = !vertical && getComputedStyle(list).direction === 'rtl';
        const previous = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        const targets = {
          [previous]: (index - 1 + tabs.length) % tabs.length,
          [next]: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        if (!Object.hasOwn(targets, event.key)) return;
        event.preventDefault();
        const target = targets[event.key];
        if (activation === 'automatic') select(target);
        tabs[target].focus({ preventScroll: true });
      }, options);
    });
    select(Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')));
    return { select, destroy: () => listeners.abort() };
  }

  function dropdown(button, list, { onSelect, onOpenChange, selected = 0 } = {}) {
    const choices = [...list.querySelectorAll('button[role="option"]')];
    if (!list.id || !choices.length || !choices[selected]) {
      throw new TypeError('The listbox needs an ID and an initial option.');
    }
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    let active = selected;
    button.setAttribute('aria-controls', list.id);
    button.setAttribute('aria-haspopup', 'listbox');
    choices.forEach((choice) => { choice.tabIndex = -1; });

    function setExpanded(open) {
      list.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      onOpenChange?.(open);
    }
    function select(index) {
      if (!choices[index]) throw new RangeError('Option index is out of range.');
      active = index;
      choices.forEach((choice, position) => choice.setAttribute('aria-selected', String(position === index)));
      onSelect?.(choices[index], index);
    }
    function open(index = active) {
      setExpanded(true);
      choices[index].focus();
    }
    function close(restoreFocus = false) {
      if (list.hidden) return;
      setExpanded(false);
      if (restoreFocus) button.focus();
    }
    button.addEventListener('click', () => list.hidden ? open() : close(), options);
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      open(event.key === 'ArrowUp' ? choices.length - 1 : active);
    }, options);
    choices.forEach((choice, index) => {
      choice.addEventListener('click', () => {
        select(index);
        close(true);
      }, options);
      choice.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
          return;
        }
        const targets = {
          ArrowUp: (index - 1 + choices.length) % choices.length,
          ArrowDown: (index + 1) % choices.length,
          Home: 0,
          End: choices.length - 1,
        };
        if (!Object.hasOwn(targets, event.key)) return;
        event.preventDefault();
        choices[targets[event.key]].focus();
      }, options);
    });
    button.ownerDocument.addEventListener('focusin', (event) => {
      if (event.target !== button && !list.contains(event.target)) close();
    }, options);
    button.ownerDocument.addEventListener('click', (event) => {
      if (!button.contains(event.target) && !list.contains(event.target)) close();
    }, options);
    select(selected);
    setExpanded(false);
    return { select, open, close, destroy: () => listeners.abort() };
  }

  function modal(trigger, dialog, { onClose, event = 'click' } = {}) {
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    if (dialog.id) trigger.setAttribute('aria-controls', dialog.id);
    trigger.setAttribute('aria-haspopup', 'dialog');
    function open() {
      if (dialog.open) return;
      dialog.returnValue = '';
      dialog.showModal();
    }
    if (event) trigger.addEventListener(event, open, options);
    dialog.addEventListener('close', () => {
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
      onClose?.(dialog.returnValue);
    }, options);
    return { open, close: (value) => dialog.close(value), destroy: () => listeners.abort() };
  }

  globalThis.MyDesignSystem = Object.freeze({ disclosure, tabs, dropdown, modal });
})();
