import fs from 'fs';
import path from 'path';

type DataStore = {
  surveys: Survey[];
};

type Survey = {
  surveyId: Number;
  question: String;
  answers: String[];
  answersGiven: String[];
};

type SurveyCreateDto = Omit<Survey, 'surveyId' | 'answersGiven'>;

type SurveyAnswerDto = {
  answer: String;
} & Pick<Survey, 'surveyId'>;

type SurveyResult = {
  answer: String;
} & Pick<Survey, 'surveyId'>;

const storageFolderPath = path.join(__dirname, 'storage');
const storageFilePath = path.join(storageFolderPath, 'dataStore.json');

const checkDataStoreFilePath = (): void => {
  if (!fs.existsSync(storageFolderPath)) {
    fs.mkdirSync(storageFolderPath);
  }
  if (!fs.existsSync(storageFilePath)) {
    fs.writeFileSync(storageFilePath, JSON.stringify({ surveys: [] }, null, 2));
  }
};
const getDataStore = (): DataStore => {
  checkDataStoreFilePath();
  const file = fs.readFileSync(storageFilePath, 'utf-8');
  const contents = JSON.parse(file);
  return contents;
};
const setDataStore = (dataStore: DataStore): void => {
  checkDataStoreFilePath();
  fs.writeFileSync(storageFilePath, JSON.stringify(dataStore, null, 2));
};
const clearDataStore = (): void => {
  if (fs.existsSync(storageFilePath)) {
    fs.unlinkSync(storageFilePath);
  }
  if (fs.existsSync(storageFolderPath)) {
    fs.rmdirSync(storageFolderPath);
  }
};

const surveysCreate = (data: SurveyCreateDto): Promise<any> => {
  const dataStore = getDataStore();

  return new Promise((resolve) => {
    if (!data.question) {
      return resolve({ error: { message: `Missing parameter: [question]`, code: 404 } });
    }
    if (!data.answers) {
      return resolve({ error: { message: `Missing parameter: [answers]`, code: 404 } });
    }
    if (!data.answers.length) {
      return resolve({ error: { message: `Missing items in: [answers]`, code: 404 } });
    }

    const survey = {
      surveyId: dataStore.surveys.length + 1,
      ...data,
      answersGiven: [],
    } as Survey;

    dataStore.surveys.push(survey);
    setDataStore(dataStore);

    return resolve({ surveyId: survey.surveyId });
  });
};
const surveysAnswer = ({ surveyId, answer }: SurveyAnswerDto): Promise<any> => {
  const dataStore = getDataStore();
  const survey = dataStore.surveys.find((x) => x.surveyId == surveyId);

  return new Promise((resolve) => {
    if (!answer) {
      return resolve({ error: { message: `Missing parameter: [answer]`, code: 404 } });
    }

    if (!survey) {
      return resolve({ error: { message: `Not found: surveyId: ${surveyId}`, code: 404 } });
    }

    if (!survey.answers.includes(answer)) {
      return resolve({
        error: { message: `Not found: answer: ${answer} in answers of surveyId: ${surveyId}`, code: 404 },
      });
    }

    survey.answersGiven.push(answer);
    setDataStore(dataStore);

    return resolve('ok');
  });
};
const surveysGetResult = (surveyId: Number): Promise<any> => {
  const dataStore = getDataStore();
  const survey = dataStore.surveys.find((x) => x.surveyId == surveyId);

  return new Promise((resolve) => {
    if (!survey) {
      return resolve({ error: { message: `Not found: surveyId: ${surveyId}`, code: 404 } });
    }

    return resolve({ surveyId: surveyId, answersGiven: survey.answersGiven });
  });
};

export { surveysCreate, surveysAnswer, surveysGetResult, Survey, SurveyCreateDto, SurveyResult, clearDataStore };
