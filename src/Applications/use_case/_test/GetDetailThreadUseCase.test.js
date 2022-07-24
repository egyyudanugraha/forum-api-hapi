const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');

describe('GetDetailThreadUseCase', () => {
  xit('should throw error if use case thread id not found', () => {
    // Arrange
    const useCasePayload = {
      threadId: 'threadId',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(null));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    expect(() => getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.THREAD_NOT_FOUND');
  });

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-xxx', username: 'user-thread-xxx' });
    await ThreadTableTestHelper.addThread({
      id: 'thread-xxx', owner: 'user-xxx', title: 'thread title', body: 'thread body',
    });
    await CommentTableTestHelper.addComment({ id: 'comment-xxx', threadId: 'thread-xxx', userId: 'user-xxx' });

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
          id: 'comment-xxx',
          content: 'comment content',
          date: expect.any(String),
          username: 'user-thread-xxx',
        },
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'thread-xxx' }));
    mockThreadRepository.getDetailThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expecttedResult));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(result).toStrictEqual(expecttedResult);
  });
});
