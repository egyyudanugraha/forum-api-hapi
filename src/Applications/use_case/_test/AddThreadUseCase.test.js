const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    await UsersTableTestHelper.addUser({ id: 'user-232', username: 'testaddthread' });
    const useCasePayload = new AddThread({
      title: 'thread title',
      body: 'thread body',
    });
    const expecttedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-232',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expecttedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const response = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(response).toStrictEqual(expecttedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(useCasePayload);
  });
});
