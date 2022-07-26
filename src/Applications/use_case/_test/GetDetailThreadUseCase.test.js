const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');

describe('GetDetailThreadUseCase', () => {
  it('should throw if not contain threadId', async () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});

    // Action & Assert
    await expect(useCase.execute({}))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID');
  });

  it('should throw if payload not meet data type specification', async () => {
    // Arrange
    const useCase = new GetDetailThreadUseCase({});

    // Action & Assert
    await expect(useCase.execute({ threadId: 121 }))
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
          content: 'comment content',
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
        },
      ]));
    mockReplyRepository.findReplyByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-xxx-xx',
          content: 'reply content',
          date: expect.any(String),
          username: 'user-thread-xxx',
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
