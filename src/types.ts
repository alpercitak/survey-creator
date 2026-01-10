export type DataStore = {
  surveys: Survey[];
};

export type Survey = {
  surveyId: number;
  question: string;
  answers: Array<string>;
  answersGiven: Array<string>;
};

export type SurveyCreateDto = Omit<Survey, 'surveyId' | 'answersGiven'>;

export type SurveyAnswerDto = {
  answer: string;
} & Pick<Survey, 'surveyId'>;

export type SurveyResult = {
  answer: string;
} & Pick<Survey, 'surveyId'>;
