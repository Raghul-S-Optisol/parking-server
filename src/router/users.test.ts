import request from 'supertest';
import {app} from 'server';

describe('App endpoints', () => {
  test('GET /user/select_location', async () => {
    const response = await request(app).get('/user/select_location?location=London');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ location: 'London', slotNumber: 1, startTime: new Date(), endTime: new Date(), availability: 1 }]);
  });

  
});