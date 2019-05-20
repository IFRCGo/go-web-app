import React from 'react';
import { PerFormComponent } from './per-form-component';
import RequestFactory from './factory/request-factory';

export default class PerForm extends React.Component {
  constructor (props) {
    super(props);
    this.state = {epiComponent: 'no'};
    this.sendForm = this.sendForm.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.loadDraft = this.loadDraft.bind(this);
    this.changeEpiComponentState = this.changeEpiComponentState.bind(this);
    this.changeEpiComponentStateTo = this.changeEpiComponentStateTo.bind(this);
    this.isEpiComponent = this.isEpiComponent.bind(this);
    this.requestFactory = new RequestFactory();
  }

  componentDidMount () {
    if (this.isEpiComponent()) {
      this.changeEpiComponentStateTo('yes');
    } else {
      this.loadDraft();
    }
  }

  componentDidUpdate () {
    this.loadDraft();
  }

  saveDraft () {
    let request = this.requestFactory.newFormRequest(this.formCode, this.formName, this.state.languageCode);
    request = this.requestFactory.addAreaQuestionData(request);
    request = this.requestFactory.addComponentData(request);
    localStorage.setItem('draft' + this.formCode, JSON.stringify(request));
  }

  isEpiComponent () {
    let draft = JSON.parse(localStorage.getItem('draft' + this.formCode));
    let epi = draft.data.filter(question => question.id === 'a1' && question.op === 'yes');

    if (epi.length > 0) {
      return true;
    }
    return false;
  }

  loadDraft () {
    let draft = JSON.parse(localStorage.getItem('draft' + this.formCode));
    if (draft !== null && typeof draft.data !== 'undefined' && draft.data !== null) {
      draft.data.forEach(question => {
        if (question.op !== null && question.id !== null) {
          let input = document.querySelector('[name=\'' + question.id + '\']');
          if (input.type === 'radio') {
            document.querySelector('[name=\'' + question.id + '\'][value=\'' + question.op + '\']').checked = true;
          } else if (input.type === 'text') {
            input.value = question.op;
          }
        }
      });
    }
  }

  sendForm () {
    this.saveDraft();
    let request = this.requestFactory.newFormRequest(this.formCode, this.formName, this.state.languageCode);
    request = this.requestFactory.addAreaQuestionData(request);
    request = this.requestFactory.addComponentData(request);
    // fetch('https://dsgocdnapi.azureedge.net/sendperform', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: data
    // });
  }

  changeEpiComponentState (e) {
    this.setState({epiComponent: e.target.value});
  }

  changeEpiComponentStateTo (value) {
    this.setState({epiComponent: value});
  }

  render () {
    return <PerFormComponent chooseLanguage={this.chooseLanguage}
      changeEpiComponentState={this.changeEpiComponentState}
      sendForm={this.sendForm}
      state={this.state} />;
  }
}
