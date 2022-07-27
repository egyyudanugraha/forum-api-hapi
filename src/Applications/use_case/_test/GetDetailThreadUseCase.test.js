const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');

describe('GetDetailThreadUseCase', () => {
  it('should throw if not contain threadId', () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});

    // Action & Assert
    expect(useCase.execute({}))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw if payload not meet data type specification', () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});

    // Action & Assert
    expect(useCase.execute({ threadId: 121 }))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if use case thread id not found', () => {
    // Arrange
    const useCasePayload = {
      threadId: 'threadId',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    expect(() => getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND');
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('threadId');
  });

  it('should return replies mapped', () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});
    const replies = [
      {
        id: 'replyId',
        content: 'replyContent',
        date: 'replyDate',
        username: 'replyUsername',
        is_delete: false,
      },
      {
        id: 'replyId2',
        content: 'replyContent2',
        date: 'replyDate2',
        username: 'replyUsername2',
        is_delete: true,
      },
    ];

    const expectedReplies = [
      {
        id: 'replyId',
        content: 'replyContent',
        date: 'replyDate',
        username: 'replyUsername',
      },
      {
        id: 'replyId2',
        content: '**balasan telah dihapus**',
        date: 'replyDate2',
        username: 'replyUsername2',
      },
    ];

    // Action
    const result = useCase._repliesMapping(replies);

    // Assert
    expect(result).toStrictEqual(expectedReplies);
  });

  it('should return comments mapped', async () => {
    // Arrange
    const comments = [
      {
        id: 'commentId',
        content: 'commentContent',
        date: 'commentDate',
        username: 'commentUsername',
        is_delete: true,
      },
      {
        id: 'commentId2',
        content: 'commentContent2',
        date: 'commentDate2',
        username: 'commentUsername2',
        is_delete: false,
      },
    ];

    const expectedComments = [
      {
        id: 'commentId',
        content: '**komentar telah dihapus**',
        date: 'commentDate',
        username: 'commentUsername',
        replies: [],
      },
      {
        id: 'commentId2',
        content: 'commentContent2',
        date: 'commentDate2',
        username: 'commentUsername2',
        replies: [],
      },
    ];

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.findReplyByCommentId = jest.fn()
      .mockImplementation(() => ([]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await Promise.all(getDetailThreadUseCase._commentsMapping(comments));

    // Assert
    expect(result).toStrictEqual(expectedComments);
    expect(mockReplyRepository.findReplyByCommentId).toHaveBeenCalledTimes(2);
  });

  it('should return thread mapped with comment and replies', async () => {
    // Arrange
    const thread = {
      id: 'threadId',
      title: 'threadTitle',
      content: 'threadContent',
      date: 'threadDate',
      username: 'threadUsername',
    };

    const comments = [
      {
        id: 'commentId',
        content: 'commentContent',
        date: 'commentDate',
        username: 'commentUsername',
        is_delete: true,
      },
      {
        id: 'commentId2',
        content: 'commentContent2',
        date: 'commentDate2',
        username: 'commentUsername2',
        is_delete: false,
      },
    ];

    const expectedThread = {
      id: 'threadId',
      title: 'threadTitle',
      content: 'threadContent',
      date: 'threadDate',
      username: 'threadUsername',
      comments: [
        {
          id: 'commentId',
          content: '**komentar telah dihapus**',
          date: 'commentDate',
          username: 'commentUsername',
          replies: [
            {
              id: 'replyId',
              content: 'replyContent',
              date: 'replyDate',
              username: 'replyUsername',
            },
            {
              id: 'replyId2',
              content: '**balasan telah dihapus**',
              date: 'replyDate2',
              username: 'replyUsername2',
            },
          ],
        },
        {
          id: 'commentId2',
          content: 'commentContent2',
          date: 'commentDate2',
          username: 'commentUsername2',
          replies: [
            {
              id: 'replyId',
              content: 'replyContent',
              date: 'replyDate',
              username: 'replyUsername',
            },
            {
              id: 'replyId2',
              content: '**balasan telah dihapus**',
              date: 'replyDate2',
              username: 'replyUsername2',
            },
          ],
        },
      ],
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockReplyRepository.findReplyByCommentId = jest.fn()
      .mockImplementation(() => ([
        {
          id: 'replyId',
          content: 'replyContent',
          date: 'replyDate',
          username: 'replyUsername',
        },
        {
          id: 'replyId2',
          content: '**balasan telah dihapus**',
          date: 'replyDate2',
          username: 'replyUsername2',
        },
      ]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getDetailThreadUseCase._combineTheradWithCommentReplies({
      thread,
      comments,
    });

    // Assert
    expect(result).toStrictEqual(expectedThread);
    expect(mockReplyRepository.findReplyByCommentId).toHaveBeenCalledTimes(2);
  });

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-xxx',
    };
    const expecttedResult = new GetThread({
      id: 'thread-xxx',
      title: 'thread title',
      body: 'thread body',
      date: expect.any(String),
      username: 'user-thread-xxx',
      comments: [
        {
          id: 'comment-xxx-xx',
          content: '**komentar telah dihapus**',
          date: expect.any(String),
          username: 'user-thread-xxx',
          replies: [
            {
              id: 'reply-xxx-xx',
              content: 'reply content',
              date: expect.any(String),
              username: 'user-thread-xxx',
            },
          ],
        },
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-xxx' }));
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-xxx',
        title: 'thread title',
        body: 'thread body',
        date: expect.any(String),
        username: 'user-thread-xxx',
      }));
    mockCommentRepository.findCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-xxx-xx',
          content: 'comment content',
          date: expect.any(String),
          username: 'user-thread-xxx',
          is_delete: true,
        },
      ]));
    mockReplyRepository.findReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-xxx-xx',
          content: 'reply content',
          date: expect.any(String),
          username: 'user-thread-xxx',
          is_delete: false,
        },
      ]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expecttedResult);
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('thread-xxx');
    expect(mockThreadRepository.getDetailThreadById).toHaveBeenCalledWith('thread-xxx');
    expect(mockCommentRepository.findCommentByThreadId).toHaveBeenCalledWith('thread-xxx');
    expect(mockReplyRepository.findReplyByCommentId).toHaveBeenCalledWith('comment-xxx-xx');
  });
});
