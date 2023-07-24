import TextInput from '../TextInput';

describe('TextInput', () => {
  it('should mount with label', () => {
    cy.mount(
      <TextInput
        name="name"
        label="Name"
        error="Name is required"
        submitted={false}
      />
    );
    cy.get('._input-label_3lsx4_1').contains('Name');
  });

  it('when there is no value and form is submitted, should show a required message', () => {
    cy.mount(
      <TextInput
        name="name"
        label="Name"
        value={''}
        error="Name is required"
        submitted={true}
        onChange={cy.spy()}
      />
    );
    cy.get('._content_1kztj_15').contains('Name is required');
  });

});
