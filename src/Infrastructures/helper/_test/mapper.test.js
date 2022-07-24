const { mapThreadComments } = require('../mapper');

describe('mapper', () => {
  it('should return correct object', () => {
    const result = mapThreadComments({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2020-01-01T00:00:00.000Z',
      owner: 'user-thread-123',
    }, []);

    expect(result).toStrictEqual({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2020-01-01T00:00:00.000Z',
      owner: 'user-thread-123',
      comments: [],
    });
  });

  it('should return null if thread null', () => {
    const result = mapThreadComments(null, []);

    expect(result).toBeNull();
  });

  it('should return correct object & sort comments by date', () => {
    const result = mapThreadComments({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2020-01-01T00:00:00.000Z',
      owner: 'user-thread-123',
    }, [
      {
        id: 'comment-123',
        content: 'comment content',
        date: '2020-01-20T00:00:00.000Z',
        username: 'user-comment-123',
      },
      {
        id: 'comment-123',
        content: 'comment content',
        date: '2020-01-01T00:00:00.000Z',
        username: 'user-comment-123',
      },
    ]);

    expect(result).toStrictEqual({
      id: 'thread-123',
      title: 'thread title',
      body: 'thread body',
      date: '2020-01-01T00:00:00.000Z',
      owner: 'user-thread-123',
      comments: [
        {
          id: 'comment-123',
          content: 'comment content',
          date: '2020-01-01T00:00:00.000Z',
          username: 'user-comment-123',
        },
        {
          id: 'comment-123',
          content: 'comment content',
          date: '2020-01-20T00:00:00.000Z',
          username: 'user-comment-123',
        },
      ],
    });
  });
});
