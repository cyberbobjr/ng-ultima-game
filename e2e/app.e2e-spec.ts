import { NgUltimaPage } from './app.po';

describe('ng-ultima App', () => {
  let page: NgUltimaPage;

  beforeEach(() => {
    page = new NgUltimaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
