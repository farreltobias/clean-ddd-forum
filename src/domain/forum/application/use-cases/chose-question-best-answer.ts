import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswersRepository } from '../repositories/answers-repository'
import { Question } from '../../enterprise/entities/question'
import { QuestionsRepository } from '../repositories/questions-repository'
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

interface ChoseQuestionBestAnswerRequestUseCase {
  answerId: string
  authorId: string
}

type ChoseQuestionBestAnswerResponseUseCase = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    question: Question
  }
>

export class ChoseQuestionBestAnswerUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private answersRepository: AnswersRepository,
  ) {}

  async execute({
    answerId,
    authorId,
  }: ChoseQuestionBestAnswerRequestUseCase): Promise<ChoseQuestionBestAnswerResponseUseCase> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFoundError())
    }

    const question = await this.questionsRepository.findById(
      answer.questionId.toString(),
    )

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    if (question.authorId.toString() !== authorId) {
      return left(new NotAllowedError())
    }

    question.bestAnswerId = new UniqueEntityID(answerId)

    await this.questionsRepository.save(question)

    return right({
      question,
    })
  }
}
