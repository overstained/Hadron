import { CollaborativeEditorPage } from './app.po';

describe('collaborative-editor App', function() {
  let page: CollaborativeEditorPage;

  beforeEach(() => {
    page = new CollaborativeEditorPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
