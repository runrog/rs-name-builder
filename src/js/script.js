/* global $ */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-console: 0 */

const kapost = {
  globals: {
    projectTypes: $('#project-type'),
    deliverables: $('#deliverables'),
  },
  formData: null,
  setForm(opts) {
    const select = this.globals.projectTypes;
    opts.forEach(o => select.append(`<option value="${o.type}">${o.type}</option>`));
    select.on('change', (e) => {
      const find = this.formData.find(o => o.type === e.target.value);
      this.globals.deliverables.html('');
      find.deliverables.forEach(d => this.globals.deliverables.append(`<option value="${d}">${d}</option>`));
    });
  },
  getData() {
    return $.getJSON('./form-options.json')
      .done((data) => {
        this.formData = data.projectTypes;
        this.setForm(this.formData);
      })
      .fail(() => console.log('There was an issue getting the form data'));
  },
  init() {
    this.getData();
  },
};

kapost.init();
