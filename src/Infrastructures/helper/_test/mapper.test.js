const { mapThreadComments } = require('../mapper');

describe('mapper', () => {
  it('should return correct object', () => {
    const result = mapThreadComments({
      thread: {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-thread-123',
      },
      comments: [],
      replies: [],
    });

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
    const result = mapThreadComments({
      thread: null,
      comments: [],
      replies: [],
    });

    expect(result).toBeNull();
  });

  it('should return correct object & sort comments by date', () => {
    const result = mapThreadComments({
      thread: {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-thread-123',
      },

      comments: [
        {
          id: 'comment-123',
          content: 'comment content',
          date: '2020-01-20T00:00:00.000Z',
          username: 'user-comment-123',
          is_delete: false,
          thread_id: 'thread-123',
        },
        {
          id: 'comment-123',
          content: 'comment content',
          date: '2020-01-01T00:00:00.000Z',
          username: 'user-comment-123',
          is_delete: false,
          thread_id: 'thread-123',
        },
      ],
      replies: [],
    });

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
          replies: [],
        },
        {
          id: 'comment-123',
          content: 'comment content',
          date: '2020-01-20T00:00:00.000Z',
          username: 'user-comment-123',
          replies: [],
        },
      ],
    });
  });

  it('should return correct object & sort replies by date', () => {
    const result = mapThreadComments({
      thread: {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2020-01-01T00:00:00.000Z',
        owner: 'user-thread-123',
      },

      comments: [
        {
          id: 'comment-222',
          content: 'comment content',
          date: '2020-01-20T00:00:00.000Z',
          username: 'user-comment-123',
          is_delete: false,
          thread_id: 'thread-123',
        },
        {
          id: 'comment-123',
          content: 'comment content',
          date: '2020-01-01T00:00:00.000Z',
          username: 'user-comment-123',
          is_delete: false,
          thread_id: 'thread-123',
        },
      ],
      replies: [
        {
          id: 'reply-123',
          content: 'reply content',
          date: '2020-01-20T00:00:00.000Z',
          username: 'user-reply-123',
          is_delete: false,
          comment_id: 'comment-123',
        },
        {
          id: 'reply-123',
          content: 'reply content',
          date: '2020-01-01T00:00:00.000Z',
          username: 'user-reply-123',
          is_delete: false,
          comment_id: 'comment-123',
        },
      ],
    });

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
          replies: [
            {
              id: 'reply-123',
              content: 'reply content',
              date: '2020-01-01T00:00:00.000Z',
              username: 'user-reply-123',
            },
            {
              id: 'reply-123',
              content: 'reply content',
              date: '2020-01-20T00:00:00.000Z',
              username: 'user-reply-123',
            },
          ],
        },
        {
          id: 'comment-222',
          content: 'comment content',
          date: '2020-01-20T00:00:00.000Z',
          username: 'user-comment-123',
          replies: [],
        },
      ],
    });
  });
});
