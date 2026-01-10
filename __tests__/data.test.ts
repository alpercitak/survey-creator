import { beforeAll, describe, expect, it } from '@jest/globals';
import { clearDataStore, surveysAnswer, surveysCreate, surveysGetResult } from '../src/data';
import type { Survey } from '../src/types';

describe('surveysCreate', () => {
  beforeAll(() => {
    clearDataStore();
  });

  it('create survey', async () => {
    const data = {
      question: 'Q1',
      answers: ['A1', 'A2'],
    };
    const x = await surveysCreate(data as any);
    expect(x).toHaveProperty('surveyId');
  });

  it('missing paramter: [question]', async () => {
    const data = {
      answers: ['A1', 'A2'],
    };
    const x = await surveysCreate(data as any);
    expect(x).toHaveProperty('error');
  });

  it('missing paramter: [answers]', async () => {
    const data = {
      question: 'Q1',
    };
    const x = await surveysCreate(data as any);
    expect(x).toHaveProperty('error');
  });

  it('missing items in array: [answers]', async () => {
    const data = {
      question: 'Q1',
      answers: [],
    };
    const x = await surveysCreate(data as any);
    expect(x).toHaveProperty('error');
  });
});

describe('surveysAnswer', () => {
  let survey: Survey;

  beforeAll(async () => {
    clearDataStore();

    const data = {
      question: 'Q1',
      answers: ['A1', 'A2'],
    };
    survey = await surveysCreate(data as any);
  });

  it('answer survey', async () => {
    const result = await surveysAnswer({ surveyId: survey.surveyId, answer: 'A1' });
    expect(result).toEqual('ok');
  });

  it('missing paramter: [answer]', async () => {
    const result = await surveysAnswer({ surveyId: survey.surveyId } as any);
    expect(result).toHaveProperty('error');
  });

  it('missing paramter: [survey]', async () => {
    const result = await surveysAnswer({ surveyId: -999, answer: 'A1' } as any);
    expect(result).toHaveProperty('error');
  });

  it('not in array: [answer]', async () => {
    const result = await surveysAnswer({ surveyId: survey.surveyId, answer: 'a1' });
    expect(result).toHaveProperty('error');
  });
});

describe('surveysGetResult', () => {
  let survey: Survey;

  beforeAll(async () => {
    clearDataStore();

    const data = {
      question: 'Q1',
      answers: ['A1', 'A2'],
    };
    survey = await surveysCreate(data as any);

    await surveysAnswer({ surveyId: survey.surveyId, answer: 'A1' });
    await surveysAnswer({ surveyId: survey.surveyId, answer: 'A2' });
  });

  it('get survey result', async () => {
    const surveyResult = await surveysGetResult(survey.surveyId);
    expect(surveyResult).toHaveProperty('surveyId');
  });

  it('missing paramter: [survey]', async () => {
    const result = await surveysGetResult({ surveyId: -999 } as any);
    expect(result).toHaveProperty('error');
  });
});
