(() => {
  const root = document.documentElement;
  const theme = document.querySelector('#theme-select');
  const search = document.querySelector('#component-search');
  const nav = document.querySelector('#catalog-navigation');
  const groups = [...document.querySelectorAll('.catalog-group')];
  const demos = [...document.querySelectorAll('.catalog-demo')];
  const themeKey = 'component-catalog-theme';

  try {
    const saved = localStorage.getItem(themeKey);
    if ([...theme.options].some((option) => option.value === saved)) {
      theme.value = saved;
      root.dataset.theme = saved;
    }
  } catch {
    // Storage can be unavailable when opening the catalog as a local file.
  }
  theme.addEventListener('change', () => {
    root.dataset.theme = theme.value;
    try {
      localStorage.setItem(themeKey, theme.value);
    } catch {
      // The selected theme still applies for this visit.
    }
  });

  const links = groups.map((group) => {
    const link = document.createElement('a');
    link.href = '#' + group.id;
    link.textContent = group.dataset.title;
    nav.append(link);
    return link;
  });

  const normalize = (value) => value.trim().toLocaleLowerCase('ja');
  const searchText = demos.map((demo) => normalize(demo.dataset.name + ' ' + demo.textContent));
  const count = document.querySelector('#component-count');
  const empty = document.querySelector('#catalog-empty');
  function filterCatalog() {
    const query = normalize(search.value);
    let visible = 0;
    demos.forEach((demo, index) => {
      demo.hidden = !searchText[index].includes(query);
      if (!demo.hidden) visible++;
    });
    groups.forEach((group, index) => {
      group.hidden = !group.querySelector('.catalog-demo:not([hidden])');
      links[index].hidden = group.hidden;
    });
    count.textContent = String(visible);
    empty.style.display = visible ? 'none' : 'block';
  }
  search.addEventListener('input', filterCatalog);
  filterCatalog();

  function toggleDisclosure(button, content, open = false, onChange) {
    return MyDesignSystem.disclosure(button, content, { expanded: open, onChange }).setExpanded;
  }

  document.querySelectorAll('.catalog-demo a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  document.querySelectorAll('[data-accordion] .mds--accordion__heading').forEach((button) => {
    const item = button.closest('.mds--accordion__item');
    const content = item.querySelector('.mds--accordion__wrapper');
    function update(active) {
      button.setAttribute('aria-expanded', String(active));
      content.inert = !active;
    }
    update(item.classList.contains('mds--accordion__item--active'));
    button.addEventListener('click', () => update(item.classList.toggle('mds--accordion__item--active')));
  });

  document.querySelectorAll('[data-dismiss]').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('.mds--inline-notification, .mds--toast-notification').hidden = true;
    });
  });

  document.querySelectorAll('[data-password]').forEach((button) => {
    const input = button.parentElement.querySelector('input');
    button.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.setAttribute('aria-label', show ? 'パスワードを隠す' : 'パスワードを表示');
    });
  });

  document.querySelectorAll('[data-copy], .mds--snippet-button').forEach((button) => {
    const status = document.createElement('span');
    status.className = 'catalog-hidden-label';
    status.setAttribute('role', 'status');
    button.closest('.catalog-demo').append(status);
    button.addEventListener('click', async () => {
      const value = button.dataset.copy ?? button.closest('.mds--snippet').querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = 'コピーしました';
      } catch {
        status.textContent = 'コピーできませんでした';
      }
    });
  });

  document.querySelectorAll('.mds--search:has(.mds--search-close)').forEach((component) => {
    const input = component.querySelector('input');
    const clear = component.querySelector('.mds--search-close');
    const update = () => clear.classList.toggle('mds--search-close--hidden', !input.value);
    input.addEventListener('input', update);
    clear.addEventListener('click', () => {
      input.value = '';
      input.focus({ preventScroll: true });
      update();
    });
    update();
  });

  document.querySelectorAll('.mds--number:has(input[type="number"])').forEach((component) => {
    const input = component.querySelector('input');
    component.querySelector('.up-icon').addEventListener('click', () => input.stepUp());
    component.querySelector('.down-icon').addEventListener('click', () => input.stepDown());
  });

  document.querySelectorAll('.mds--slider-container').forEach((component) => {
    const range = component.querySelector('input[type="range"]');
    const number = component.querySelector('input[type="number"]');
    const fill = component.querySelector('.mds--slider__filled-track');
    number.min = range.min;
    number.max = range.max;
    function update() {
      number.value = range.value;
      const percent = (range.valueAsNumber - Number(range.min)) / (Number(range.max) - Number(range.min)) * 100;
      fill.style.width = percent + '%';
    }
    range.addEventListener('input', update);
    number.addEventListener('input', () => {
      if (number.value !== '' && number.validity.valid) {
        range.value = number.value;
        update();
      }
    });
    number.addEventListener('change', () => {
      if (number.value !== '') range.value = number.value;
      update();
    });
    update();
  });

  document.querySelectorAll('.mds--list-box:has(.mds--list-box__field)').forEach((component, index) => {
    const button = component.querySelector('.mds--list-box__field');
    const label = button.querySelector('.mds--list-box__label');
    const menu = document.createElement('div');
    menu.className = 'mds--list-box__menu';
    menu.id = 'demo-dropdown-options-' + index;
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', '項目の選択');
    component.append(menu);
    [label.textContent, '別の項目', 'その他の項目'].forEach((value) => {
      const item = document.createElement('div');
      item.className = 'mds--list-box__menu-item';
      item.setAttribute('role', 'presentation');
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'mds--list-box__menu-item__option';
      option.textContent = value;
      option.setAttribute('role', 'option');
      item.append(option);
      menu.append(item);
    });
    MyDesignSystem.dropdown(button, menu, {
      onSelect(option) { label.textContent = option.textContent; },
      onOpenChange(expanded) { component.classList.toggle('mds--list-box--expanded', expanded); },
    });
  });

  const file = document.querySelector('#file-demo');
  const filename = file.parentElement.querySelector('.mds--file-filename');
  const fileRow = filename.closest('.mds--file');
  const fileStatus = document.createElement('p');
  fileStatus.className = 'catalog-note';
  fileStatus.setAttribute('role', 'status');
  fileRow.parentElement.after(fileStatus);
  file.addEventListener('change', () => {
    const selected = file.files[0];
    const valid = selected && /^(image\/png|image\/jpeg)$/.test(selected.type) && selected.size <= 5_000_000;
    fileRow.hidden = !valid;
    fileStatus.textContent = selected && !valid ? '5 MB 以下の PNG または JPG を選択してください。' : '';
    if (valid) filename.textContent = selected.name;
    else file.value = '';
  });

  const navigation = document.querySelector('#demo-side-nav');
  toggleDisclosure(document.querySelector('[aria-controls="demo-side-nav"]'), navigation, true);

  document.querySelectorAll('[role="tablist"]').forEach((list, index) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const article = list.closest('.catalog-demo');
    article.querySelector('.catalog-surface')?.remove();
    const descriptions = index === 0
      ? ['コンポーネントの概要を表示します。', 'コンポーネントの仕様を表示します。', 'コンポーネントの変更履歴を表示します。']
      : ['日単位で表示します。', '週単位で表示します。', '月単位で表示します。'];
    tabs.forEach((tab, tabIndex) => {
      const panel = document.createElement('div');
      panel.id = 'demo-tab-panel-' + index + '-' + tabIndex;
      panel.className = 'catalog-surface';
      panel.setAttribute('role', 'tabpanel');
      panel.tabIndex = 0;
      panel.textContent = descriptions[tabIndex];
      article.append(panel);
      tab.id = panel.id + '-tab';
      tab.setAttribute('aria-controls', panel.id);
    });
    MyDesignSystem.tabs(list, { onSelect(active) {
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === active;
        tab.closest('.mds--tabs__nav-item')?.classList.toggle('mds--tabs__nav-item--selected', selected);
        if (tab.classList.contains('mds--content-switcher-btn')) {
          tab.classList.toggle('mds--content-switcher--selected', selected);
        }
      });
    } });
  });

  document.querySelectorAll('.mds--pagination').forEach((component) => {
    const previous = component.querySelector('.mds--pagination__button--backward');
    const next = component.querySelector('.mds--pagination__button--forward');
    const [range, counter] = component.querySelectorAll('.mds--pagination__text');
    let page = 1;
    counter.setAttribute('aria-live', 'polite');
    function update() {
      range.textContent = ((page - 1) * 10 + 1) + '–' + Math.min(page * 10, 42) + ' / 42件';
      counter.textContent = page + ' / 5ページ';
      previous.disabled = page === 1;
      next.disabled = page === 5;
    }
    previous.addEventListener('click', () => { page--; update(); });
    next.addEventListener('click', () => { page++; update(); });
    update();
  });

  document.querySelectorAll('.mds--progress').forEach((progress) => {
    const steps = [...progress.querySelectorAll('.mds--progress-step')];
    function select(active) {
      steps.forEach((step, index) => {
        const button = step.querySelector('button');
        step.classList.toggle('mds--progress-step--complete', index < active);
        step.classList.toggle('mds--progress-step--current', index === active);
        step.classList.toggle('mds--progress-step--incomplete', index > active);
        button.setAttribute('aria-current', index === active ? 'step' : 'false');
        if (progress.classList.contains('mds--progress--numbered')) {
          if (index < active) {
            const label = button.querySelector('.mds--progress-label').textContent;
            button.setAttribute('aria-label', label + '（完了）');
          } else {
            button.removeAttribute('aria-label');
          }
        }
      });
    }
    steps.forEach((step, index) => step.querySelector('button').addEventListener('click', () => select(index)));
    select(steps.findIndex((step) => step.classList.contains('mds--progress-step--current')));
  });

  document.querySelectorAll('.mds--tile--selectable .mds--tile-input').forEach((input) => {
    const tile = input.closest('.mds--tile--selectable');
    const update = () => tile.classList.toggle('mds--tile--is-selected', input.checked);
    input.addEventListener('change', update);
    update();
  });
  document.querySelectorAll('.mds--toggle__button').forEach((input) => {
    const label = input.labels[0];
    const track = label.querySelector('.mds--toggle__switch');
    const text = label.querySelector('.mds--toggle__text');
    function update() {
      track.classList.toggle('mds--toggle__switch--checked', input.checked);
      text.textContent = input.checked ? 'On' : 'Off';
    }
    input.addEventListener('change', update);
    update();
  });
  document.querySelectorAll('.mds--tag--filter').forEach((button) => {
    button.addEventListener('click', () => { button.hidden = true; });
  });
  document.querySelectorAll('.mds--tree-parent-node__toggle').forEach((button) => {
    const branch = button.closest('.mds--tree-parent-node').querySelector('[role="group"]');
    button.setAttribute('aria-label', '子項目');
    toggleDisclosure(button, branch, !branch.hidden);
  });

  const reset = document.querySelector('[data-name^="Empty state"] button');
  reset.addEventListener('click', () => {
    search.value = '';
    filterCatalog();
  });

  const dialog = document.querySelector('dialog.catalog-dialog-card');
  const openDialog = document.querySelector('[data-open-dialog]');
  MyDesignSystem.modal(openDialog, dialog, { onClose(value) {
    dialog.parentElement.querySelector('[role="status"]').textContent =
      value === 'publish' ? '公開を確認しました（デモ）' : '';
  } });

  const panel = document.querySelector('.catalog-panel');
  const openPanel = document.querySelector('[data-open-panel]');
  const closePanel = document.querySelector('[data-close-panel]');
  openPanel.addEventListener('click', () => {
    panel.hidden = false;
    openPanel.hidden = true;
    closePanel.focus({ preventScroll: true });
  });
  closePanel.addEventListener('click', () => {
    panel.hidden = true;
    openPanel.hidden = false;
    openPanel.focus({ preventScroll: true });
  });
  panel.querySelector('[data-apply-panel]').addEventListener('click', () => {
    const name = panel.querySelector('#panel-name').value;
    const state = panel.querySelector('#panel-state').value;
    panel.parentElement.querySelector('[role="status"]').textContent = name + ' / ' + state;
  });

  const popover = document.querySelector('[data-name^="Popover"] .mds--popover');
  const popoverButton = document.createElement('button');
  popoverButton.type = 'button';
  popoverButton.className = 'mds--btn mds--btn--tertiary';
  popoverButton.textContent = '補足情報';
  popover.id = 'demo-popover';
  popoverButton.setAttribute('aria-controls', popover.id);
  popover.before(popoverButton);
  const showPopover = toggleDisclosure(popoverButton, popover);
  document.addEventListener('click', (event) => {
    if (!popover.contains(event.target) && !popoverButton.contains(event.target)) showPopover(false);
  });
  popover.parentElement.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !popover.hidden) {
      showPopover(false);
      popoverButton.focus({ preventScroll: true });
    }
  });

  const tooltip = document.querySelector('#visible-tooltip');
  const tip = document.querySelector('[aria-describedby="visible-tooltip"]');
  tooltip.hidden = true;
  tip.addEventListener('pointerenter', () => { tooltip.hidden = false; });
  tip.addEventListener('pointerleave', () => { tooltip.hidden = !tip.matches(':focus-visible'); });
  tip.addEventListener('focus', () => { tooltip.hidden = false; });
  tip.addEventListener('blur', () => { tooltip.hidden = true; });
  tip.addEventListener('click', () => { tooltip.hidden = false; });
  tip.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') tooltip.hidden = true;
  });

  const edit = document.querySelector('.mds--edit-in-place');
  const title = edit.querySelector('input');
  const save = edit.querySelector('button');
  const editStatus = document.createElement('p');
  editStatus.className = 'catalog-note';
  editStatus.setAttribute('role', 'status');
  edit.after(editStatus);
  save.addEventListener('click', () => {
    title.defaultValue = title.value;
    editStatus.textContent = '保存しました';
  });
  title.addEventListener('input', () => { editStatus.textContent = ''; });
  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') save.click();
    if (event.key === 'Escape') title.value = title.defaultValue;
  });

  const aiLabel = document.querySelector('button.mds--ai-label');
  const aiDetails = document.createElement('p');
  aiDetails.id = 'demo-ai-details';
  aiDetails.className = 'catalog-note';
  aiDetails.textContent = 'このラベルは、AI が生成したコンテンツに付けられます。';
  aiLabel.setAttribute('aria-controls', aiDetails.id);
  aiLabel.parentElement.after(aiDetails);
  toggleDisclosure(aiLabel, aiDetails);

  const scope = document.querySelector('[data-name^="Options tile"] .catalog-surface');
  const scopeOptions = [...scope.querySelectorAll('input[name="scope"]')];
  const [cancelScope, saveScope] = scope.querySelectorAll('button');
  const scopeStatus = document.createElement('p');
  scopeStatus.className = 'catalog-note';
  scopeStatus.setAttribute('role', 'status');
  scope.append(scopeStatus);
  let savedScope = scopeOptions.find((option) => option.checked);
  saveScope.addEventListener('click', () => {
    savedScope = scopeOptions.find((option) => option.checked);
    scopeStatus.textContent = '公開範囲を保存しました（デモ）';
  });
  cancelScope.addEventListener('click', () => {
    savedScope.checked = true;
    scopeStatus.textContent = '';
  });

  const addSelect = document.querySelector('.mds--add-select');
  const memberSearch = addSelect.querySelector('input');
  memberSearch.setAttribute('aria-label', 'メンバーを名前で検索');
  const members = [...addSelect.querySelectorAll('.mds--add-select-row')];
  memberSearch.addEventListener('input', () => {
    members.forEach((member) => {
      member.hidden = !normalize(member.querySelector('.mds--add-select-row__title').textContent)
        .includes(normalize(memberSearch.value));
    });
  });
  members.forEach((member) => {
    member.setAttribute('aria-pressed', String(member.classList.contains('mds--add-select-row--selected')));
    member.addEventListener('click', () => {
      member.setAttribute('aria-pressed', String(member.classList.toggle('mds--add-select-row--selected')));
    });
  });

  const resizer = document.querySelector('.mds--resizer[role="separator"]');
  const split = resizer.parentElement;
  function resize(value) {
    const left = Math.round(Math.max(20, Math.min(80, value)));
    split.style.gridTemplateColumns = 'minmax(0, ' + left + 'fr) 8px minmax(0, ' + (100 - left) + 'fr)';
    resizer.setAttribute('aria-valuenow', String(left));
  }
  resizer.addEventListener('pointerdown', (event) => {
    if (event.button === 0) resizer.setPointerCapture(event.pointerId);
  });
  resizer.addEventListener('pointermove', (event) => {
    if (!resizer.hasPointerCapture(event.pointerId)) return;
    const { left, width } = split.getBoundingClientRect();
    resize((event.clientX - left - 4) / (width - 8) * 100);
  });
  resizer.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    resize(Number(resizer.getAttribute('aria-valuenow')) + (event.key === 'ArrowRight' ? 5 : -5));
  });
})();
