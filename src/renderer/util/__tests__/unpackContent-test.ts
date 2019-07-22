/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import unpackContent, {Content} from '../unpackContent';

describe('index', () => {
  let content: string;
  let metadata: {
    [key: string]: Content['metadata'];
  };
  let tags: string[];
  let body: string;

  describe('when there is no metadata', () => {
    beforeEach(() => {
      content = 'stuff';
      ({tags, body, ...metadata} = unpackContent(content));
    });

    it('has no tags', () => {
      expect(tags).toEqual([]);
    });

    it('has no other metadata', () => {
      expect(metadata).toEqual({});
    });

    it('has text', () => {
      expect(body).toEqual('stuff');
    });
  });

  describe('when there is a tag', () => {
    beforeEach(() => {
      content = '---\ntags: foo\n---\nThings';
      ({tags, body, ...metadata} = unpackContent(content));
    });

    it('has a single tag', () => {
      expect(tags).toEqual(['foo']);
    });

    it('has no other metadata', () => {
      expect(metadata).toEqual({});
    });

    it('has text', () => {
      expect(body).toEqual('Things');
    });
  });

  describe('when there are multiple tags', () => {
    beforeEach(() => {
      content = '---\ntags: foo bar baz\n---\nContent';
      ({tags, body, ...metadata} = unpackContent(content));
    });

    it('has multiple tags', () => {
      expect(tags).toEqual(['foo', 'bar', 'baz']);
    });

    it('has no other metadata', () => {
      expect(metadata).toEqual({});
    });

    it('has text', () => {
      expect(body).toEqual('Content');
    });
  });

  describe('when there are tags and other metadata', () => {
    beforeEach(() => {
      content =
        '---\n' +
        'tags: foo bar\n' +
        'author: @wincent\n' +
        'date: future\n' +
        '---\n' +
        'Material';
      ({tags, body, ...metadata} = unpackContent(content));
    });

    it('has multiple tags', () => {
      expect(tags).toEqual(['foo', 'bar']);
    });

    it('has other metadata', () => {
      expect(metadata).toEqual({
        author: '@wincent',
        date: 'future',
      });
    });

    it('has text', () => {
      expect(body).toEqual('Material');
    });
  });

  describe('with invalid headers', () => {
    beforeEach(() => {
      // Note the incomplete end-header marker here.
      content = '---\ntags: foo\n--\nThings';
      ({tags, body, ...metadata} = unpackContent(content));
    });

    it('has no tags', () => {
      expect(tags).toEqual([]);
    });

    it('has no other metadata', () => {
      expect(metadata).toEqual({});
    });

    it('has text', () => {
      expect(body).toEqual(content);
    });
  });
});
