import Button from '../Button';

describe('Button', () => {
  it('should mount', () => {
    cy.mount(<Button>Cliick Me</Button>);
    cy.get('Button').contains('Cliick Me');
  });

  it('when Button is clicked, should call onClick', () => {
    cy.mount(<Button onClick={cy.spy().as('onClick')}>Click Me</Button>);
    cy.get('Button').contains('Click Me').click();
    cy.get('@onClick').should('have.been.called');
  });
});
