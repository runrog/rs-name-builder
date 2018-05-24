/* global $ */
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
    output: $('#final-name-output'),
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
  setForm(opts) {
    // setup project type select options
    const projectTypes = this.selectors.projectTypes;
    projectTypes.append('<option value="none">What kind of project?</option>');
    opts.projectTypes.forEach(o => projectTypes.append(`<option value="${o.type}">${o.type}</option>`));
    projectTypes.on('change', (e) => {
      const find = this.formData.projectTypes.find(o => o.type === e.target.value);
      this.selectors.deliverables.html('');
      if (find) {
        this.output.contentType = this.sanitizeDeliv(find.deliverables[0]);
        find.deliverables.forEach(d => this.selectors.deliverables.append(`<option value="${d}">${d}</option>`));
      } else {
        this.output.contentType = '';
      }
    });
    this.selectors.deliverables.on('change', (e) => {
      this.output.contentType = this.sanitizeDeliv(e.target.value);
    });

    // setup business unit select options
    const businessUnit = this.selectors.businessUnit;
    businessUnit.append('<option value="none">Who\'s this for?</option>');
    opts.businessUnit.forEach(o => businessUnit.append(`<option value="${o.value}">${o.name}</option>`));
    businessUnit.on('change', (e) => {
      this.output.prodCode = e.target.value;
    });

    // setup industry vertical select options
    const industryVertical = this.selectors.industryVertical;
    industryVertical.append('<option value="none">Select</option>');
    opts.industryVertical.forEach(o => industryVertical.append(`<option value="${o.value}">${o.name}</option>`));
    industryVertical.on('change', (e) => {
      this.output.vertCode = e.target.value;
    });

    // setup listener for name input
    this.selectors.assetTitle.on('input', (e) => {
      const title = this.sanitizeTitle(e.target.value);
      e.target.value = title;
      this.output.docTitle = title;
    });

    // setup listener for kapost number
    this.selectors.kapostNum.on('input', (e) => {
      const num = this.sanitizeNumber(e.target.value);
      e.target.value = num;
      this.output.kapostNum = num;
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
  },
  validate() {
    let passed = true;
    this.selectors.form.find('select, input').each(function vld() {
      const val = $(this).val();
      const $errors = $(this).next('span.kn-form-error');
      if (val === 'none' || !val || val.trim() === '') {
        // add errors
        passed = false;
        if (!$errors.length) {
          $('<span class="kn-form-error">Error</span>').insertAfter($(this));
        }
      } else if ($errors.length) {
        // remove errors
        $errors.remove();
      }
    });
    if (passed) {
      this.buildName();
    }
  },
  init() {
    this.getData();
    this.selectors.createBtn.click((e) => {
      e.preventDefault();
      this.validate();
    });
    this.selectors.resetBtn.click(() => {
      this.resetForm();
    });
  },
};

kapost.init();
