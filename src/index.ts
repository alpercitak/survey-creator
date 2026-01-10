import express, { type Request, type Response } from 'express';
import type { SurveyCreateDto, SurveyResult } from './types';
import { surveysCreate, surveysGetResult, surveysAnswer } from './data';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ message: 'Hello World' }).end();
});

app.post('/surveys', async (req: Request<{}, {}, SurveyCreateDto, {}>, res: Response) => {
  const response = await surveysCreate(req.body);
  let code = 200;
  if (response && response.error) code = response.error.code;
  return res.status(code).json(response).end();
});

app.post('/surveys/:surveyId', async (req: Request<{ surveyId: number }, {}, SurveyResult, {}>, res: Response) => {
  const response = await surveysAnswer({ surveyId: req.params.surveyId, answer: req.body.answer });
  let code = 200;
  if (response && response.error) code = response.error.code;
  return res.status(code).json(response).end();
});

app.get('/surveys/:surveyId', async (req: Request, res: Response) => {
  const response = await surveysGetResult(parseInt(req.params.surveyId));
  let code = 200;
  if (response && response.error) code = response.error.code;
  return res.status(code).json(response).end();
});

const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = app.listen(port, () => {
  console.log(`survey-creator started on ${new Date()}: http://localhost:${port}`);
});

export default server;
