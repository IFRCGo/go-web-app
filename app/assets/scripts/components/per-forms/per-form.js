import React from 'react';
import { PerFormComponent } from './per-form-component';
import RequestFactory from './factory/request-factory';
import { Redirect } from 'react-router-dom';
import { showAlert } from '../system-alerts';
import { environment } from '../../config';
import { PropTypes as T } from 'prop-types';

export default class PerForm extends React.Component {
  constructor (props, defaultLanguage, formCode, formName) {
    super(props);
    this.formName = formName;
    this.formCode = formCode;
    this.nationalSociety = props.nationalSociety;
    this.sendForm = this.sendForm.bind(this);
    this.saveState = this.saveState.bind(this);
    this.loadState = this.loadState.bind(this);
    this.loadFromProps = this.loadFromProps.bind(this);
    this.isEpiComponent = this.isEpiComponent.bind(this);
    this.isEpiComponentFromProps = this.isEpiComponentFromProps.bind(this);
    this.chooseFormStateSource = this.chooseFormStateSource.bind(this);
    this.autosave = this.autosave.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.editForm = this.editForm.bind(this);
    this.checkFormFilled = this.checkFormFilled.bind(this);
    if (props.autosaveOn) {
      this.autosaveInterval = setInterval(this.autosave, 10000);
    }
    this.requestFactory = new RequestFactory();
    defaultLanguage.epiComponent = 'no';
    defaultLanguage.redirect = false;
    this.loadingFormPropsRunning = false;
    this.state = defaultLanguage;
    this.changeEpiComponentState = this.changeEpiComponentState.bind(this);
  }

  componentDidMount () {
    if (this.props.mode === 'view' || this.props.mode === 'edit') {
      this.props._getPerDocument(this.props.match.params.id);
      this.loadingFormPropsRunning = true;
    }
    this.chooseFormStateSource();
  }

  componentDidUpdate (prevProps) {
    if ((this.props.perDocument.fetched && !prevProps.perDocument.fetched) || this.loadingFormPropsRunning) {
      this.chooseFormStateSource(false);
    } else {
      this.chooseFormStateSource(true);
    }
  }

  chooseFormStateSource (refresh = false) {
    if ((this.props.mode === 'view' || this.props.mode === 'edit') && this.props.perDocument.fetched && (!refresh || this.loadingFormPropsRunning)) {
      if (this.state.epiComponent !== 'yes') {
        this.setState({epiComponent: 'yes'});
        return;
      }
      this.loadingFormPropsRunning = false;
      this.loadFromProps();
    } else if (this.props.autosaveOn && localStorage.getItem('autosave' + this.props.mode + this.formCode) !== null && localStorage.getItem('finished' + this.formCode) === null) {
      if (this.isEpiComponent() && this.state.epiComponent !== 'yes') {
        this.setState({epiComponent: 'yes'});
        return;
      }
      this.loadState('autosave');
    } else if (this.props.mode === 'new' && !this.props.getPerDraftDocument.fetched && !this.props.getPerDraftDocument.fetching) {
      this.props._getPerDraftDocument(this.props.user.data.id, this.formCode);
    } else if (this.props.mode === 'new' && this.props.getPerDraftDocument.fetched && this.props.getPerDraftDocument.data.count > 0) {
      localStorage.removeItem('finished' + this.formCode);
      if (this.isEpiComponent() && this.state.epiComponent !== 'yes') {
        this.setState({epiComponent: 'yes'});
        return;
      }
      this.loadState('draft');
    }
  }

  saveState (type) {
    let request = this.requestFactory.newFormRequest(this.formCode, this.formName, this.state.languageCode);
    request = this.requestFactory.addAreaQuestionData(request);
    request = this.requestFactory.addComponentData(request);

    if (type === 'autosave' && this.props.autosaveOn) {
      localStorage.setItem(type + this.props.mode + this.formCode, JSON.stringify(request));
    }
  }

  isEpiComponent () {
    let draft = null;
    if (this.props.view && this.props.perDocument.fetched) {
      return this.isEpiComponentFromProps();
    } else if (!!localStorage.getItem('autosave' + this.props.mode + this.formCode) && !localStorage.getItem('finished' + this.formCode)) {
      draft = JSON.parse(localStorage.getItem('autosave' + this.props.mode + this.formCode));
    } else if (this.props.getPerDraftDocument.fetched && this.props.getPerDraftDocument.data.count > 0) {
      draft = JSON.parse(this.props.getPerDraftDocument.data.results[0].data.replace(/'/g, '"'));
    }
    if (draft !== null && draft.data !== null) {
      let epi = draft.data.filter(question => {
        return question.id === 'a1' && question.op === this.requestFactory.stringAnswerToNum('yes');
      });
      if (epi.length > 0) {
        return true;
      }
    }
    return false;
  }

  isEpiComponentFromProps () {
    const formData = this.props.perDocument.data.results;
    const filteredData = formData.filter(question => {
      return question.question_id === 'a1' && question.selected_option === this.requestFactory.stringAnswerToNum('yes');
    });
    if (filteredData.length > 0) {
      return true;
    }
    return false;
  }

  loadState (type) {
    let draft = null;
    if (type === 'autosave' && this.props.autosaveOn) {
      draft = JSON.parse(localStorage.getItem(type + this.props.mode + this.formCode));
    } else if (type === 'draft') {
      draft = JSON.parse(this.props.getPerDraftDocument.data.results[0].data.replace(/'/g, '"'));
    }
    if (draft !== null && typeof draft.data !== 'undefined' && draft.data !== null) {
      draft.data.forEach(question => {
        if (!isNaN(question.op) && !!question.id) {
          const formRadioInput = document.querySelector('[name=\'' + question.id + '\'][value=\'' + question.op + '\']');
          const feedbackInput = document.querySelector('[name=\'' + question.id + 'f\']');

          if (typeof formRadioInput !== 'undefined' && formRadioInput !== null) {
            formRadioInput.checked = true;
          }

          if (typeof feedbackInput !== 'undefined' && feedbackInput !== null) {
            feedbackInput.value = question.nt;
          }
        }
      });
    }
  }

  loadFromProps () {
    const formData = this.props.perDocument.data.results;
    formData.forEach(question => {
      if (!isNaN(question.selected_option) && !!question.question_id) {
        const formRadioInput = document.querySelector('[name=\'' + question.question_id + '\'][value=\'' + question.selected_option + '\']');
        const feedbackInput = document.querySelector('[name=\'' + question.question_id + 'f\']');

        if (typeof formRadioInput !== 'undefined' && formRadioInput !== null) {
          formRadioInput.checked = true;
        }

        if (typeof feedbackInput !== 'undefined' && feedbackInput !== null) {
          feedbackInput.value = question.notes;
        }
      }
    });
  }

  sendForm () {
    if (this.checkFormFilled()) {
      let request = this.requestFactory.newFormRequest(this.formCode, this.formName, this.state.languageCode, this.nationalSociety);
      request = this.requestFactory.addAreaQuestionData(request);
      request = this.requestFactory.addComponentData(request);
      this.props._sendPerForm(request);
      showAlert('success', <p>PER form has been saved successfully!</p>, true, 2000);
      clearInterval(this.autosaveInterval);
      localStorage.setItem('finished' + this.formCode, 1);
      this.setState({redirect: true});
    }
  }

  editForm () {
    if (this.checkFormFilled()) {
      let request = this.requestFactory.newFormEditRequest(this.props.match.params.id);
      request = this.requestFactory.addAreaQuestionData(request);
      request = this.requestFactory.addComponentData(request);
      this.props._editPerDocument(request);
      showAlert('success', <p>PER form has been saved successfully!</p>, true, 2000);
      clearInterval(this.autosaveInterval);
      localStorage.setItem('finished' + this.formCode, 1);
      this.setState({redirect: true});
    }
  }

  saveDraft () {
    let request = this.requestFactory.newFormRequest(this.formCode, this.formName, this.state.languageCode, this.nationalSociety);
    request = this.requestFactory.addAreaQuestionData(request);
    request = this.requestFactory.addComponentData(request);
    const finalRequest = {code: this.formCode, user_id: this.props.user.data.id + '', data: request};
    this.autosave();
    this.props._sendPerDraft(finalRequest);
    showAlert('success', <p>PER form has been saved successfully!</p>, true, 2000);
  }

  componentWillUnmount () {
    if (this.props.autosaveOn) {
      clearInterval(this.autosaveInterval);
    }
  }

  changeEpiComponentState (e) {
    this.autosave();
    this.setState({epiComponent: this.requestFactory.numAnswerToString(parseInt(e.target.value))});
  }

  autosave () {
    this.saveState('autosave');
  }

  checkFormFilled () {
    let componentIndex = 0;

    for (let component of this.state.components) {
      if (typeof component.namespaces !== 'undefined' && component.namespaces !== null) {
        for (let questionIndex in component.namespaces) {
          if (document.querySelectorAll('[name=\'c' + componentIndex + 'q' + questionIndex + '\']:checked').length < 1) {
            document.getElementById('container' + componentIndex + 'q' + questionIndex).style.backgroundColor = '#FEB8B8';
            let offsetTop = document.getElementById('container' + componentIndex + 'q' + questionIndex).offsetTop;
            window.scroll(0, offsetTop);
            return false;
          } else {
            document.getElementById('container' + componentIndex + 'q' + questionIndex).style.backgroundColor = '#FFFFFF';
          }
        }
      }

      if (this.state.epiComponent === 'yes' && typeof component.namespaces !== 'undefined' && component.namespaces !== null) {
        if (document.querySelectorAll('[name=\'c' + componentIndex + 'epi\']:checked').length < 1) {
          document.getElementById('container' + componentIndex + 'epi').style.backgroundColor = '#FEB8B8';
          let offsetTop = document.getElementById('container' + componentIndex + 'epi').offsetTop;
          window.scroll(0, offsetTop);
          return false;
        } else {
          document.getElementById('container' + componentIndex + 'epi').style.backgroundColor = '#FFFFFF';
        }
      }

      componentIndex++;
    }

    return true;
  }

  render () {
    if (this.state.redirect) {
      return <Redirect to='/account#per-forms' />;
    }
    return <PerFormComponent chooseLanguage={this.chooseLanguage}
      changeEpiComponentState={this.changeEpiComponentState}
      sendForm={this.sendForm}
      editForm={this.editForm}
      saveDraft={this.saveDraft}
      state={this.state}
      view={this.props.view}
      mode={this.props.mode} />;
  }
}

if (environment !== 'production') {
  PerForm.propTypes = {
    _sendPerForm: T.func,
    _getPerDocument: T.func,
    _sendPerDraft: T.func,
    _getPerDraftDocument: T.func,
    getPerDraftDocument: T.object,
    user: T.object,
    autosaveOn: T.func,
    nationalSociety: T.number,
    view: T.bool,
    match: T.object,
    perDocument: T.object,
    sendPerFormResponse: T.object,
    mode: T.object
  };
}
