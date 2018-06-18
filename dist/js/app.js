'use strict';

/* global $ clipboard */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: 0 */

var kapost = {
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
    copyBtn: $('.kn-copy-name')
  },
  formData: null,
  output: {
    company: 'Rackspace',
    contentType: '',
    docTitle: '',
    vertCode: '',
    prodCode: '',
    kapostNum: ''
  },
  finalName: null,
  setForm: function setForm(opts) {
    var _this = this;

    // setup project type select options
    var projectTypes = this.selectors.projectTypes;
    var deliverables = this.selectors.deliverables;
    projectTypes.append('<option value="">What kind of project?</option>');
    opts.projectTypes.forEach(function (o) {
      return projectTypes.append('<option value="' + o.type + '">' + o.type + '</option>');
    });
    projectTypes.on('change', function (e) {
      var find = _this.formData.projectTypes.find(function (o) {
        return o.type === e.target.value;
      });
      deliverables.html('');
      if (find) {
        _this.output.contentType = _this.sanitizeDeliv(find.deliverables[0]);
        find.deliverables.forEach(function (d) {
          return deliverables.append('<option value="' + d + '">' + d + '</option>');
        });
      } else {
        _this.output.contentType = '';
      }
      _this.validateItem(projectTypes);
      _this.validateItem(deliverables);
    });
    deliverables.on('change', function (e) {
      _this.output.contentType = _this.sanitizeDeliv(e.target.value);
      _this.validateItem(deliverables);
    });

    // setup business unit select options
    var businessUnit = this.selectors.businessUnit;
    businessUnit.append('<option value="">Who\'s this for?</option>');
    opts.businessUnit.forEach(function (o) {
      return businessUnit.append('<option value="' + o.value + '">' + o.name + '</option>');
    });
    businessUnit.on('change', function (e) {
      _this.output.prodCode = e.target.value;
      _this.validateItem(businessUnit);
    });

    // setup industry vertical select options
    var industryVertical = this.selectors.industryVertical;
    industryVertical.append('<option value="">Select</option>');
    opts.industryVertical.forEach(function (o) {
      return industryVertical.append('<option value="' + o.value + '">' + o.name + '</option>');
    });
    industryVertical.on('change', function (e) {
      _this.output.vertCode = e.target.value;
      _this.validateItem(industryVertical);
    });

    // setup listener for name input
    var assetTitle = this.selectors.assetTitle;
    assetTitle.on('input', function (e) {
      var title = _this.sanitizeTitle(e.target.value);
      e.target.value = title;
      _this.output.docTitle = title;
      _this.validateItem(assetTitle);
    });

    // setup listener for kapost number
    var kapostNum = this.selectors.kapostNum;
    kapostNum.on('input', function (e) {
      var num = _this.sanitizeNumber(e.target.value);
      e.target.value = num;
      _this.output.kapostNum = num;
      _this.validateItem(kapostNum);
    });
  },
  sanitizeDeliv: function sanitizeDeliv(str) {
    return str.replace(/\s/g, '-');
  },
  sanitizeTitle: function sanitizeTitle(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '-').replace(/--/gi, '-');
  },
  sanitizeNumber: function sanitizeNumber(str) {
    return str.replace(/[^0-9]/g, '');
  },
  getData: function getData() {
    var _this2 = this;

    return $.getJSON('./form-options.json').done(function (data) {
      _this2.formData = data;
      _this2.setForm(data);
    }).fail(function () {
      return console.log('There was an issue getting the form data');
    });
  },
  buildName: function buildName() {
    var o = this.output;
    var assetTitle = o.docTitle.replace(/-$/, '');
    var string = o.company + '-' + o.contentType + '-' + assetTitle + '-' + o.vertCode + '-' + o.prodCode + '-' + o.kapostNum;
    string = string.replace(/--/gi, '-');
    this.finalName = string;
    this.selectors.output.html(string);
    console.log(string);
  },
  resetForm: function resetForm() {
    this.selectors.deliverables.html('');
    this.output = {
      company: 'Rackspace',
      contentType: '',
      docTitle: '',
      vertCode: '',
      prodCode: '',
      kapostNum: ''
    };
    this.selectors.output.html('');
    this.selectors.outputContainer.removeClass('file-built');
    this.clearErrors();
  },
  clearErrors: function clearErrors() {
    this.selectors.form.find('select, input').each(function vld() {
      var $item = $(this);
      var $errors = $item.next('span.kn-form-error');
      if ($errors.length) {
        $item.removeClass('kn-field-error');
        $errors.remove();
      }
    });
  },
  validateItem: function validateItem($item) {
    var passed = true;
    var val = $item.val();
    var $errors = $item.next('span.kn-form-error');
    if ((!val || val.trim() === '') && $item.attr('data-validate') === 'required') {
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
  validateAll: function validateAll() {
    var notPassed = [];
    this.selectors.form.find('select, input').each(function vld() {
      var passed = kapost.validateItem($(this));
      if (!passed) {
        notPassed.push($(this));
      }
    });
    if (notPassed.length === 0) {
      this.selectors.outputContainer.addClass('file-built');
      this.buildName();
    } else {
      this.selectors.outputContainer.removeClass('file-built');
    }
  },
  copyFileName: function copyFileName() {
    var _this3 = this;

    if (this.finalName) {
      clipboard.writeText(this.finalName);
      this.selectors.copyBtn.addClass('kn-copied');
      this.selectors.output.addClass('kn-copied-output');
      setTimeout(function () {
        _this3.selectors.copyBtn.removeClass('kn-copied');
        _this3.selectors.output.removeClass('kn-copied-output');
      }, 1500);
    }
  },
  init: function init() {
    var _this4 = this;

    this.getData();
    this.selectors.createBtn.click(function (e) {
      e.preventDefault();
      _this4.validateAll();
    });
    this.selectors.resetBtn.click(function () {
      _this4.resetForm();
    });
    this.selectors.copyBtn.click(function (e) {
      e.preventDefault();
      _this4.copyFileName();
    });
  }
};

kapost.init();