/* global $ clipboard */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: 0 */

const kapost = {
  selectors: {
    form: $('.kn-form'),
    projectTypes: $('#project-type'),
    deliverables: $('#deliverables'),
    businessUnit: $('#business-unit'),
    industryVertical: $('#industry-vertical'),
    assetTitle: $('#asset-title'),
    kapostNum: $('#kapost-number'),
    createBtn: $('.kn-create-btn'),
    resetBtn: $('.kn-reset-btn'),
    outputContainer: $('.output-container'),
    output: $('#final-name-output'),
    copyBtn: $('.kn-copy-name'),
  },
  formData: null,
  output: {
    company: 'Rackspace',
    contentType: '',
    docTitle: '',
    vertCode: '',
    prodCode: '',
    kapostNum: '',
  },
  finalName: null,
  setForm(opts) {
    // setup project type select options
    const projectTypes = this.selectors.projectTypes;
    const deliverables = this.selectors.deliverables;
    projectTypes.append('<option value="none">What kind of project?</option>');
    opts.projectTypes.forEach(o => projectTypes.append(`<option value="${o.type}">${o.type}</option>`));
    projectTypes.on('change', (e) => {
      const find = this.formData.projectTypes.find(o => o.type === e.target.value);
      deliverables.html('');
      if (find) {
        this.output.contentType = this.sanitizeDeliv(find.deliverables[0]);
        find.deliverables.forEach(d => deliverables.append(`<option value="${d}">${d}</option>`));
      } else {
        this.output.contentType = '';
      }
      this.validateItem(projectTypes);
      this.validateItem(deliverables);
    });
    deliverables.on('change', (e) => {
      this.output.contentType = this.sanitizeDeliv(e.target.value);
      this.validateItem(deliverables);
    });

    // setup business unit select options
    const businessUnit = this.selectors.businessUnit;
    businessUnit.append('<option value="none">Who\'s this for?</option>');
    opts.businessUnit.forEach(o => businessUnit.append(`<option value="${o.value}">${o.name}</option>`));
    businessUnit.on('change', (e) => {
      this.output.prodCode = e.target.value;
      this.validateItem(businessUnit);
    });

    // setup industry vertical select options
    const industryVertical = this.selectors.industryVertical;
    industryVertical.append('<option value="none">Select</option>');
    opts.industryVertical.forEach(o => industryVertical.append(`<option value="${o.value}">${o.name}</option>`));
    industryVertical.on('change', (e) => {
      this.output.vertCode = e.target.value;
      this.validateItem(industryVertical);
    });

    // setup listener for name input
    const assetTitle = this.selectors.assetTitle;
    assetTitle.on('input', (e) => {
      const title = this.sanitizeTitle(e.target.value);
      e.target.value = title;
      this.output.docTitle = title;
      this.validateItem(assetTitle);
    });

    // setup listener for kapost number
    const kapostNum = this.selectors.kapostNum;
    kapostNum.on('input', (e) => {
      const num = this.sanitizeNumber(e.target.value);
      e.target.value = num;
      this.output.kapostNum = num;
      this.validateItem(kapostNum);
    });
  },
  sanitizeDeliv(str) {
    return str.replace(/\s/g, '-');
  },
  sanitizeTitle(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '-');
  },
  sanitizeNumber(str) {
    return str.replace(/[^0-9]/g, '');
  },
  getData() {
    return $.getJSON('./form-options.json')
      .done((data) => {
        this.formData = data;
        this.setForm(data);
      })
      .fail(() => console.log('There was an issue getting the form data'));
  },
  buildName() {
    const o = this.output;
    const string = `${o.company}-${o.contentType}-${o.docTitle}-${o.vertCode}-${o.prodCode}-${o.kapostNum}`;
    this.finalName = string;
    this.selectors.output.html(string);
    console.log(string);
  },
  resetForm() {
    this.selectors.deliverables.html('');
    this.output = {
      company: 'Rackspace',
      contentType: '',
      docTitle: '',
      vertCode: '',
      prodCode: '',
      kapostNum: '',
    };
    this.selectors.output.html('');
    this.selectors.outputContainer.removeClass('file-built');
    this.clearErrors();
  },
  clearErrors() {
    this.selectors.form.find('select, input').each(function vld() {
      const $item = $(this);
      const $errors = $item.next('span.kn-form-error');
      if ($errors.length) {
        $item.removeClass('kn-field-error');
        $errors.remove();
      }
    });
  },
  validateItem($item) {
    let passed = true;
    const val = $item.val();
    const $errors = $item.next('span.kn-form-error');
    if ((val === 'none' || !val || val.trim() === '') &&
         $item.attr('data-validate') === 'required') {
      // add errors
      passed = false;
      if (!$errors.length) {
        $item.addClass('kn-field-error');
        $('<span class="kn-form-error">This value is required!</span>').insertAfter($item);
      }
    } else if ($errors.length) {
      // remove errors
      $item.removeClass('kn-field-error');
      $errors.remove();
    }
    return passed;
  },
  validateAll() {
    let passed = true;
    this.selectors.form.find('select, input').each(function vld() {
      passed = kapost.validateItem($(this));
    });
    if (passed) {
      this.selectors.outputContainer.addClass('file-built');
      this.buildName();
    } else {
      this.selectors.outputContainer.removeClass('file-built');
    }
  },
  copyFileName() {
    if (this.finalName) {
      clipboard.writeText(this.finalName);
    }
  },
  init() {
    this.getData();
    this.selectors.createBtn.click((e) => {
      e.preventDefault();
      this.validateAll();
    });
    this.selectors.resetBtn.click(() => {
      this.resetForm();
    });
    this.selectors.copyBtn.click((e) => {
      e.preventDefault();
      this.copyFileName();
    });
  },
};

kapost.init();
