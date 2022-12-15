import { beforeAll, afterAll, describe, expect, it } from '@jest/globals';
import { clearDataStore } from '../data';
const request = require('supertest');

describe('app', () => {
  let server: any;
  beforeAll(async () => {
    clearDataStore();
    const mod = await import('../app');
    server = (mod as any).default;
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    }
  });

  it('[/] should return Hello World', async () => {
    const result = await request(server).get('/');
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual({ message: 'Hello World' });
  });

  it('POST [/surveys] should return ok', async () => {
    const result = await request(server)
      .post('/surveys')
      .send({
        question: 'Q1',
        answers: ['A1', 'A2'],
      });
    expect(result.statusCode).toEqual(200);
    expect(result.body).toHaveProperty('surveyId');
  });

  it('POST [/surveys] should return error', async () => {
    const result = await request(server).post('/surveys').send({
      question: 'Q1',
    });
    expect(result.statusCode).not.toEqual(200);
    expect(result.body).toHaveProperty('error');
  });

  it('POST [/surveys/:surveyId] should return ok', async () => {
    const survey = await request(server)
      .post('/surveys')
      .send({
        question: 'Q1',
        answers: ['A1', 'A2'],
      });

    const result = await request(server).post(`/surveys/${survey.body.surveyId}`).send({
      answer: 'A1',
    });

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('ok');
  });

  it('POST [/surveys/:surveyId] should return error', async () => {
    const survey = await request(server)
      .post('/surveys')
      .send({
        question: 'Q1',
        answers: ['A1', 'A2'],
      });

    const result = await request(server).post(`/surveys/${survey.body.surveyId}`).send({
      answer: 'a1',
    });

    expect(result.statusCode).not.toEqual(200);
    expect(result.body).toHaveProperty('error');
  });

  it('GET [/surveys/:surveyId] should return ok', async () => {
    const survey = await request(server)
      .post('/surveys')
      .send({
        question: 'Q1',
        answers: ['A1', 'A2'],
      });
    expect(survey.body).toHaveProperty('surveyId');

    const surveyResult = await request(server).post(`/surveys/${survey.body.surveyId}`).send({
      answer: 'A1',
    });
    expect(surveyResult.body).toEqual('ok');

    const result = await request(server).get(`/surveys/${survey.body.surveyId}`);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toHaveProperty('surveyId');
  });

  it('GET [/surveys/:surveyId] should return error', async () => {
    const result = await request(server).get(`/surveys/0`);
    expect(result.statusCode).not.toEqual(200);
    expect(result.body).toHaveProperty('error');
  });
});
